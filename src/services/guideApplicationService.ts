import { supabase } from '../lib/supabase';

export type DocType = 'ktp' | 'selfie' | 'cv' | 'certificate' | 'portfolio';
export type DocStatus = 'pending' | 'approved' | 'rejected';
export type GuideVerification = 'draft' | 'pending' | 'approved' | 'rejected' | 'need_fix';

export const DOC_LABEL: Record<DocType, string> = {
  cv: 'CV / Daftar Riwayat Hidup',
  certificate: 'Sertifikat Kompetensi',
  ktp: 'Foto KTP',
  portfolio: 'Foto Portofolio Tur',
  selfie: 'Verifikasi Wajah'
};
export const DOC_ORDER: DocType[] = ['cv', 'certificate', 'ktp', 'portfolio', 'selfie'];

export interface ApplicationDoc {
  id: string;
  type: DocType;
  status: DocStatus;
  adminNote: string | null;
  storagePath: string;
  uploadedAt: string;
}

export interface GuideApplication {
  verification: GuideVerification;
  note: string | null;
  docs: ApplicationDoc[];
}

/** Ringkasan satu baris per jenis dokumen: ditolak jika ada yang ditolak, menunggu jika ada yang menunggu. */
export function summarizeDocs(docs: ApplicationDoc[]) {
  return DOC_ORDER.map((type) => {
    const rows = docs.filter((d) => d.type === type);
    if (rows.length === 0) return null;
    const rejected = rows.find((d) => d.status === 'rejected');
    const status: DocStatus = rejected ? 'rejected' : rows.some((d) => d.status === 'pending') ? 'pending' : 'approved';
    return { type, status, reason: rejected?.adminNote ?? null, count: rows.length };
  }).filter(Boolean) as { type: DocType; status: DocStatus; reason: string | null; count: number }[];
}

const mapDoc = (d: any): ApplicationDoc => ({
  id: d.id,
  type: d.type,
  status: d.status,
  adminNote: d.admin_note,
  storagePath: d.storage_path,
  uploadedAt: d.uploaded_at
});

/** Status pengajuan pemandu milik user yang sedang login; null jika belum pernah mengajukan. */
export async function fetchMyApplication(): Promise<GuideApplication | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: guide, error } = await supabase
    .from('guides')
    .select('verification, verification_note')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!guide || guide.verification === 'draft') return null;
  const { data: docs, error: docError } = await supabase
    .from('guide_documents')
    .select('*')
    .eq('guide_id', auth.user.id)
    .order('uploaded_at');
  if (docError) throw new Error(docError.message);
  return { verification: guide.verification, note: guide.verification_note, docs: (docs ?? []).map(mapDoc) };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(head)?.[1] ?? 'image/jpeg';
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

const extOf = (file: Blob & { name?: string }) => {
  const fromName = file.name?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
};

export interface UploadItem {
  type: DocType;
  file: Blob;
}

/** Unggah ke bucket privat `guide-documents` pada folder <user_id>/. Mengembalikan daftar {type, path}. */
export async function uploadDocuments(userId: string, items: UploadItem[]) {
  const stamp = Date.now();
  return Promise.all(
    items.map(async (item, i) => {
      const path = `${userId}/${item.type}-${stamp}-${i}.${extOf(item.file as any)}`;
      const { error } = await supabase.storage
        .from('guide-documents')
        .upload(path, item.file, { contentType: item.file.type || undefined, upsert: false });
      if (error) throw new Error(`Gagal mengunggah ${DOC_LABEL[item.type]}: ${error.message}`);
      return { type: item.type, path };
    })
  );
}

export interface SubmitInput {
  docs: { type: DocType; path: string }[];
  phone?: string;
  address?: string;
  specialties?: string[];
  languages?: string[];
  pricePerDay?: number;
  workHours?: string;
  baseLocation?: string;
}

export async function submitApplication(input: SubmitInput) {
  const { error } = await supabase.rpc('submit_guide_application', {
    p_docs: input.docs,
    p_phone: input.phone ?? null,
    p_address: input.address ?? null,
    p_specialties: input.specialties ?? null,
    p_languages: input.languages ?? null,
    p_price_per_day: input.pricePerDay ?? null,
    p_work_hours: input.workHours ?? null,
    p_base_location: input.baseLocation ?? null
  });
  if (error) throw new Error(error.message);
}

// ===================== Admin =====================
export interface AdminApplication {
  id: string;
  name: string;
  phone: string;
  address: string;
  specialties: string[];
  languages: string[];
  pricePerDay: number;
  workHours: string;
  verification: GuideVerification;
  docs: ApplicationDoc[];
}

export async function fetchApplicationsForAdmin(): Promise<AdminApplication[]> {
  const { data, error } = await supabase
    .from('guides')
    .select('id, specialties, languages, price_per_day, work_hours, verification, profiles(full_name, phone, address), guide_documents(*)')
    .in('verification', ['pending', 'rejected'])
    .order('id');
  if (error) throw new Error(error.message);
  return (data ?? []).map((g: any) => {
    const p = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles;
    return {
      id: g.id,
      name: p?.full_name ?? '(tanpa nama)',
      phone: p?.phone ?? '-',
      address: p?.address ?? '-',
      specialties: g.specialties ?? [],
      languages: g.languages ?? [],
      pricePerDay: g.price_per_day ?? 0,
      workHours: g.work_hours ?? '-',
      verification: g.verification,
      docs: ((g.guide_documents ?? []) as any[]).map(mapDoc)
    };
  });
}

/** Tautan sementara (10 menit) untuk melihat dokumen privat. */
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage.from('guide-documents').createSignedUrls(paths, 600);
  if (error) throw new Error(error.message);
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => { if (r.path && r.signedUrl) map[r.path] = r.signedUrl; });
  return map;
}

export async function reviewDocument(docId: string, approve: boolean, note?: string) {
  const { error } = await supabase.rpc('admin_review_document', { p_doc: docId, p_approve: approve, p_note: note ?? null });
  if (error) throw new Error(error.message);
}

export async function finalizeGuide(guideId: string): Promise<'approved' | 'rejected'> {
  const { data, error } = await supabase.rpc('admin_finalize_guide', { p_guide: guideId });
  if (error) throw new Error(error.message);
  return data as 'approved' | 'rejected';
}
