-- =====================================================================
-- Zam Zam Hidden Spot (ZHS) - Skema Supabase (Postgres)
-- Jalankan di Supabase > SQL Editor. Urutan sudah benar dari atas ke bawah.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- ENUM ----------
create type user_role        as enum ('wisatawan','pemandu','umkm','admin');
create type verify_status    as enum ('draft','pending','approved','rejected','need_fix');
create type booking_status   as enum ('pending_payment','escrow_locked','confirmed_by_guide',
                                      'in_tour','completed','cancelled','disputed','expired');
create type payment_status   as enum ('pending','paid','failed','expired','refunded');
create type doc_type         as enum ('ktp','selfie','cv','certificate','portfolio');
create type dispute_status   as enum ('open','under_review','resolved_tourist','resolved_guide','closed');

-- ---------- PENGATURAN & ATURAN BISNIS (biar tidak hardcode di frontend) ----------
create table app_settings (
  key   text primary key,
  value jsonb not null
);
insert into app_settings values
  ('platform_fee_percent', '10'),            -- ASUMSI: sesuaikan dengan model bisnis Anda
  ('extra_guide_fee',      '150000'),
  ('pax_per_guide',        '10'),
  ('guide_confirm_hours',  '24');

create table pricing_tiers (               -- diskon rombongan
  min_pax int primary key,
  discount_percent int not null,
  label text not null
);
insert into pricing_tiers values
  (1, 0,  'Tarif Reguler (1-3 Pax)'),
  (4, 10, 'Grup Sedang / Keluarga (4-9 Pax)'),
  (10,20, 'Paket Rombongan Besar (10-19 Pax)'),
  (20,30, 'Grup Super Rombongan (20+ Pax)');

create table cancellation_policies (       -- kebijakan refund
  min_days_before int primary key,
  refund_percent int not null
);
-- CATATAN: di kode Anda angkanya tidak konsisten (mockData 100/70/30 vs geminiService 100/50/0). Pilih satu.
insert into cancellation_policies values (3,100),(1,50),(0,0);

-- ---------- PROFIL (1 baris per akun auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'wisatawan',
  full_name text not null,
  username text unique,
  phone text,
  avatar_url text,
  gender text,
  birth_date date,
  nationality text,
  address text,
  city text,
  country text default 'Indonesia',
  languages text[] default '{}',
  travel_preferences text[] default '{}',
  emergency_name text,
  emergency_phone text,
  points int not null default 0 check (points >= 0),
  level text default 'Explorer',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- Buat profil otomatis saat user daftar. Role SELALU wisatawan; naik jadi pemandu lewat proses verifikasi.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
          new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- PEMANDU ----------
create table guides (
  id uuid primary key references profiles(id) on delete cascade,
  bio text,
  specialties text[] default '{}',
  languages text[] default '{}',
  price_per_day int not null default 0,
  base_location text,
  base_lat double precision,
  base_lng double precision,
  work_hours text,
  verification verify_status not null default 'draft',
  verification_note text,
  badge_verified boolean not null default false,
  is_available boolean not null default true,
  rating_avg numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  completed_tours int not null default 0,
  response_rate int not null default 100,
  bank_name text,
  bank_account_holder text,
  bank_account_number text   -- TODO produksi: enkripsi (Supabase Vault / pgsodium)
);

create table guide_documents (             -- file asli ada di Storage (bucket privat), di sini hanya path-nya
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides(id) on delete cascade,
  type doc_type not null,
  storage_path text not null,
  status verify_status not null default 'pending',
  admin_note text,
  uploaded_at timestamptz not null default now()
);

create table guide_certifications (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides(id) on delete cascade,
  name text not null
);

-- ---------- DESTINASI ----------
create table destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text not null,
  location text not null,
  lat double precision,
  lng double precision,
  image_url text,
  description text,
  highlights text[] default '{}',
  base_price int not null check (base_price >= 0),   -- harga per pax
  rating_avg numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  is_active boolean not null default true
);

create table meeting_points (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  description text
);

create table guide_destinations (          -- destinasi yang dikelola pemandu
  guide_id uuid references guides(id) on delete cascade,
  destination_id uuid references destinations(id) on delete cascade,
  primary key (guide_id, destination_id)
);

-- ---------- UMKM, MAKANAN, TRANSPORT ----------
create table umkm_partners (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  name text not null,
  category text not null,                  -- Kuliner / Kerajinan / Oleh-oleh / Edukasi Budaya
  owner_name text,
  location text,
  image_url text,
  featured_product text,
  storytelling text,
  voucher_code text,
  bundling_available boolean not null default false,
  verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0
);

create table food_items (
  id uuid primary key default gen_random_uuid(),
  umkm_id uuid not null references umkm_partners(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  category text not null,                  -- Makanan Utama / Minuman & Segaran / Camilan & Oleh-Oleh
  base_price int not null check (base_price >= 0),
  spicy_options text[] default '{}',
  is_active boolean not null default true
);
create table food_variants (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references food_items(id) on delete cascade,
  group_name text not null,
  label text not null,
  price_diff int not null default 0
);
create table food_sides (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references food_items(id) on delete cascade,
  label text not null,
  price int not null default 0
);

create table transport_options (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- id yang dipakai UI (mis. 'ojek', 'angkot')
  name text not null,
  description text,
  image_url text,
  badge text,
  capacity_text text,
  min_capacity int not null default 1,
  max_capacity int not null default 1,
  price int not null default 0,
  facilities text[] default '{}',
  pickup_points text[] default '{}',
  is_active boolean not null default true
);

-- ---------- VOUCHER & POIN ----------
create table vouchers (
  code text primary key,
  title text not null,
  points_cost int not null default 0,
  discount_amount int,                     -- potongan rupiah (pilih salah satu)
  discount_percent int,                    -- atau persen
  is_active boolean not null default true,
  expires_at timestamptz
);
create table user_vouchers (               -- voucher hasil tukar poin
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  voucher_code text not null references vouchers(code),
  used_booking_id uuid,
  redeemed_at timestamptz not null default now()
);
create table points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount int not null,                     -- + dapat, - tukar
  reason text not null,
  created_at timestamptz not null default now()
);

-- ---------- BOOKING ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default 'BK-' || lpad((floor(random()*90000)+10000)::int::text, 5, '0'),
  tourist_id uuid not null references profiles(id),
  guide_id uuid not null references guides(id),
  destination_id uuid not null references destinations(id),
  tour_date date not null,
  participants int not null check (participants >= 1),
  guides_count int not null default 1,
  meeting_point_id uuid references meeting_points(id),
  transport_id uuid references transport_options(id),
  umkm_id uuid references umkm_partners(id),
  notes text,
  status booking_status not null default 'pending_payment',
  -- rincian harga disimpan sebagai snapshot supaya riwayat tidak berubah saat harga naik
  unit_price int not null,
  tour_subtotal int not null,
  extra_guides_fee int not null default 0,
  transport_fee int not null default 0,
  food_subtotal int not null default 0,
  discount_amount int not null default 0,
  total_amount int not null,
  voucher_code text references vouchers(code),
  checkin_qr text unique not null default encode(gen_random_bytes(12),'hex'),
  guide_confirm_deadline timestamptz,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  refund_amount int
);
create index on bookings (tourist_id);
create index on bookings (guide_id, status);

create table booking_food_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  food_id uuid not null references food_items(id),
  variant_label text,
  spicy text,
  side_ids uuid[] default '{}',
  quantity int not null check (quantity > 0),
  unit_price int not null,
  total_price int not null,
  notes text
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  method text not null,                    -- QRIS / BCA VA / GoPay / ShopeePay
  status payment_status not null default 'pending',
  amount int not null,
  provider_ref text,                       -- order id dari Midtrans/Xendit
  provider_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- DOMPET PEMANDU (ESCROW) ----------
create table wallet_transactions (         -- ledger: saldo = SUM(amount). Jangan simpan saldo sebagai kolom.
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides(id) on delete cascade,
  booking_id uuid references bookings(id),
  amount int not null,                     -- + pencairan escrow, - penarikan
  kind text not null check (kind in ('escrow_release','withdrawal','adjustment')),
  created_at timestamptz not null default now()
);
create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references guides(id),
  amount int not null check (amount > 0),
  bank_name text not null,
  account_holder text not null,
  account_number_enc text not null,        -- enkripsi / simpan di Vault, jangan plaintext
  status text not null default 'requested' check (status in ('requested','processed','rejected')),
  created_at timestamptz not null default now()
);
create view guide_balances as
  select guide_id, coalesce(sum(amount),0) as balance from wallet_transactions group by guide_id;

-- ---------- ULASAN, CHAT, NOTIF, DISPUTE ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references bookings(id) on delete cascade,
  tourist_id uuid not null references profiles(id),
  guide_id uuid not null references guides(id),
  destination_id uuid not null references destinations(id),
  rating int not null check (rating between 1 and 5),
  comment text check (char_length(comment) >= 10),
  created_at timestamptz not null default now()
);

create table booking_messages (            -- chat langsung wisatawan <-> pemandu
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);
create index on booking_messages (booking_id, created_at);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  link_screen text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table disputes (                    -- juga dipakai untuk laporan no-show
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  raised_by uuid not null references profiles(id),
  reason text not null,
  detail text,
  evidence_paths text[] default '{}',
  status dispute_status not null default 'open',
  resolution_note text,
  created_at timestamptz not null default now()
);

create table support_tickets (             -- Pusat Bantuan / chat admin
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create table support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

-- Riwayat chat AI (opsional, berguna untuk analitik & konteks)
create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  sender text not null check (sender in ('user','ai')),
  body text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- FUNGSI BISNIS (dipanggil dari frontend via supabase.rpc)
-- Semua hitung uang dilakukan DI SINI, bukan di React, supaya tidak bisa dimanipulasi.
-- =====================================================================

create or replace function create_booking(
  p_destination uuid, p_guide uuid, p_date date, p_participants int,
  p_meeting_point uuid default null, p_transport uuid default null,
  p_umkm uuid default null, p_notes text default null,
  p_voucher text default null, p_foods jsonb default '[]'
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  d destinations; t transport_options; tier pricing_tiers; b bookings;
  v vouchers;
  pax int := greatest(1, p_participants);
  guides_n int; unit int; tour_sub int; extra_fee int := 0; trans_fee int := 0;
  food_sub int := 0; disc int := 0; total int; f jsonb; fi food_items; vlabel int; sides int;
begin
  if auth.uid() is null then raise exception 'Harus login'; end if;
  if p_date < current_date then raise exception 'Tanggal tidak valid'; end if;

  select * into d from destinations where id = p_destination and is_active;
  if not found then raise exception 'Destinasi tidak ditemukan'; end if;
  if not exists (select 1 from guides where id = p_guide and verification = 'approved' and is_available)
    then raise exception 'Pemandu tidak tersedia'; end if;

  select * into tier from pricing_tiers where min_pax <= pax order by min_pax desc limit 1;
  unit := round(d.base_price * (1 - tier.discount_percent / 100.0));
  tour_sub := unit * pax;

  guides_n := ceil(pax / (select (value)::int from app_settings where key='pax_per_guide'));
  extra_fee := greatest(0, guides_n - 1) * (select (value)::int from app_settings where key='extra_guide_fee');

  if p_transport is not null then
    select * into t from transport_options where id = p_transport and is_active;
    trans_fee := coalesce(t.price, 0);
  end if;

  if p_voucher is not null then
    select * into v from vouchers where code = p_voucher and is_active and (expires_at is null or expires_at > now());
    if not found then raise exception 'Voucher tidak valid'; end if;
    if v.points_cost > 0 and not exists
       (select 1 from user_vouchers where user_id = auth.uid() and voucher_code = p_voucher and used_booking_id is null)
      then raise exception 'Voucher belum ditukar'; end if;
  end if;

  insert into bookings (tourist_id, guide_id, destination_id, tour_date, participants, guides_count,
      meeting_point_id, transport_id, umkm_id, notes, unit_price, tour_subtotal, extra_guides_fee,
      transport_fee, total_amount, voucher_code)
  values (auth.uid(), p_guide, p_destination, p_date, pax, guides_n, p_meeting_point, p_transport,
      p_umkm, p_notes, unit, tour_sub, extra_fee, trans_fee, 0, p_voucher)
  returning * into b;

  for f in select * from jsonb_array_elements(p_foods) loop
    select * into fi from food_items where id = (f->>'food_id')::uuid and is_active;
    continue when not found;
    select coalesce(max(price_diff),0) into vlabel from food_variants
      where food_id = fi.id and label = f->>'variant_label';
    select coalesce(sum(price),0) into sides from food_sides
      where food_id = fi.id and id in (select (jsonb_array_elements_text(coalesce(f->'side_ids','[]')))::uuid);
    insert into booking_food_items (booking_id, food_id, variant_label, spicy, side_ids, quantity, unit_price, total_price, notes)
    values (b.id, fi.id, f->>'variant_label', f->>'spicy',
            array(select (jsonb_array_elements_text(coalesce(f->'side_ids','[]')))::uuid),
            greatest(1,(f->>'qty')::int), fi.base_price + vlabel + sides,
            (fi.base_price + vlabel + sides) * greatest(1,(f->>'qty')::int), f->>'notes');
    food_sub := food_sub + (fi.base_price + vlabel + sides) * greatest(1,(f->>'qty')::int);
  end loop;

  if v.code is not null then
    disc := coalesce(v.discount_amount, 0)
          + round((tour_sub + extra_fee + trans_fee + food_sub) * coalesce(v.discount_percent,0) / 100.0);
  end if;
  total := greatest(0, tour_sub + extra_fee + trans_fee + food_sub - disc);

  update bookings set food_subtotal = food_sub, discount_amount = disc, total_amount = total,
      guide_confirm_deadline = now() + make_interval(hours => (select (value)::int from app_settings where key='guide_confirm_hours'))
   where id = b.id returning * into b;

  -- voucher hasil tukar poin hanya boleh dipakai sekali
  if v.code is not null and v.points_cost > 0 then
    update user_vouchers set used_booking_id = b.id
     where id = (select id from user_vouchers where user_id = auth.uid() and voucher_code = v.code
                  and used_booking_id is null limit 1);
  end if;
  return b;
end $$;

-- Pemandu konfirmasi (setelah webhook pembayaran mengubah status ke escrow_locked)
create or replace function guide_confirm_booking(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update bookings set status='confirmed_by_guide', confirmed_at=now()
   where id=p_booking and guide_id=auth.uid() and status='escrow_locked';
  if not found then raise exception 'Booking tidak bisa dikonfirmasi'; end if;
end $$;

-- Pemandu scan QR wisatawan -> tur dimulai
create or replace function guide_start_tour(p_qr text) returns uuid
language plpgsql security definer set search_path = public as $$
declare bid uuid;
begin
  update bookings set status='in_tour'
   where checkin_qr=p_qr and guide_id=auth.uid() and status='confirmed_by_guide'
   returning id into bid;
  if bid is null then raise exception 'QR tidak valid'; end if;
  return bid;
end $$;

-- Wisatawan check-out + ulasan -> dana escrow cair ke dompet pemandu
create or replace function complete_tour(p_booking uuid, p_rating int, p_comment text) returns void
language plpgsql security definer set search_path = public as $$
declare b bookings; fee int; pts int;
begin
  select * into b from bookings where id=p_booking and tourist_id=auth.uid() and status='in_tour' for update;
  if not found then raise exception 'Tur belum berjalan atau bukan milik Anda'; end if;

  update bookings set status='completed', completed_at=now() where id=b.id;
  insert into reviews (booking_id,tourist_id,guide_id,destination_id,rating,comment)
    values (b.id,b.tourist_id,b.guide_id,b.destination_id,p_rating,p_comment);

  fee := round(b.total_amount * (select (value)::int from app_settings where key='platform_fee_percent') / 100.0);
  insert into wallet_transactions (guide_id, booking_id, amount, kind)
    values (b.guide_id, b.id, b.total_amount - fee, 'escrow_release');

  update guides g set completed_tours = completed_tours + 1,
     reviews_count = (select count(*) from reviews where guide_id=g.id),
     rating_avg    = (select round(avg(rating),2) from reviews where guide_id=g.id)
   where g.id=b.guide_id;
  update destinations d set reviews_count = (select count(*) from reviews where destination_id=d.id),
     rating_avg = (select round(avg(rating),2) from reviews where destination_id=d.id)
   where d.id=b.destination_id;

  pts := floor(b.total_amount / 1000);
  update profiles set points = points + pts where id=b.tourist_id;
  insert into points_transactions (user_id, amount, reason) values (b.tourist_id, pts, 'Tur selesai '||b.code);
end $$;

-- Pembatalan memakai tabel cancellation_policies
create or replace function cancel_booking(p_booking uuid) returns int
language plpgsql security definer set search_path = public as $$
declare b bookings; days int; pct int; refund int;
begin
  select * into b from bookings where id=p_booking and tourist_id=auth.uid()
     and status in ('pending_payment','escrow_locked','confirmed_by_guide') for update;
  if not found then raise exception 'Booking tidak bisa dibatalkan'; end if;
  days := (b.tour_date - current_date);
  select refund_percent into pct from cancellation_policies where min_days_before <= greatest(days,0)
    order by min_days_before desc limit 1;
  refund := case when b.status='pending_payment' then 0 else round(b.total_amount * coalesce(pct,0) / 100.0) end;
  update bookings set status='cancelled', cancelled_at=now(), refund_amount=refund where id=b.id;
  return refund;   -- eksekusi refund ke payment gateway dilakukan Edge Function
end $$;

-- Tukar poin dengan voucher
create or replace function redeem_voucher(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare v vouchers;
begin
  select * into v from vouchers where code=p_code and is_active;
  if not found then raise exception 'Voucher tidak ada'; end if;
  update profiles set points = points - v.points_cost where id=auth.uid() and points >= v.points_cost;
  if not found then raise exception 'Poin tidak cukup'; end if;
  insert into user_vouchers (user_id, voucher_code) values (auth.uid(), p_code);
  insert into points_transactions (user_id, amount, reason) values (auth.uid(), -v.points_cost, 'Tukar '||p_code);
end $$;

-- Smart Match: bobot 25/25/15/15/10/10 sesuai di aplikasi, lengkap dengan rincian skor per faktor
create or replace function smart_match(
  p_interest text default '', p_budget int default 0,
  p_lat double precision default null, p_lng double precision default null
) returns table (guide_id uuid, rating_score int, interest_score int, distance_score int,
                 budget_score int, history_score int, response_score int, match_score int)
language sql stable security definer set search_path = public as $$
  with s as (
    select g.id,
      round(25 * (g.rating_avg / 5.0))::int as rating_score,
      round(25 * (case when coalesce(p_interest,'') = '' then 0.6
                       when exists (select 1 from unnest(g.specialties) x where x ilike '%'||p_interest||'%') then 1
                       else 0.3 end))::int as interest_score,
      round(15 * (case when p_lat is null or g.base_lat is null then 0.5
                       else greatest(0, 1 - (sqrt(power(g.base_lat-p_lat,2)+power(g.base_lng-p_lng,2))*111) / 100) end))::int as distance_score,
      round(15 * (case when coalesce(p_budget,0) <= 0 or p_budget >= g.price_per_day then 1
                       else greatest(0, 1 - (g.price_per_day - p_budget)::numeric / nullif(g.price_per_day,0)) end))::int as budget_score,
      round(10 * least(1, g.completed_tours / 200.0))::int as history_score,
      round(10 * (g.response_rate / 100.0))::int as response_score
    from guides g
    where g.verification = 'approved' and g.is_available
  )
  select id, rating_score, interest_score, distance_score, budget_score, history_score, response_score,
         least(99, rating_score + interest_score + distance_score + budget_score + history_score + response_score)
  from s order by 8 desc limit 10
$$;

-- Penarikan dana pemandu: saldo diperiksa di server, ledger dan permintaan dibuat atomik
create or replace function request_withdrawal(p_amount int) returns void
language plpgsql security definer set search_path = public as $$
declare g guides; bal int;
begin
  select * into g from guides where id = auth.uid() for update;
  if not found then raise exception 'Hanya pemandu yang dapat menarik dana'; end if;
  if g.bank_account_number is null then raise exception 'Lengkapi data rekening bank terlebih dahulu'; end if;
  select coalesce(sum(amount),0) into bal from wallet_transactions where guide_id = g.id;
  if p_amount <= 0 or p_amount > bal then raise exception 'Saldo tidak mencukupi'; end if;
  insert into wallet_transactions (guide_id, amount, kind) values (g.id, -p_amount, 'withdrawal');
  insert into withdrawals (guide_id, amount, bank_name, account_holder, account_number_enc)
    values (g.id, p_amount, g.bank_name, g.bank_account_holder, g.bank_account_number);
end $$;

-- Booking kedaluwarsa jika pemandu tidak konfirmasi dalam 24 jam (jadwalkan dengan pg_cron tiap 15 menit)
create or replace function expire_unconfirmed_bookings() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update bookings set status='expired'
   where status='escrow_locked' and guide_confirm_deadline < now();
  get diagnostics n = row_count;
  return n;   -- Edge Function lanjut: tawarkan Next-Best Match atau refund 100%
end $$;

-- =====================================================================
-- ROW LEVEL SECURITY (wajib: tanpa ini data bisa dibaca siapa saja lewat anon key)
-- =====================================================================
alter table profiles              enable row level security;
alter table guides                enable row level security;
alter table guide_documents       enable row level security;
alter table guide_certifications  enable row level security;
alter table destinations          enable row level security;
alter table meeting_points        enable row level security;
alter table guide_destinations    enable row level security;
alter table umkm_partners         enable row level security;
alter table food_items            enable row level security;
alter table food_variants         enable row level security;
alter table food_sides            enable row level security;
alter table transport_options     enable row level security;
alter table vouchers              enable row level security;
alter table user_vouchers         enable row level security;
alter table points_transactions   enable row level security;
alter table bookings              enable row level security;
alter table booking_food_items    enable row level security;
alter table payments              enable row level security;
alter table wallet_transactions   enable row level security;
alter table withdrawals           enable row level security;
alter table reviews               enable row level security;
alter table booking_messages      enable row level security;
alter table notifications         enable row level security;
alter table disputes              enable row level security;
alter table support_tickets       enable row level security;
alter table support_messages      enable row level security;
alter table ai_messages           enable row level security;
alter table app_settings          enable row level security;
alter table pricing_tiers         enable row level security;
alter table cancellation_policies enable row level security;

-- Katalog publik (boleh dibaca siapa saja, termasuk belum login)
create policy "public read" on destinations          for select using (is_active);
create policy "public read" on meeting_points        for select using (true);
create policy "public read" on transport_options     for select using (is_active);
create policy "public read" on umkm_partners         for select using (verified);
create policy "public read" on food_items            for select using (is_active);
create policy "public read" on food_variants         for select using (true);
create policy "public read" on food_sides            for select using (true);
create policy "public read" on pricing_tiers         for select using (true);
create policy "public read" on cancellation_policies for select using (true);
create policy "public read" on vouchers              for select using (is_active);
create policy "guide dest manage" on guide_destinations for all using (guide_id = auth.uid()) with check (guide_id = auth.uid());
create policy "public read" on reviews               for select using (true);
create policy "public read" on guide_destinations    for select using (true);
create policy "public read" on guide_certifications  for select using (true);
create policy "public read" on guides                for select using (verification = 'approved' or id = auth.uid() or is_admin());

-- Profil: hanya milik sendiri (data pemandu yang tampil ke publik diambil lewat view di bawah)
create policy "own profile read"   on profiles for select using (id = auth.uid() or is_admin());
create policy "own profile update" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));  -- cegah naik role sendiri
create view public_guides as
  select g.*, p.full_name, p.avatar_url from guides g join profiles p on p.id = g.id
  where g.verification = 'approved';

create policy "guide manage self"  on guides for update using (id = auth.uid());
create policy "guide docs own"     on guide_documents for all using (guide_id = auth.uid() or is_admin());

-- Booking: wisatawan & pemandu terkait saja. INSERT/UPDATE lewat fungsi security definer di atas.
create policy "booking parties read" on bookings for select
  using (tourist_id = auth.uid() or guide_id = auth.uid() or is_admin());
-- Nama & foto wisatawan hanya terlihat oleh pemandu dari booking tersebut (profiles sendiri tetap privat)
create view booking_tourists as
  select b.id as booking_id, p.full_name, p.avatar_url
  from bookings b join profiles p on p.id = b.tourist_id
  where b.guide_id = auth.uid() or b.tourist_id = auth.uid();

create policy "booking foods read" on booking_food_items for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.tourist_id = auth.uid() or b.guide_id = auth.uid())));
create policy "payments read own" on payments for select
  using (exists (select 1 from bookings b where b.id = booking_id and b.tourist_id = auth.uid()) or is_admin());

create policy "wallet own read"      on wallet_transactions for select using (guide_id = auth.uid() or is_admin());
create policy "withdraw own read"    on withdrawals for select using (guide_id = auth.uid() or is_admin());

create policy "chat parties read" on booking_messages for select
  using (exists (select 1 from bookings b where b.id = booking_id and (b.tourist_id = auth.uid() or b.guide_id = auth.uid())));
create policy "chat parties send" on booking_messages for insert
  with check (sender_id = auth.uid() and exists
    (select 1 from bookings b where b.id = booking_id and (b.tourist_id = auth.uid() or b.guide_id = auth.uid())));

create policy "notif own"    on notifications for select using (user_id = auth.uid());
create policy "notif update" on notifications for update using (user_id = auth.uid());
create policy "points own"   on points_transactions for select using (user_id = auth.uid());
create policy "uvouchers own" on user_vouchers for select using (user_id = auth.uid());
create policy "dispute own"  on disputes for all using (raised_by = auth.uid() or is_admin());
create policy "ticket own"   on support_tickets for all using (user_id = auth.uid() or is_admin());
create policy "tmsg own"     on support_messages for all using (
  exists (select 1 from support_tickets t where t.id = ticket_id and (t.user_id = auth.uid() or is_admin())));
create policy "ai own"       on ai_messages for all using (user_id = auth.uid());

-- Admin boleh kelola katalog
create policy "admin all" on destinations for all using (is_admin());
create policy "admin all" on guides       for all using (is_admin());
create policy "admin all" on umkm_partners for all using (is_admin());

-- Realtime untuk chat, notifikasi, dan status booking
alter publication supabase_realtime add table booking_messages, notifications, bookings;

-- =====================================================================
-- STORAGE (buat di dashboard > Storage)
--   avatars            : publik
--   destination-images : publik
--   guide-documents    : PRIVAT (KTP, CV, sertifikat) - akses hanya pemilik + admin lewat signed URL
--   dispute-evidence   : privat
-- =====================================================================
