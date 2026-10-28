// Menerima notifikasi pembayaran dari Midtrans. Daftarkan URL fungsi ini di Midtrans Dashboard >
// Settings > Payment > Notification URL. Fungsi ini dideploy TANPA verifikasi JWT (lihat config.toml);
// keasliannya dijaga oleh signature_key.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sha512 = async (text: string) => {
  const buf = await crypto.subtle.digest('SHA-512', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const n = await req.json().catch(() => null);
  if (!n?.order_id) return new Response('Bad request', { status: 400 });

  // 1) Verifikasi tanda tangan
  const expected = await sha512(`${n.order_id}${n.status_code}${n.gross_amount}${Deno.env.get('MIDTRANS_SERVER_KEY')!}`);
  if (expected !== n.signature_key) return new Response('Invalid signature', { status: 401 });

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: payment } = await db.from('payments').select('*, bookings(*)').eq('provider_ref', n.order_id).maybeSingle();
  if (!payment) return new Response('ok'); // bukan transaksi kita

  const booking = payment.bookings;
  const status: string = n.transaction_status;
  const paid = status === 'settlement' || (status === 'capture' && n.fraud_status === 'accept');

  if (paid) {
    // pastikan nominal cocok dengan database
    if (Math.round(Number(n.gross_amount)) !== booking.total_amount) {
      console.error('Nominal tidak cocok', n.gross_amount, booking.total_amount);
      return new Response('Amount mismatch', { status: 400 });
    }
    if (payment.status !== 'paid') {
      await db.from('payments').update({ status: 'paid', paid_at: new Date().toISOString(), provider_payload: n }).eq('id', payment.id);
      // dana masuk escrow; jam 24 jam konfirmasi pemandu dimulai sekarang
      const { data: hours } = await db.from('app_settings').select('value').eq('key', 'guide_confirm_hours').single();
      const deadline = new Date(Date.now() + Number(hours?.value ?? 24) * 3600_000).toISOString();
      const { data: updated } = await db.from('bookings')
        .update({ status: 'escrow_locked', guide_confirm_deadline: deadline })
        .eq('id', booking.id).eq('status', 'pending_payment').select('id');
      if (updated?.length) {
        await db.from('notifications').insert([
          { user_id: booking.tourist_id, title: 'Pembayaran diterima', body: `Dana booking ${booking.code} aman di escrow ZHS.`, link_screen: 'booking-detail' },
          { user_id: booking.guide_id, title: 'Permintaan tur baru', body: `Booking ${booking.code} menunggu konfirmasi Anda.`, link_screen: 'guide-booking-request' }
        ]);
      }
    }
  } else if (['expire', 'cancel', 'deny', 'failure'].includes(status)) {
    await db.from('payments').update({ status: status === 'expire' ? 'expired' : 'failed', provider_payload: n }).eq('id', payment.id);
    // tandai booking kedaluwarsa hanya jika belum ada pembayaran lain yang berhasil
    await db.from('bookings').update({ status: 'expired' }).eq('id', booking.id).eq('status', 'pending_payment');
  }
  return new Response('ok');
});
