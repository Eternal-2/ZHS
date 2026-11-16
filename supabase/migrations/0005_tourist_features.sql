-- =====================================================================
-- Fitur wisatawan: notifikasi otomatis, tiket bantuan, mode pembayaran uji,
-- pembatas laju chat AI, ulasan publik, dan bucket foto profil.
-- Jalankan SETELAH 0001 dan 0003. Aman dijalankan berulang kali.
-- =====================================================================

-- ---------- 1. Mode pembayaran ----------
-- 'midtrans' (default, produksi) atau 'demo' (uji coba TANPA payment gateway).
-- Aktifkan demo:  update app_settings set value = '"demo"' where key = 'payment_mode';
-- Kembalikan:     update app_settings set value = '"midtrans"' where key = 'payment_mode';
insert into app_settings (key, value) values ('payment_mode', '"midtrans"') on conflict (key) do nothing;

create or replace function payment_mode() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select value #>> '{}' from app_settings where key = 'payment_mode'), 'midtrans')
$$;

create or replace function demo_pay_booking(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b bookings; hours int;
begin
  if payment_mode() <> 'demo' then raise exception 'Mode pembayaran uji tidak aktif'; end if;
  select * into b from bookings
   where id = p_booking and tourist_id = auth.uid() and status = 'pending_payment' for update;
  if not found then raise exception 'Booking tidak menunggu pembayaran'; end if;
  select (value)::int into hours from app_settings where key = 'guide_confirm_hours';
  insert into payments (booking_id, method, status, amount, paid_at, provider_ref)
  values (b.id, 'DEMO', 'paid', b.total_amount, now(), 'DEMO-' || b.code);
  update bookings
     set status = 'escrow_locked',
         guide_confirm_deadline = now() + make_interval(hours => coalesce(hours, 24))
   where id = b.id;
end $$;

-- ---------- 2. Notifikasi otomatis ----------
alter table notifications add column if not exists ref_id uuid;      -- id booking / tiket terkait
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

-- user hanya boleh menandai dibaca; isi notifikasi tidak boleh diubah dari browser
revoke update on notifications from anon, authenticated;
grant update (is_read) on notifications to authenticated;

create or replace function rupiah(n numeric) returns text language sql immutable as $$
  select 'Rp ' || replace(to_char(coalesce(n,0), 'FM999,999,999,999'), ',', '.')
$$;

create or replace function notify_booking_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare dest text;
begin
  if new.status is not distinct from old.status then return new; end if;
  select title into dest from destinations where id = new.destination_id;

  if new.status = 'escrow_locked' then
    insert into notifications (user_id, title, body, link_screen, ref_id) values
      (new.tourist_id, 'Pembayaran diterima', rupiah(new.total_amount) || ' untuk ' || dest || ' aman di escrow ZHS. Menunggu konfirmasi pemandu.', 'booking-detail', new.id),
      (new.guide_id, 'Permintaan tur baru', new.participants || ' peserta · ' || dest || ' · ' || to_char(new.tour_date, 'DD-MM-YYYY'), 'guide-dashboard', new.id);
  elsif new.status = 'confirmed_by_guide' then
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (new.tourist_id, 'Booking dikonfirmasi', 'Pemandu telah mengonfirmasi tur ke ' || dest || '. Tunjukkan E-Tiket di meeting point.', 'booking-detail', new.id);
  elsif new.status = 'in_tour' then
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (new.tourist_id, 'Tur dimulai', 'Check-in berhasil. Selamat menikmati ' || dest || '!', 'live-tour', new.id);
  elsif new.status = 'completed' then
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (new.guide_id, 'Tur selesai', 'Dana escrow booking ' || new.code || ' dicairkan ke dompet Anda.', 'guide-dashboard', new.id);
  elsif new.status = 'cancelled' then
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (new.tourist_id, 'Booking dibatalkan',
            case when coalesce(new.refund_amount,0) > 0 then 'Refund ' || rupiah(new.refund_amount) || ' akan diproses.' else 'Booking ' || new.code || ' dibatalkan.' end,
            'booking-detail', new.id);
    if old.status in ('escrow_locked', 'confirmed_by_guide') then
      insert into notifications (user_id, title, body, link_screen, ref_id)
      values (new.guide_id, 'Booking dibatalkan wisatawan', 'Booking ' || new.code || ' (' || dest || ') dibatalkan.', 'guide-dashboard', new.id);
    end if;
  elsif new.status = 'expired' then
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (new.tourist_id, 'Booking kedaluwarsa',
            case when old.status = 'pending_payment' then 'Waktu pembayaran booking ' || new.code || ' habis.'
                 else 'Pemandu tidak merespons tepat waktu. Dana akan dikembalikan.' end,
            'booking-detail', new.id);
  end if;
  return new;
end $$;

drop trigger if exists bookings_notify on bookings;
create trigger bookings_notify after update of status on bookings
  for each row execute function notify_booking_status();

create or replace function notify_points() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, title, body, link_screen)
  values (new.user_id,
          case when new.amount >= 0 then 'Poin bertambah' else 'Poin ditukar' end,
          case when new.amount >= 0 then '+' || new.amount || ' poin: ' || new.reason else new.amount || ' poin: ' || new.reason end,
          'voucher');
  return new;
end $$;

drop trigger if exists points_notify on points_transactions;
create trigger points_notify after insert on points_transactions
  for each row execute function notify_points();

-- ---------- 3. Tiket bantuan ----------
alter table support_tickets add column if not exists source text not null default 'help_center';
alter table support_tickets add column if not exists updated_at timestamptz not null default now();
update support_tickets set status = 'open' where status not in ('open', 'answered', 'closed');
alter table support_tickets drop constraint if exists support_tickets_status_check;
alter table support_tickets add constraint support_tickets_status_check check (status in ('open', 'answered', 'closed'));

drop policy if exists "ticket own" on support_tickets;
drop policy if exists "ticket read" on support_tickets;
drop policy if exists "ticket admin update" on support_tickets;
create policy "ticket read" on support_tickets for select using (user_id = auth.uid() or is_admin());
create policy "ticket admin update" on support_tickets for update using (is_admin()) with check (is_admin());

drop policy if exists "tmsg own" on support_messages;
drop policy if exists "tmsg read" on support_messages;
drop policy if exists "tmsg insert" on support_messages;
create policy "tmsg read" on support_messages for select using (
  exists (select 1 from support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin())));
create policy "tmsg insert" on support_messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from support_tickets t where t.id = ticket_id
       and ((t.user_id = auth.uid() and t.status <> 'closed') or is_admin())));

create or replace function create_support_ticket(p_subject text, p_body text, p_source text default 'help_center')
returns uuid
language plpgsql security definer set search_path = public as $$
declare tid uuid;
begin
  if auth.uid() is null then raise exception 'Harus login'; end if;
  if coalesce(btrim(p_subject), '') = '' or coalesce(btrim(p_body), '') = '' then
    raise exception 'Subjek dan pesan wajib diisi';
  end if;
  if (select count(*) from support_tickets where user_id = auth.uid() and status <> 'closed') >= 5 then
    raise exception 'Anda memiliki terlalu banyak tiket yang masih terbuka';
  end if;
  insert into support_tickets (user_id, subject, source)
  values (auth.uid(), left(btrim(p_subject), 120), case when p_source in ('help_center','ai_handoff') then p_source else 'help_center' end)
  returning id into tid;
  insert into support_messages (ticket_id, sender_id, body) values (tid, auth.uid(), left(btrim(p_body), 4000));
  return tid;
end $$;

create or replace function on_support_message() returns trigger
language plpgsql security definer set search_path = public as $$
declare t support_tickets;
begin
  select * into t from support_tickets where id = new.ticket_id;
  if new.sender_id = t.user_id then
    update support_tickets set status = 'open', updated_at = now() where id = t.id and status <> 'closed';
  else
    update support_tickets set status = case when status = 'closed' then 'closed' else 'answered' end, updated_at = now()
     where id = t.id;
    insert into notifications (user_id, title, body, link_screen, ref_id)
    values (t.user_id, 'Balasan dari Tim Bantuan', left(new.body, 120), 'admin-chat', t.id);
  end if;
  return new;
end $$;

drop trigger if exists support_message_after on support_messages;
create trigger support_message_after after insert on support_messages
  for each row execute function on_support_message();

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'support_messages') then
    alter publication supabase_realtime add table support_messages;
  end if;
end $$;

-- ---------- 4. Pembatas laju chat AI (dipanggil Edge Function dengan service role) ----------
create table if not exists ai_rate_limits (
  key text not null,
  bucket timestamptz not null,
  hits int not null default 0,
  primary key (key, bucket)
);
alter table ai_rate_limits enable row level security;   -- tanpa kebijakan: tidak terbaca dari browser

create or replace function ai_rate_check(p_key text, p_limit int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = public as $$
declare b timestamptz; n int;
begin
  b := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into ai_rate_limits (key, bucket, hits) values (p_key, b, 1)
  on conflict (key, bucket) do update set hits = ai_rate_limits.hits + 1
  returning hits into n;
  if random() < 0.02 then delete from ai_rate_limits where bucket < now() - interval '1 day'; end if;
  return n <= p_limit;
end $$;
revoke execute on function ai_rate_check(text, int, int) from public, anon, authenticated;
grant execute on function ai_rate_check(text, int, int) to service_role;

-- ---------- 5. Ulasan publik (hanya nama depan penulis) ----------
create or replace view public_reviews as
  select r.id, r.destination_id, r.guide_id, r.rating, r.comment, r.created_at,
         split_part(p.full_name, ' ', 1) as reviewer_name, p.avatar_url as reviewer_avatar
  from reviews r join profiles p on p.id = r.tourist_id;
grant select on public_reviews to anon, authenticated;

-- ---------- 6. Bucket foto profil (publik, 2 MB) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar upload own" on storage.objects;
create policy "avatar upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar delete own" on storage.objects;
create policy "avatar delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
