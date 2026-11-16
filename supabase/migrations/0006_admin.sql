-- =====================================================================
-- Panel admin: ringkasan, pemesanan, pengguna, pemandu, penarikan dana, katalog, aturan bisnis.
-- Jalankan SETELAH 0001, 0003, 0005. Aman dijalankan berulang kali.
-- Semua fungsi admin_* memeriksa role 'admin' di server; tidak bisa dipanggil akun biasa.
-- =====================================================================

alter table withdrawals add column if not exists processed_at timestamptz;
alter table withdrawals add column if not exists admin_note text;

-- ---------- Admin boleh mengelola katalog & aturan ----------
do $$
declare t text;
begin
  foreach t in array array['meeting_points','transport_options','food_items','food_variants','food_sides',
                           'vouchers','pricing_tiers','cancellation_policies','app_settings','umkm_partners']
  loop
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "admin all" on %I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- ---------- Bucket gambar destinasi (publik dibaca, hanya admin yang menulis) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('destination-images', 'destination-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dest img admin insert" on storage.objects;
create policy "dest img admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'destination-images' and public.is_admin());
drop policy if exists "dest img admin update" on storage.objects;
create policy "dest img admin update" on storage.objects for update to authenticated
  using (bucket_id = 'destination-images' and public.is_admin());
drop policy if exists "dest img admin delete" on storage.objects;
create policy "dest img admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'destination-images' and public.is_admin());

-- ---------- Ringkasan ----------
create or replace function admin_dashboard() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare fee numeric; res jsonb;
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  select coalesce((select (value)::numeric from app_settings where key = 'platform_fee_percent'), 10) into fee;
  select jsonb_build_object(
    'tourists',        (select count(*) from profiles where role = 'wisatawan'),
    'guides_approved', (select count(*) from guides where verification = 'approved'),
    'guides_active',   (select count(*) from guides where verification = 'approved' and is_available),
    'guides_pending',  (select count(*) from guides where verification = 'pending'),
    'bookings_total',  (select count(*) from bookings),
    'bookings_month',  (select count(*) from bookings where created_at >= date_trunc('month', now())),
    'gmv_month',       (select coalesce(sum(total_amount), 0) from bookings
                         where status in ('escrow_locked','confirmed_by_guide','in_tour','completed')
                           and created_at >= date_trunc('month', now())),
    'gmv_total',       (select coalesce(sum(total_amount), 0) from bookings
                         where status in ('escrow_locked','confirmed_by_guide','in_tour','completed')),
    'fee_earned',      (select coalesce(sum(round(total_amount * fee / 100.0)), 0) from bookings where status = 'completed'),
    'escrow_held',     (select coalesce(sum(total_amount), 0) from bookings
                         where status in ('escrow_locked','confirmed_by_guide','in_tour')),
    'open_tickets',    (select count(*) from support_tickets where status = 'open'),
    'pending_withdrawals',        (select count(*) from withdrawals where status = 'requested'),
    'pending_withdrawals_amount', (select coalesce(sum(amount), 0) from withdrawals where status = 'requested'),
    'by_status', (select coalesce(jsonb_object_agg(s.status, s.n), '{}'::jsonb)
                    from (select status::text as status, count(*) as n from bookings group by status) s),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('date', to_char(g.d, 'YYYY-MM-DD'),
                                                          'bookings', coalesce(b.n, 0), 'amount', coalesce(b.amt, 0))
                                        order by g.d), '[]'::jsonb)
                from generate_series(current_date - 13, current_date, interval '1 day') as g(d)
                left join (select created_at::date as day, count(*) as n, sum(total_amount) as amt
                             from bookings where status not in ('cancelled','expired','pending_payment')
                            group by 1) b on b.day = g.d::date)
  ) into res;
  return res;
end $$;

-- ---------- Pemesanan ----------
create or replace function admin_list_bookings(p_status text default null, p_search text default null, p_limit int default 100)
returns table (id uuid, code text, status text, tour_date date, participants int, total_amount int,
               created_at timestamptz, destination_title text, tourist_name text, tourist_email text,
               guide_name text, payment_method text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  return query
  select b.id, b.code, b.status::text, b.tour_date, b.participants, b.total_amount, b.created_at,
         d.title, tp.full_name, u.email::text, gp.full_name,
         (select p.method from payments p where p.booking_id = b.id order by p.created_at desc limit 1)
    from bookings b
    join destinations d on d.id = b.destination_id
    join profiles tp on tp.id = b.tourist_id
    join auth.users u on u.id = b.tourist_id
    join profiles gp on gp.id = b.guide_id
   where (coalesce(p_status, '') = '' or b.status::text = p_status)
     and (coalesce(p_search, '') = ''
          or b.code ilike '%' || p_search || '%' or tp.full_name ilike '%' || p_search || '%'
          or gp.full_name ilike '%' || p_search || '%' or d.title ilike '%' || p_search || '%'
          or u.email ilike '%' || p_search || '%')
   order by b.created_at desc
   limit least(greatest(coalesce(p_limit, 100), 1), 500);
end $$;

-- ---------- Pengguna ----------
create or replace function admin_list_users(p_search text default null, p_role text default null, p_limit int default 100)
returns table (id uuid, email text, full_name text, role text, phone text, points int,
               is_verified boolean, created_at timestamptz, bookings_count bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  return query
  select p.id, u.email::text, p.full_name, p.role::text, p.phone, p.points, p.is_verified, p.created_at,
         (select count(*) from bookings b where b.tourist_id = p.id or b.guide_id = p.id)
    from profiles p join auth.users u on u.id = p.id
   where (coalesce(p_role, '') = '' or p.role::text = p_role)
     and (coalesce(p_search, '') = '' or p.full_name ilike '%' || p_search || '%' or u.email ilike '%' || p_search || '%'
          or coalesce(p.phone, '') ilike '%' || p_search || '%')
   order by p.created_at desc
   limit least(greatest(coalesce(p_limit, 100), 1), 500);
end $$;

-- Hanya wisatawan <-> admin. Role pemandu hanya lewat verifikasi; tidak boleh mengubah diri sendiri.
create or replace function admin_set_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = public as $$
declare current_role_name text;
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  if p_role not in ('wisatawan', 'admin') then raise exception 'Role hanya boleh wisatawan atau admin'; end if;
  if p_user = auth.uid() then raise exception 'Tidak dapat mengubah role akun sendiri'; end if;
  select role::text into current_role_name from profiles where id = p_user;
  if not found then raise exception 'Pengguna tidak ditemukan'; end if;
  if current_role_name in ('pemandu', 'umkm') then
    raise exception 'Akun pemandu/UMKM tidak dapat diubah dari sini';
  end if;
  update profiles set role = p_role::user_role where id = p_user;
end $$;

-- ---------- Pemandu ----------
create or replace function admin_list_guides()
returns table (id uuid, name text, email text, phone text, verification text, is_available boolean,
               rating numeric, reviews int, completed int, price int, balance bigint, base_location text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  return query
  select g.id, p.full_name, u.email::text, p.phone, g.verification::text, g.is_available,
         g.rating_avg, g.reviews_count, g.completed_tours, g.price_per_day,
         coalesce((select sum(w.amount) from wallet_transactions w where w.guide_id = g.id), 0)::bigint,
         g.base_location
    from guides g join profiles p on p.id = g.id join auth.users u on u.id = g.id
   order by (g.verification = 'pending') desc, p.full_name;
end $$;

create or replace function admin_set_guide_active(p_guide uuid, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  update guides set is_available = p_active where id = p_guide;
  if not found then raise exception 'Pemandu tidak ditemukan'; end if;
end $$;

-- ---------- Penarikan dana ----------
create or replace function admin_list_withdrawals(p_status text default null)
returns table (id uuid, guide_id uuid, guide_name text, amount int, bank_name text, account_holder text,
               account_number text, status text, created_at timestamptz, processed_at timestamptz, admin_note text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  return query
  select w.id, w.guide_id, p.full_name, w.amount, w.bank_name, w.account_holder, w.account_number_enc,
         w.status, w.created_at, w.processed_at, w.admin_note
    from withdrawals w join profiles p on p.id = w.guide_id
   where coalesce(p_status, '') = '' or w.status = p_status
   order by (w.status = 'requested') desc, w.created_at desc
   limit 300;
end $$;

-- Setujui = sudah ditransfer manual oleh admin. Tolak = dana dikembalikan ke dompet pemandu.
create or replace function admin_process_withdrawal(p_id uuid, p_approve boolean, p_note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare w withdrawals;
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;
  select * into w from withdrawals where id = p_id for update;
  if not found then raise exception 'Permintaan tidak ditemukan'; end if;
  if w.status <> 'requested' then raise exception 'Permintaan ini sudah diproses'; end if;
  if not p_approve and coalesce(btrim(p_note), '') = '' then raise exception 'Alasan penolakan wajib diisi'; end if;

  update withdrawals
     set status = case when p_approve then 'processed' else 'rejected' end,
         processed_at = now(), admin_note = nullif(btrim(coalesce(p_note, '')), '')
   where id = p_id;

  if not p_approve then
    insert into wallet_transactions (guide_id, amount, kind) values (w.guide_id, w.amount, 'adjustment');
  end if;

  insert into notifications (user_id, title, body, link_screen)
  values (w.guide_id,
          case when p_approve then 'Penarikan dana diproses' else 'Penarikan dana ditolak' end,
          case when p_approve then rupiah(w.amount) || ' telah ditransfer ke rekening Anda.'
               else rupiah(w.amount) || ' dikembalikan ke dompet. Alasan: ' || btrim(p_note) end,
          'guide-dashboard');
end $$;

-- ---------- Aturan bisnis (atomik + divalidasi) ----------
create or replace function admin_save_rules(p_settings jsonb, p_tiers jsonb, p_policies jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare k text; v jsonb; n numeric; t jsonb; seen int[] := '{}'; mp int; dp int;
begin
  if not is_admin() then raise exception 'Hanya admin'; end if;

  -- pengaturan umum (hanya kunci yang diizinkan, dengan batas wajar)
  for k, v in select * from jsonb_each(coalesce(p_settings, '{}'::jsonb)) loop
    if k = 'payment_mode' then
      if v #>> '{}' not in ('midtrans', 'demo') then raise exception 'payment_mode harus midtrans atau demo'; end if;
    elsif k in ('platform_fee_percent', 'extra_guide_fee', 'pax_per_guide', 'guide_confirm_hours') then
      if jsonb_typeof(v) <> 'number' then raise exception '% harus berupa angka', k; end if;
      n := (v #>> '{}')::numeric;
      if (k = 'platform_fee_percent' and (n < 0 or n > 50))
         or (k = 'extra_guide_fee' and (n < 0 or n > 10000000))
         or (k = 'pax_per_guide' and (n < 1 or n > 100))
         or (k = 'guide_confirm_hours' and (n < 1 or n > 168)) then
        raise exception 'Nilai % di luar batas yang diizinkan', k;
      end if;
    else
      raise exception 'Pengaturan tidak dikenal: %', k;
    end if;
    insert into app_settings (key, value) values (k, v)
    on conflict (key) do update set value = excluded.value;
  end loop;

  -- diskon rombongan
  if p_tiers is not null then
    if jsonb_typeof(p_tiers) <> 'array' or jsonb_array_length(p_tiers) = 0 then raise exception 'Diskon rombongan tidak boleh kosong'; end if;
    for t in select * from jsonb_array_elements(p_tiers) loop
      mp := (t->>'min_pax')::int; dp := (t->>'discount_percent')::int;
      if mp is null or mp < 1 then raise exception 'Jumlah peserta minimal harus >= 1'; end if;
      if dp is null or dp < 0 or dp > 90 then raise exception 'Diskon harus 0-90 persen'; end if;
      if coalesce(btrim(t->>'label'), '') = '' then raise exception 'Label diskon wajib diisi'; end if;
      if mp = any(seen) then raise exception 'Jumlah peserta minimal duplikat: %', mp; end if;
      seen := seen || mp;
    end loop;
    if not (1 = any(seen)) then raise exception 'Harus ada tingkat untuk 1 peserta'; end if;
    delete from pricing_tiers where true;
    insert into pricing_tiers (min_pax, discount_percent, label)
    select (x->>'min_pax')::int, (x->>'discount_percent')::int, btrim(x->>'label') from jsonb_array_elements(p_tiers) x;
  end if;

  -- kebijakan refund
  if p_policies is not null then
    seen := '{}';
    if jsonb_typeof(p_policies) <> 'array' or jsonb_array_length(p_policies) = 0 then raise exception 'Kebijakan refund tidak boleh kosong'; end if;
    for t in select * from jsonb_array_elements(p_policies) loop
      mp := (t->>'min_days_before')::int; dp := (t->>'refund_percent')::int;
      if mp is null or mp < 0 then raise exception 'Jumlah hari tidak valid'; end if;
      if dp is null or dp < 0 or dp > 100 then raise exception 'Refund harus 0-100 persen'; end if;
      if mp = any(seen) then raise exception 'Jumlah hari duplikat: %', mp; end if;
      seen := seen || mp;
    end loop;
    if not (0 = any(seen)) then raise exception 'Harus ada aturan untuk hari-H (0 hari)'; end if;
    delete from cancellation_policies where true;
    insert into cancellation_policies (min_days_before, refund_percent)
    select (x->>'min_days_before')::int, (x->>'refund_percent')::int from jsonb_array_elements(p_policies) x;
  end if;
end $$;
