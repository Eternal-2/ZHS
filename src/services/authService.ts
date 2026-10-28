import { supabase } from '../lib/supabase';
import type { User } from '../store/useAppStore';

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  nationality?: string;
  languages?: string[];
  travelPreferences?: string[];
  emergencyName?: string;
  emergencyPhone?: string;
}

/** Ubah baris tabel `profiles` menjadi objek User yang dipakai UI. */
export function profileToUser(p: any, email: string): User {
  return {
    id: p.id,
    name: p.full_name,
    username: p.username ?? email.split('@')[0],
    email,
    role: p.role,
    phone: p.phone ?? '',
    avatar: p.avatar_url ?? FALLBACK_AVATAR,
    points: p.points ?? 0,
    level: p.level ?? 'Explorer',
    isVerified: !!p.is_verified,
    address: p.address ?? undefined,
    city: p.city ?? undefined,
    country: p.country ?? undefined,
    languages: p.languages ?? [],
    travelPreferences: p.travel_preferences ?? [],
    emergencyContact: p.emergency_name ? { name: p.emergency_name, phone: p.emergency_phone ?? '' } : undefined
  };
}

export async function fetchCurrentUser(): Promise<User | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return null;
  let { data: profile, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (error) console.error('[ZHS] Gagal membaca profil:', error.message);

  if (!profile) {
    // Akun (mis. Google) yang barisnya belum terbentuk: minta server membuatnya, lalu baca ulang.
    const { error: rpcError } = await supabase.rpc('ensure_profile');
    if (rpcError) {
      console.error('[ZHS] ensure_profile gagal (sudah menjalankan SQL terbaru?):', rpcError.message);
      return null;
    }
    ({ data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle());
  }
  if (!profile) return null;
  return profileToUser(profile, session.user.email ?? '');
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return fetchCurrentUser();
}

export async function signInWithProvider(provider: 'google' | 'facebook') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
  if (error) throw error;
}

/** Langkah 1 pendaftaran: Supabase mengirim kode 6 digit ke email (aktifkan "Confirm email" di Auth settings). */
export async function signUp(input: RegisterInput) {
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName, phone: input.phone } }
  });
  if (error) throw error;
}

/** Langkah 2: verifikasi kode OTP, lalu lengkapi profil. */
export async function verifySignUpOtp(email: string, token: string, input: RegisterInput) {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) throw error;
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        gender: input.gender || null,
        birth_date: input.birthDate || null,
        address: input.address || null,
        city: input.city || null,
        nationality: input.nationality || null,
        languages: input.languages ?? [],
        travel_preferences: input.travelPreferences ?? [],
        emergency_name: input.emergencyName || null,
        emergency_phone: input.emergencyPhone || null
      })
      .eq('id', data.user.id);
  }
}

export async function resendSignUpOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function updateProfileRow(userId: string, patch: Partial<User>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.full_name = patch.name;
  if (patch.username !== undefined) row.username = patch.username;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.country !== undefined) row.country = patch.country;
  if (patch.languages !== undefined) row.languages = patch.languages;
  if (patch.travelPreferences !== undefined) row.travel_preferences = patch.travelPreferences;
  if (patch.emergencyContact !== undefined) {
    row.emergency_name = patch.emergencyContact.name;
    row.emergency_phone = patch.emergencyContact.phone;
  }
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw error;
}
