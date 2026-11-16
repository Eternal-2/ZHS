import { supabase } from '../lib/supabase';

export interface VoucherCard {
  id: string; title: string; points: number; validUntil: string; desc: string; code: string; minTrx: string;
}

const dateId = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

/** Voucher aktif dari tabel `vouchers` (dikelola admin). Hadiah poin POIN* ditampilkan di tab Poin, bukan di sini. */
export async function fetchVoucherCards(descriptions: Record<string, string> = {}): Promise<VoucherCard[]> {
  const { data, error } = await supabase.from('vouchers').select('*').eq('is_active', true).order('points_cost');
  if (error) throw new Error(error.message);
  const rupiah = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
  return (data ?? [])
    .filter((v: any) => !String(v.code).startsWith('POIN') && (!v.expires_at || new Date(v.expires_at) > new Date()))
    .map((v: any) => ({
      id: v.code,
      code: v.code,
      title: v.title,
      points: v.points_cost,
      validUntil: v.expires_at ? dateId(v.expires_at) : 'Tidak ada batas waktu',
      desc: descriptions[v.code] ?? 'Tukarkan poin Anda dengan voucher ini untuk pemesanan berikutnya.',
      minTrx: v.discount_amount ? `Potongan ${rupiah(v.discount_amount)}` : v.discount_percent ? `Diskon ${v.discount_percent}%` : 'Berlaku di destinasi pilihan'
    }));
}
