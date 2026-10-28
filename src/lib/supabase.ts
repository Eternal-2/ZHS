import { createClient } from '@supabase/supabase-js';

// Isi di Vercel > Settings > Environment Variables (atau .env.local saat development).
// Penting: harus ditulis persis `process.env.NEXT_PUBLIC_...` agar Next.js menanamkan nilainya ke browser.
// Kunci publishable/anon AMAN ada di browser karena akses data dijaga Row Level Security di database.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const isValidUrl = (value?: string) => {
  try {
    return !!value && /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** false = env belum benar; katalog memakai data lokal dan fitur transaksi tidak berfungsi. */
export const isSupabaseConfigured = isValidUrl(rawUrl) && Boolean(rawKey);

if (!isSupabaseConfigured) {
  console.error(
    '[ZHS] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tidak valid. Periksa .env.local atau Environment Variables di Vercel, lalu build ulang.'
  );
}

export const supabase = createClient(
  isValidUrl(rawUrl) ? rawUrl! : 'http://localhost:54321',
  rawKey || 'anon-key-belum-diisi',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
