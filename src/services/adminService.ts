import { supabase } from '../lib/supabase';

const rpc = async <T,>(fn: string, args?: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
};

// ===================== Ringkasan =====================
export interface DashboardStats {
  tourists: number; guides_approved: number; guides_active: number; guides_pending: number;
  bookings_total: number; bookings_month: number; gmv_month: number; gmv_total: number;
  fee_earned: number; escrow_held: number; open_tickets: number;
  pending_withdrawals: number; pending_withdrawals_amount: number;
  by_status: Record<string, number>;
  daily: { date: string; bookings: number; amount: number }[];
}
export const fetchDashboard = () => rpc<DashboardStats>('admin_dashboard');

// ===================== Pemesanan =====================
export interface AdminBooking {
  id: string; code: string; status: string; tour_date: string; participants: number; total_amount: number;
  created_at: string; destination_title: string; tourist_name: string; tourist_email: string;
  guide_name: string; payment_method: string | null;
}
export const fetchBookings = (status: string, search: string) =>
  rpc<AdminBooking[]>('admin_list_bookings', { p_status: status || null, p_search: search || null, p_limit: 200 });

// ===================== Pengguna =====================
export interface AdminUser {
  id: string; email: string; full_name: string; role: string; phone: string | null; points: number;
  is_verified: boolean; created_at: string; bookings_count: number;
}
export const fetchUsers = (search: string, role: string) =>
  rpc<AdminUser[]>('admin_list_users', { p_search: search || null, p_role: role || null, p_limit: 200 });
export const setUserRole = (userId: string, role: 'wisatawan' | 'admin') =>
  rpc<void>('admin_set_role', { p_user: userId, p_role: role });

// ===================== Pemandu =====================
export interface AdminGuide {
  id: string; name: string; email: string; phone: string | null; verification: string; is_available: boolean;
  rating: number; reviews: number; completed: number; price: number; balance: number; base_location: string | null;
}
export const fetchGuides = () => rpc<AdminGuide[]>('admin_list_guides');
export const setGuideActive = (guideId: string, active: boolean) =>
  rpc<void>('admin_set_guide_active', { p_guide: guideId, p_active: active });

// ===================== Penarikan dana =====================
export interface AdminWithdrawal {
  id: string; guide_id: string; guide_name: string; amount: number; bank_name: string; account_holder: string;
  account_number: string; status: 'requested' | 'processed' | 'rejected'; created_at: string;
  processed_at: string | null; admin_note: string | null;
}
export const fetchWithdrawals = (status: string) => rpc<AdminWithdrawal[]>('admin_list_withdrawals', { p_status: status || null });
export const processWithdrawal = (id: string, approve: boolean, note?: string) =>
  rpc<void>('admin_process_withdrawal', { p_id: id, p_approve: approve, p_note: note ?? null });

// ===================== Destinasi =====================
export interface AdminMeetingPoint { id?: string; name: string; description: string; }
export interface AdminDestination {
  id?: string; slug: string; title: string; category: string; location: string; image_url: string;
  description: string; highlights: string[]; base_price: number; is_active: boolean;
  rating_avg?: number; reviews_count?: number; meetingPoints: AdminMeetingPoint[];
}

export async function fetchDestinationsAdmin(): Promise<AdminDestination[]> {
  const { data, error } = await supabase
    .from('destinations').select('*, meeting_points(id,name,description)').order('title');
  if (error) throw new Error(error.message);
  return (data ?? []).map((d: any) => ({
    id: d.id, slug: d.slug, title: d.title, category: d.category, location: d.location,
    image_url: d.image_url ?? '', description: d.description ?? '', highlights: d.highlights ?? [],
    base_price: d.base_price, is_active: d.is_active, rating_avg: Number(d.rating_avg ?? 0),
    reviews_count: d.reviews_count ?? 0,
    meetingPoints: (d.meeting_points ?? []).map((m: any) => ({ id: m.id, name: m.name, description: m.description ?? '' }))
  }));
}

export const slugify = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Validasi di klien (server juga membatasi lewat RLS); mengembalikan pesan error atau null. */
export function validateDestination(d: AdminDestination): string | null {
  if (!d.title.trim()) return 'Nama destinasi wajib diisi';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) return 'Slug hanya boleh huruf kecil, angka, dan tanda hubung';
  if (!d.category.trim() || !d.location.trim()) return 'Kategori dan lokasi wajib diisi';
  if (!Number.isFinite(d.base_price) || d.base_price < 0) return 'Harga tidak valid';
  if (d.meetingPoints.some((m) => !m.name.trim())) return 'Nama titik kumpul tidak boleh kosong';
  return null;
}

export async function saveDestination(d: AdminDestination): Promise<string> {
  const problem = validateDestination(d);
  if (problem) throw new Error(problem);
  const row = {
    slug: d.slug, title: d.title.trim(), category: d.category.trim(), location: d.location.trim(),
    image_url: d.image_url.trim() || null, description: d.description.trim() || null,
    highlights: d.highlights, base_price: Math.round(d.base_price), is_active: d.is_active
  };
  let id = d.id;
  if (id) {
    const { error } = await supabase.from('destinations').update(row).eq('id', id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase.from('destinations').insert(row).select('id').single();
    if (error) throw new Error(error.message.includes('duplicate') ? 'Slug sudah dipakai destinasi lain' : error.message);
    id = data.id as string;
  }
  // sinkronkan titik kumpul: hapus yang dibuang, perbarui yang ada, tambah yang baru
  const { data: existing } = await supabase.from('meeting_points').select('id').eq('destination_id', id);
  const keep = new Set(d.meetingPoints.filter((m) => m.id).map((m) => m.id!));
  const removed = (existing ?? []).map((m: any) => m.id).filter((x: string) => !keep.has(x));
  if (removed.length) {
    const { error } = await supabase.from('meeting_points').delete().in('id', removed);
    if (error) throw new Error(error.message);
  }
  for (const m of d.meetingPoints) {
    const payload = { destination_id: id, name: m.name.trim(), description: m.description.trim() || null };
    const { error } = m.id
      ? await supabase.from('meeting_points').update(payload).eq('id', m.id)
      : await supabase.from('meeting_points').insert(payload);
    if (error) throw new Error(error.message);
  }
  return id!;
}

export async function setDestinationActive(id: string, active: boolean) {
  const { error } = await supabase.from('destinations').update({ is_active: active }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Perkecil (maks 1600px) lalu unggah ke bucket publik destination-images. Mengembalikan URL publik. */
export async function uploadDestinationImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('Gagal memproses gambar.');
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from('destination-images').upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return supabase.storage.from('destination-images').getPublicUrl(path).data.publicUrl;
}

// ===================== Voucher =====================
export interface AdminVoucher {
  code: string; title: string; points_cost: number; discount_amount: number | null;
  discount_percent: number | null; is_active: boolean; expires_at: string | null;
}
export async function fetchVouchers(): Promise<AdminVoucher[]> {
  const { data, error } = await supabase.from('vouchers').select('*').order('code');
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminVoucher[];
}
export function validateVoucher(v: AdminVoucher): string | null {
  if (!/^[A-Z0-9_-]{3,30}$/.test(v.code)) return 'Kode: 3-30 karakter huruf besar, angka, _ atau -';
  if (!v.title.trim()) return 'Judul wajib diisi';
  if (!Number.isFinite(v.points_cost) || v.points_cost < 0) return 'Biaya poin tidak valid';
  if (v.discount_amount != null && v.discount_percent != null) return 'Pilih salah satu: potongan Rupiah atau persen';
  if (v.discount_amount != null && v.discount_amount < 0) return 'Potongan tidak valid';
  if (v.discount_percent != null && (v.discount_percent < 0 || v.discount_percent > 100)) return 'Persen harus 0-100';
  return null;
}
export async function saveVoucher(v: AdminVoucher) {
  const problem = validateVoucher(v);
  if (problem) throw new Error(problem);
  const { error } = await supabase.from('vouchers').upsert({
    code: v.code, title: v.title.trim(), points_cost: Math.round(v.points_cost),
    discount_amount: v.discount_amount, discount_percent: v.discount_percent,
    is_active: v.is_active, expires_at: v.expires_at
  });
  if (error) throw new Error(error.message);
}

// ===================== Aturan bisnis =====================
export interface Rules {
  settings: { platform_fee_percent: number; extra_guide_fee: number; pax_per_guide: number; guide_confirm_hours: number; payment_mode: 'midtrans' | 'demo' };
  tiers: { min_pax: number; discount_percent: number; label: string }[];
  policies: { min_days_before: number; refund_percent: number }[];
}
export async function fetchRules(): Promise<Rules> {
  const [s, t, p] = await Promise.all([
    supabase.from('app_settings').select('*'),
    supabase.from('pricing_tiers').select('*').order('min_pax'),
    supabase.from('cancellation_policies').select('*').order('min_days_before', { ascending: false })
  ]);
  const err = s.error || t.error || p.error;
  if (err) throw new Error(err.message);
  const map = Object.fromEntries((s.data ?? []).map((r: any) => [r.key, r.value]));
  return {
    settings: {
      platform_fee_percent: Number(map.platform_fee_percent ?? 10),
      extra_guide_fee: Number(map.extra_guide_fee ?? 150000),
      pax_per_guide: Number(map.pax_per_guide ?? 10),
      guide_confirm_hours: Number(map.guide_confirm_hours ?? 24),
      payment_mode: map.payment_mode === 'demo' ? 'demo' : 'midtrans'
    },
    tiers: (t.data ?? []) as Rules['tiers'],
    policies: (p.data ?? []) as Rules['policies']
  };
}
export const saveRules = (rules: Rules) =>
  rpc<void>('admin_save_rules', { p_settings: rules.settings, p_tiers: rules.tiers, p_policies: rules.policies });
