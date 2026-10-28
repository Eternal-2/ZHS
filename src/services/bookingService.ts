import { supabase } from '../lib/supabase';
import { toIsoDate } from '../lib/dates';
import { MOCK_GUIDES, MOCK_UMKM } from '../data/mockData';
import type { Guide } from '../data/mockData';
import { AVAILABLE_DESTINATIONS, TRANSPORT_OPTIONS, FOOD_ADDON_ITEMS } from '../data/bookingExtras';
import type { FoodCartItem } from '../data/bookingExtras';
import { rowToGuide } from './catalogService';
import type { BookingState, DirectChatMessage } from '../store/useAppStore';

type PaymentMethod = BookingState['paymentMethod'];

const fmtLong = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const fmtLongTime = (iso?: string | null) =>
  iso ? `${fmtLong(iso)}, ${new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : undefined;

const BOOKING_SELECT = `
  *,
  destinations(slug,title,location,image_url),
  meeting_points(name),
  payments(method,status,created_at),
  booking_food_items(*, food_items(name, umkm_partners(name))),
  reviews(rating,comment)
`;

/** Baris database -> BookingState yang dipakai komponen UI. */
export function rowToBooking(r: any, guides: Map<string, Guide>, tourists: Map<string, { name: string; avatar: string }> = new Map()): BookingState {
  const review = Array.isArray(r.reviews) ? r.reviews[0] : r.reviews;
  const payments = [...(r.payments ?? [])].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  const transport = TRANSPORT_OPTIONS.find((t) => t.dbId === r.transport_id) ?? TRANSPORT_OPTIONS[0] ?? null;

  const foodAddOns: FoodCartItem[] = (r.booking_food_items ?? []).map((f: any) => {
    const catalog = FOOD_ADDON_ITEMS.find((x) => x.id === f.food_id);
    return {
      cartId: f.id,
      itemId: f.food_id,
      name: f.food_items?.name ?? catalog?.name ?? 'Menu',
      umkmName: f.food_items?.umkm_partners?.name ?? catalog?.umkmName ?? '',
      selectedVariant: f.variant_label ?? '',
      variantPriceDiff: 0,
      selectedSpicy: f.spicy ?? undefined,
      selectedSides: (catalog?.sideOptions ?? []).filter((s) => (f.side_ids ?? []).includes(s.id)),
      unitPrice: f.unit_price,
      quantity: f.quantity,
      notes: f.notes ?? '',
      totalPrice: f.total_price
    };
  });

  return {
    id: r.code,
    dbId: r.id,
    touristName: tourists.get(r.id)?.name,
    touristAvatar: tourists.get(r.id)?.avatar,
    title: r.destinations?.title ?? '',
    destination: r.destinations?.location ?? '',
    destinationId: r.destinations?.slug,
    destinationImage: r.destinations?.image_url ?? undefined,
    unitPrice: r.unit_price,
    guide: guides.get(r.guide_id) ?? null,
    coGuides: [],
    guidesCount: r.guides_count,
    date: fmtLong(r.tour_date),
    participants: r.participants,
    originalAmount: r.tour_subtotal + r.extra_guides_fee + r.transport_fee + r.food_subtotal,
    discountAmount: r.discount_amount,
    totalAmount: r.total_amount,
    paymentMethod: (payments[0]?.method as PaymentMethod) ?? 'QRIS',
    status: r.status,
    checkInQrCode: r.checkin_qr,
    meetingPoint: r.meeting_points?.name ?? '',
    bundledUMKM: MOCK_UMKM.find((u) => u.id === r.umkm_id) ?? null,
    selectedTransport: transport,
    foodAddOns,
    includeTransport: !!r.transport_id,
    notes: r.notes ?? '',
    voucherCode: r.voucher_code ?? undefined,
    createdAt: fmtLong(r.created_at),
    completedAt: fmtLongTime(r.completed_at),
    reviewRating: review?.rating,
    reviewComment: review?.comment
  };
}

async function guidesById(ids: string[]): Promise<Map<string, Guide>> {
  const map = new Map<string, Guide>();
  const known = new Map(MOCK_GUIDES.map((g) => [g.id, g]));
  const missing = ids.filter((id) => !known.has(id));
  ids.forEach((id) => known.has(id) && map.set(id, known.get(id)!));
  if (missing.length) {
    const { data } = await supabase.from('public_guides').select('*').in('id', missing);
    (data ?? []).forEach((g: any) => map.set(g.id, rowToGuide(g)));
  }
  return map;
}

async function touristsByBooking(bookingIds: string[]) {
  const map = new Map<string, { name: string; avatar: string }>();
  if (!bookingIds.length) return map;
  const { data } = await supabase.from('booking_tourists').select('*').in('booking_id', bookingIds);
  (data ?? []).forEach((t: any) => map.set(t.booking_id, { name: t.full_name, avatar: t.avatar_url ?? '' }));
  return map;
}

export async function fetchMyBookings(userId: string, role: 'wisatawan' | 'pemandu' | string): Promise<BookingState[]> {
  const column = role === 'pemandu' ? 'guide_id' : 'tourist_id';
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq(column, userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const guides = await guidesById([...new Set(rows.map((r: any) => r.guide_id))]);
  const tourists = await touristsByBooking(rows.map((r: any) => r.id));
  return rows.map((r: any) => rowToBooking(r, guides, tourists));
}

export async function fetchBookingByDbId(dbId: string): Promise<BookingState | null> {
  const { data, error } = await supabase.from('bookings').select(BOOKING_SELECT).eq('id', dbId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const guides = await guidesById([data.guide_id]);
  const tourists = await touristsByBooking([data.id]);
  return rowToBooking(data, guides, tourists);
}

/** Buat booking di server. Harga dihitung ulang oleh fungsi SQL `create_booking`, bukan oleh React. */
export async function createBooking(draft: BookingState): Promise<BookingState> {
  const dest = AVAILABLE_DESTINATIONS.find((d) => d.id === draft.destinationId);
  if (!dest?.dbId) throw new Error('Destinasi belum tersedia di database.');
  if (!draft.guide) throw new Error('Pilih pemandu terlebih dahulu.');

  const meetingPoint = dest.meetingPoints.find((m) => m.name === draft.meetingPoint);
  const transportId = draft.selectedTransport?.dbId && draft.selectedTransport.id !== 'none' ? draft.selectedTransport.dbId : null;

  const foods = (draft.foodAddOns ?? []).map((f) => ({
    food_id: f.itemId,
    qty: f.quantity,
    variant_label: f.selectedVariant || null,
    spicy: f.selectedSpicy ?? null,
    side_ids: f.selectedSides.map((s) => s.id),
    notes: f.notes || null
  }));

  const { data, error } = await supabase.rpc('create_booking', {
    p_destination: dest.dbId,
    p_guide: draft.guide.id,
    p_date: toIsoDate(draft.date),
    p_participants: draft.participants,
    p_meeting_point: meetingPoint?.id ?? null,
    p_transport: transportId,
    p_umkm: draft.bundledUMKM?.id ?? null,
    p_notes: draft.notes || null,
    p_voucher: draft.voucherCode ?? null,
    p_foods: foods
  });
  if (error) throw new Error(error.message);
  const created = await fetchBookingByDbId((data as any).id);
  if (!created) throw new Error('Booking dibuat tetapi gagal dibaca kembali.');
  return created;
}

export interface PaymentInfo {
  method: PaymentMethod;
  qrUrl?: string;
  vaNumber?: string;
  deeplinkUrl?: string;
  expiresAt?: string;
}

/** Minta tagihan ke Edge Function `create-payment` (kunci payment gateway tersimpan di server). */
export async function createPayment(bookingDbId: string, method: PaymentMethod): Promise<PaymentInfo> {
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: { booking_id: bookingDbId, method }
  });
  if (error) throw new Error(error.message);
  return {
    method,
    qrUrl: data?.qr_url,
    vaNumber: data?.va_number,
    deeplinkUrl: data?.deeplink_url,
    expiresAt: data?.expires_at
  };
}

/** Dengarkan perubahan status booking secara realtime (mis. pembayaran terkonfirmasi dari webhook). */
export function subscribeBookingStatus(dbId: string, onStatus: (status: string) => void) {
  const channel = supabase
    .channel(`booking-${dbId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${dbId}` }, (payload) =>
      onStatus((payload.new as any).status)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

const rpc = async (fn: string, args?: Record<string, unknown>) => {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};

export const cancelBookingRpc = (dbId: string) => rpc('cancel_booking', { p_booking: dbId }) as Promise<number>;
export const guideConfirmRpc = (dbId: string) => rpc('guide_confirm_booking', { p_booking: dbId });
export const guideStartTourRpc = (qr: string) => rpc('guide_start_tour', { p_qr: qr }) as Promise<string>;
export const completeTourRpc = (dbId: string, rating: number, comment: string) =>
  rpc('complete_tour', { p_booking: dbId, p_rating: rating, p_comment: comment });
export const redeemVoucherRpc = (code: string) => rpc('redeem_voucher', { p_code: code });
export const requestWithdrawalRpc = (amount: number) => rpc('request_withdrawal', { p_amount: amount });

export async function fetchWalletBalance(guideId: string): Promise<number> {
  const { data } = await supabase.from('guide_balances').select('balance').eq('guide_id', guideId).maybeSingle();
  return Number(data?.balance ?? 0);
}

export async function fetchPoints(userId: string): Promise<number> {
  const { data } = await supabase.from('profiles').select('points').eq('id', userId).single();
  return data?.points ?? 0;
}

export async function runSmartMatch(interest: string, budget: number) {
  const { data, error } = await supabase.rpc('smart_match', { p_interest: interest, p_budget: budget });
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{
    guide_id: string; rating_score: number; interest_score: number; distance_score: number;
    budget_score: number; history_score: number; response_score: number; match_score: number;
  }>;
}

// ---------- Chat ----------
export interface ChatCtx {
  me: string;                              // id user yang sedang login
  myRole: 'wisatawan' | 'pemandu';
  names: { me: string; other: string };
  avatars: { me: string; other: string };
}

const toChat = (m: any, bookingCode: string, ctx: ChatCtx): DirectChatMessage => {
  const mine = m.sender_id === ctx.me;
  const otherRole = ctx.myRole === 'pemandu' ? 'wisatawan' : 'pemandu';
  return {
    id: m.id,
    bookingId: bookingCode,
    senderRole: mine ? ctx.myRole : otherRole,
    senderName: mine ? ctx.names.me : ctx.names.other,
    senderAvatar: mine ? ctx.avatars.me : ctx.avatars.other,
    text: m.body,
    timestamp: new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
  };
};

export async function fetchChat(bookingDbId: string, bookingCode: string, ctx: ChatCtx) {
  const { data, error } = await supabase
    .from('booking_messages').select('*').eq('booking_id', bookingDbId).order('created_at');
  if (error) throw error;
  return (data ?? []).map((m) => toChat(m, bookingCode, ctx));
}

export async function sendChat(bookingDbId: string, senderId: string, body: string) {
  const { error } = await supabase.from('booking_messages').insert({ booking_id: bookingDbId, sender_id: senderId, body });
  if (error) throw error;
}

export function subscribeChat(bookingDbId: string, bookingCode: string, ctx: ChatCtx, onMessage: (m: DirectChatMessage) => void) {
  const channel = supabase
    .channel(`chat-${bookingDbId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${bookingDbId}` },
      (payload) => onMessage(toChat(payload.new, bookingCode, ctx)))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}

// ---------- Destinasi yang dikelola pemandu ----------
export async function fetchGuideDestinations(guideId: string): Promise<string[]> {
  const { data } = await supabase.from('guide_destinations').select('destinations(slug)').eq('guide_id', guideId);
  return (data ?? []).map((r: any) => r.destinations?.slug).filter(Boolean);
}

export async function saveGuideDestinations(guideId: string, slugs: string[]) {
  const ids = AVAILABLE_DESTINATIONS.filter((d) => slugs.includes(d.id) && d.dbId).map((d) => d.dbId!);
  await supabase.from('guide_destinations').delete().eq('guide_id', guideId);
  if (ids.length) {
    const { error } = await supabase.from('guide_destinations').insert(ids.map((destination_id) => ({ guide_id: guideId, destination_id })));
    if (error) throw error;
  }
}
