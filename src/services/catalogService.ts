import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_GUIDES, MOCK_UMKM, MOCK_DESTINATIONS } from '../data/mockData';
import type { Guide, UMKM, Destination } from '../data/mockData';
import { AVAILABLE_DESTINATIONS, TRANSPORT_OPTIONS, FOOD_ADDON_ITEMS } from '../data/bookingExtras';
import type { DestinationItem, TransportOption, FoodAddOnItem } from '../data/bookingExtras';

/**
 * JEMBATAN MIGRASI
 * Komponen lama masih mengimpor array MOCK_* / AVAILABLE_DESTINATIONS secara langsung.
 * Agar UI tidak perlu ditulis ulang, array itu diisi ulang (in-place) dengan data dari database
 * sebelum aplikasi dirender. Jika Supabase belum dikonfigurasi atau tabel masih kosong,
 * data lokal tetap dipakai sebagai cadangan.
 */
const replaceInPlace = <T,>(target: T[], rows: T[]) => {
  if (rows.length > 0) target.splice(0, target.length, ...rows);
};

export const rowToGuide = (r: any, certs: string[] = []): Guide => ({
  id: r.id,
  name: r.full_name ?? 'Pemandu ZHS',
  avatar: r.avatar_url ?? '',
  rating: Number(r.rating_avg ?? 0),
  reviewsCount: r.reviews_count ?? 0,
  verified: r.verification === 'approved',
  badgeVerified: !!r.badge_verified,
  specialties: r.specialties ?? [],
  languages: r.languages ?? [],
  pricePerDay: r.price_per_day ?? 0,
  location: r.base_location ?? '',
  responseRate: r.response_rate ?? 100,
  completedTours: r.completed_tours ?? 0,
  bio: r.bio ?? '',
  certifications: certs
});

const rowToUmkm = (r: any): UMKM => ({
  id: r.id,
  name: r.name,
  category: r.category,
  owner: r.owner_name ?? '',
  location: r.location ?? '',
  rating: Number(r.rating_avg ?? 0),
  verified: !!r.verified,
  featuredProduct: r.featured_product ?? '',
  storytelling: r.storytelling ?? '',
  discountVoucher: r.voucher_code ?? undefined,
  bundlingAvailable: !!r.bundling_available,
  image: r.image_url ?? ''
});

export async function loadCatalog(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const [dest, transport, umkm, food, guides, certs] = await Promise.all([
      supabase.from('destinations').select('*, meeting_points(id,name,description)').eq('is_active', true).order('title'),
      supabase.from('transport_options').select('*').eq('is_active', true).order('price'),
      supabase.from('umkm_partners').select('*').eq('verified', true),
      supabase.from('food_items').select('*, umkm_partners(name), food_variants(*), food_sides(*)').eq('is_active', true),
      supabase.from('public_guides').select('*'),
      supabase.from('guide_certifications').select('guide_id,name')
    ]);
    const firstError = [dest, transport, umkm, food, guides, certs].find((r) => r.error)?.error;
    if (firstError) throw firstError;

    const destItems: DestinationItem[] = (dest.data ?? []).map((d: any) => ({
      id: d.slug,
      dbId: d.id,
      title: d.title,
      location: d.location,
      unitPrice: d.base_price,
      rating: `${(Number(d.rating_avg || 0) * 2).toFixed(1)}/10`,
      category: d.category,
      image: d.image_url ?? '',
      description: d.description ?? '',
      highlights: d.highlights ?? [],
      reviewsCount: d.reviews_count ?? 0,
      meetingPoints: (d.meeting_points ?? []).map((m: any) => ({ id: m.id, name: m.name, desc: m.description ?? '' }))
    }));
    replaceInPlace(AVAILABLE_DESTINATIONS, destItems);

    replaceInPlace(
      MOCK_DESTINATIONS,
      (dest.data ?? []).map((d: any): Destination => ({
        id: d.slug,
        title: d.title,
        subtitle: d.subtitle ?? d.location,
        category: d.category,
        location: d.location,
        image: d.image_url ?? '',
        rating: Number(d.rating_avg ?? 0),
        reviews: d.reviews_count ?? 0,
        estimatedBudget: d.base_price,
        description: d.description ?? '',
        highlights: d.highlights ?? []
      }))
    );

    replaceInPlace(
      TRANSPORT_OPTIONS,
      (transport.data ?? []).map((t: any): TransportOption => ({
        id: t.slug,
        dbId: t.id,
        name: t.name,
        capacityText: t.capacity_text ?? `${t.min_capacity} - ${t.max_capacity} orang`,
        minCapacity: t.min_capacity,
        maxCapacity: t.max_capacity,
        price: t.price,
        description: t.description ?? '',
        facilities: t.facilities ?? [],
        image: t.image_url ?? '',
        badge: t.badge ?? undefined,
        pickupPoints: t.pickup_points ?? []
      }))
    );

    replaceInPlace(MOCK_UMKM, (umkm.data ?? []).map(rowToUmkm));

    replaceInPlace(
      FOOD_ADDON_ITEMS,
      (food.data ?? []).map((f: any): FoodAddOnItem => {
        const variants = f.food_variants ?? [];
        return {
          id: f.id,
          umkmName: f.umkm_partners?.name ?? '',
          name: f.name,
          basePrice: f.base_price,
          description: f.description ?? '',
          image: f.image_url ?? '',
          category: f.category,
          variants: {
            groupName: variants[0]?.group_name ?? 'Pilihan',
            options: variants.map((v: any) => ({ label: v.label, priceDiff: v.price_diff }))
          },
          spicyOptions: f.spicy_options?.length ? f.spicy_options : undefined,
          sideOptions: (f.food_sides ?? []).map((s: any) => ({ id: s.id, label: s.label, price: s.price }))
        };
      })
    );

    const certMap = new Map<string, string[]>();
    (certs.data ?? []).forEach((c: any) => certMap.set(c.guide_id, [...(certMap.get(c.guide_id) ?? []), c.name]));
    replaceInPlace(MOCK_GUIDES, (guides.data ?? []).map((g: any) => rowToGuide(g, certMap.get(g.id))));

    return true;
  } catch (err) {
    console.error('[ZHS] Gagal memuat katalog dari Supabase, memakai data lokal:', err);
    return false;
  }
}
