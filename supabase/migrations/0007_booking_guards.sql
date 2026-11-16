-- Perlindungan pemesanan: (1) pemandu tidak bisa dipesan dua kali pada tanggal yang sama,
-- (2) pemandu hanya bisa dipesan untuk destinasi yang ia layani (tabel guide_destinations).
-- Menggantikan 0004_fix_create_booking.sql (sudah memuat perbaikan hitungan pemandu). Aman diulang.

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
  if not exists (select 1 from guide_destinations where guide_id = p_guide and destination_id = p_destination)
    then raise exception 'Pemandu ini tidak melayani destinasi tersebut'; end if;

  -- satu pemandu satu tur per hari. Kunci per (pemandu, tanggal) mencegah dua pemesanan bersamaan lolos.
  perform pg_advisory_xact_lock(hashtext(p_guide::text || p_date::text));
  if exists (select 1 from bookings
              where guide_id = p_guide and tour_date = p_date
                and (status in ('escrow_locked','confirmed_by_guide','in_tour')
                     or (status = 'pending_payment' and created_at > now() - interval '30 minutes'))) then
    raise exception 'Pemandu sudah memiliki tur pada tanggal tersebut. Pilih tanggal atau pemandu lain.';
  end if;

  select * into tier from pricing_tiers where min_pax <= pax order by min_pax desc limit 1;
  unit := round(d.base_price * (1 - tier.discount_percent / 100.0));
  tour_sub := unit * pax;

  guides_n := ceil(pax::numeric / (select (value)::int from app_settings where key='pax_per_guide'))::int;  -- pembagian desimal: 12 peserta = 2 pemandu
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
