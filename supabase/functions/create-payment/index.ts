// Membuat tagihan di Midtrans (sandbox/production) untuk booking milik user yang sedang login.
// Secrets: MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION (true/false)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const METHODS = ['QRIS', 'BCA Virtual Account', 'GoPay', 'ShopeePay'] as const;
type Method = (typeof METHODS)[number];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const url = Deno.env.get('SUPABASE_URL')!;

    // 1) Identifikasi user dari JWT & baca booking lewat RLS (hanya booking miliknya yang terbaca)
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: 'Harus login' }, 401);

    const { booking_id, method } = await req.json();
    if (!METHODS.includes(method)) return json({ error: 'Metode pembayaran tidak didukung' }, 400);

    const { data: booking, error } = await userClient.from('bookings')
      .select('id,code,total_amount,status,tourist_id').eq('id', booking_id).single();
    if (error || !booking) return json({ error: 'Booking tidak ditemukan' }, 404);
    if (booking.tourist_id !== userData.user.id) return json({ error: 'Bukan booking Anda' }, 403);
    if (booking.status !== 'pending_payment') return json({ error: 'Booking tidak menunggu pembayaran' }, 409);

    // 2) Charge ke Midtrans. Nominal diambil dari database, BUKAN dari klien.
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY')!;
    const base = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true' ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com';
    const orderId = `${booking.code}-${Date.now()}`;           // harus unik tiap percobaan bayar
    const payload: Record<string, unknown> = {
      transaction_details: { order_id: orderId, gross_amount: booking.total_amount },
      custom_expiry: { expiry_duration: 15, unit: 'minute' }
    };
    const m = method as Method;
    if (m === 'QRIS') Object.assign(payload, { payment_type: 'qris', qris: { acquirer: 'gopay' } });
    if (m === 'GoPay') Object.assign(payload, { payment_type: 'gopay' });
    if (m === 'ShopeePay') Object.assign(payload, { payment_type: 'shopeepay' });
    if (m === 'BCA Virtual Account') Object.assign(payload, { payment_type: 'bank_transfer', bank_transfer: { bank: 'bca' } });

    const res = await fetch(`${base}/v2/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Basic ' + btoa(serverKey + ':') },
      body: JSON.stringify(payload)
    });
    const charge = await res.json();
    if (!res.ok || (charge.status_code && !['200', '201'].includes(String(charge.status_code)))) {
      console.error('Midtrans error', charge);
      return json({ error: charge.status_message ?? 'Gagal membuat tagihan' }, 502);
    }

    const action = (name: string) => charge.actions?.find((a: any) => a.name === name)?.url;
    const result = {
      qr_url: action('generate-qr-code'),
      deeplink_url: action('deeplink-redirect'),
      va_number: charge.va_numbers?.[0]?.va_number,
      expires_at: charge.expiry_time ? new Date(charge.expiry_time.replace(' ', 'T') + '+07:00').toISOString() : undefined,
      order_id: orderId
    };

    // 3) Catat pembayaran (tabel payments hanya boleh ditulis server)
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    await admin.from('payments').insert({
      booking_id: booking.id, method, status: 'pending', amount: booking.total_amount,
      provider_ref: orderId, provider_payload: charge
    });

    return json(result);
  } catch (err) {
    console.error(err);
    return json({ error: 'Terjadi kesalahan server' }, 500);
  }
});
