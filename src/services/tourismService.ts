import { supabase } from '../lib/supabase';

// ===================== Notifikasi =====================
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  linkScreen: string | null;
  refId: string | null;
  isRead: boolean;
  createdAt: string;
}

const mapNotification = (n: any): AppNotification => ({
  id: n.id,
  title: n.title,
  body: n.body ?? '',
  linkScreen: n.link_screen ?? null,
  refId: n.ref_id ?? null,
  isRead: !!n.is_read,
  createdAt: n.created_at
});

export async function fetchNotifications(limit = 60): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw new Error(error.message);
}

export function subscribeNotifications(userId: string, onInsert: (n: AppNotification) => void) {
  const channel = supabase
    .channel(`notif-${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(mapNotification(payload.new)))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

/** "baru saja", "5 menit lalu", "2 jam lalu", "kemarin", atau tanggal. */
export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} jam lalu`;
  const day = Math.floor(hour / 24);
  if (day === 1) return 'kemarin';
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===================== Tiket bantuan =====================
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: 'open' | 'answered' | 'closed';
  source: string;
  createdAt: string;
  updatedAt: string;
}
export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

const mapTicket = (t: any): SupportTicket => ({
  id: t.id, userId: t.user_id, subject: t.subject, status: t.status, source: t.source, createdAt: t.created_at, updatedAt: t.updated_at
});
const mapMessage = (m: any): SupportMessage => ({
  id: m.id, ticketId: m.ticket_id, senderId: m.sender_id, body: m.body, createdAt: m.created_at
});
export const ticketCode = (id: string) => `#HB-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

export async function fetchMyTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabase.from('support_tickets').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapTicket);
}

export async function fetchTicketMessages(ticketId: string): Promise<SupportMessage[]> {
  const { data, error } = await supabase.from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMessage);
}

export async function createTicket(subject: string, body: string, source: 'help_center' | 'ai_handoff' = 'help_center') {
  const { data, error } = await supabase.rpc('create_support_ticket', { p_subject: subject, p_body: body, p_source: source });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function sendTicketMessage(ticketId: string, senderId: string, body: string) {
  const { error } = await supabase.from('support_messages').insert({ ticket_id: ticketId, sender_id: senderId, body });
  if (error) throw new Error(error.message);
}

export function subscribeTicketMessages(ticketId: string, onMessage: (m: SupportMessage) => void) {
  const channel = supabase
    .channel(`ticket-${ticketId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` },
      (payload) => onMessage(mapMessage(payload.new)))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ===================== Ulasan destinasi =====================
export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatar: string | null;
}

export async function fetchDestinationReviews(destinationDbId: string, limit = 5): Promise<PublicReview[]> {
  const { data, error } = await supabase
    .from('public_reviews').select('*').eq('destination_id', destinationDbId)
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id, rating: r.rating, comment: r.comment ?? '', createdAt: r.created_at,
    reviewerName: r.reviewer_name || 'Wisatawan', reviewerAvatar: r.reviewer_avatar
  }));
}

// ===================== Riwayat poin =====================
export interface PointsTx { id: string; amount: number; reason: string; createdAt: string; }

export async function fetchPointsHistory(userId: string, limit = 50): Promise<PointsTx[]> {
  const { data, error } = await supabase
    .from('points_transactions').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((p: any) => ({ id: p.id, amount: p.amount, reason: p.reason, createdAt: p.created_at }));
}

// ===================== Mode pembayaran (uji coba) =====================
export async function fetchPaymentMode(): Promise<'midtrans' | 'demo'> {
  const { data, error } = await supabase.rpc('payment_mode');
  if (error) return 'midtrans';
  return data === 'demo' ? 'demo' : 'midtrans';
}

export async function demoPay(bookingDbId: string) {
  const { error } = await supabase.rpc('demo_pay_booking', { p_booking: bookingDbId });
  if (error) throw new Error(error.message);
}

// ===================== Riwayat chat AI =====================
export interface AiHistoryRow { id: string; sender: 'user' | 'ai'; body: string; createdAt: string; }

export async function fetchAiHistory(userId: string, limit = 30): Promise<AiHistoryRow[]> {
  const { data, error } = await supabase
    .from('ai_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).reverse().map((m: any) => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.created_at }));
}

export async function saveAiMessages(userId: string, rows: { sender: 'user' | 'ai'; body: string }[]) {
  const { error } = await supabase.from('ai_messages').insert(rows.map((r) => ({ user_id: userId, ...r })));
  if (error) console.error('[ZHS] Gagal menyimpan riwayat chat AI:', error.message);
}

// ===================== Foto profil =====================
/** Perkecil ke maks 512px lalu unggah ke bucket publik `avatars/<user_id>/`. Mengembalikan URL publik. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  if (!blob) throw new Error('Gagal memproses gambar.');

  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

// ===================== Admin: kotak masuk bantuan =====================
export interface AdminTicket extends SupportTicket { userName: string; }

export async function fetchAllTicketsForAdmin(): Promise<AdminTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets').select('*, profiles(full_name)').order('updated_at', { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((t: any) => {
    const p = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
    return { ...mapTicket(t), userName: p?.full_name ?? '(tanpa nama)' };
  });
}

export async function setTicketClosed(ticketId: string, closed: boolean) {
  const { error } = await supabase.from('support_tickets').update({ status: closed ? 'closed' : 'open' }).eq('id', ticketId);
  if (error) throw new Error(error.message);
}
