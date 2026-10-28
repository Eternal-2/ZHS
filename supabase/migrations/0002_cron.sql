-- Jadwal otomatis (aktifkan dulu extension pg_cron di Dashboard > Database > Extensions)
create extension if not exists pg_cron;

-- Booking yang belum dibayar > 30 menit dianggap kedaluwarsa
create or replace function expire_unpaid_bookings() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update bookings set status = 'expired'
   where status = 'pending_payment' and created_at < now() - interval '30 minutes';
  get diagnostics n = row_count;
  return n;
end $$;

select cron.schedule('expire-unpaid-bookings',      '*/10 * * * *', $$select public.expire_unpaid_bookings()$$);
select cron.schedule('expire-unconfirmed-bookings', '*/15 * * * *', $$select public.expire_unconfirmed_bookings()$$);
