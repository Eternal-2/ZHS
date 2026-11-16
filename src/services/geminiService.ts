import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, supabaseUrl } from '../lib/supabase';

/**
 * Chat AI dipanggil lewat Edge Function `ai-chat`.
 * API key Gemini TIDAK ada di browser: tersimpan sebagai secret di Supabase.
 */
export interface AiHistoryItem {
  sender: 'user' | 'ai' | 'admin';
  text: string;
}

/** Galat pemanggilan AI. `userMessage` aman ditampilkan ke pengguna; `detail` hanya untuk Console. */
export class AiError extends Error {
  status?: number;
  code: string;
  detail: string;
  userMessage: string;
  constructor(status: number | undefined, detail: string, code?: string) {
    super(`ai-chat gagal (${code ?? status ?? 'tanpa status'}): ${detail}`);
    this.status = status;
    this.code = code ?? String(status ?? 'jaringan');
    this.detail = detail;
    this.userMessage = `Maaf, asisten AI sedang tidak dapat dihubungi. Silakan coba beberapa saat lagi. (kode: ${this.code})`;
  }
}

const HINTS: Record<number, string> = {
  404: 'Fungsi ai-chat belum dideploy ke project Supabase ini (jalankan: supabase functions deploy ai-chat).',
  401: 'Fungsi menolak token (Verify JWT aktif). Deploy ulang dengan config.toml, atau matikan "Verify JWT" untuk ai-chat.',
  500: 'Kesalahan di server fungsi. Biasanya GEMINI_API_KEY belum diatur di Edge Functions > Secrets. Cek Logs fungsi.'
};

/**
 * Dipanggil saat permintaan tidak mendapat jawaban HTTP sama sekali. Browser menyembunyikan penyebabnya
 * (CORS/jaringan tampak sama), jadi kita bedakan lewat dua pemeriksaan ringan.
 */
async function diagnoseFetchFailure(): Promise<{ code: string; hint: string }> {
  if (!isSupabaseConfigured) {
    return {
      code: 'konfigurasi',
      hint: 'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY tidak terbaca di build ini. Periksa Environment Variables di Vercel (atau .env.local), lalu Redeploy tanpa build cache.'
    };
  }
  const url = `${supabaseUrl}/functions/v1/ai-chat`;
  try {
    const r = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(6000) });
    return {
      code: 'permintaan-ditolak',
      hint: `Fungsi menjawab GET (status ${r.status}) tetapi POST dari browser gagal. Buka tab Network, klik permintaan ai-chat (termasuk baris OPTIONS) dan lihat statusnya.`
    };
  } catch {
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors', signal: AbortSignal.timeout(6000) });
      return {
        code: 'fungsi-belum-aktif',
        hint: 'Server Supabase terjangkau, tetapi fungsi ai-chat tidak menjawab dengan benar: belum dideploy, Verify JWT aktif, atau gagal saat start. Buka alamat fungsi di tab baru dan cek Logs-nya.'
      };
    } catch {
      return {
        code: 'tidak-terjangkau',
        hint: 'Supabase tidak terjangkau: URL project salah, project dijeda (paket Free), atau koneksi internet terputus.'
      };
    }
  }
}

export async function callGeminiApi(userMessage: string, history: AiHistoryItem[] = []): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      message: userMessage,
      history: history.slice(-10).map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
    }
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const status = error.context.status;
      let detail = error.message;
      try {
        const body = await error.context.json();
        detail = body?.error ?? body?.message ?? JSON.stringify(body);
      } catch {
        detail = await error.context.text().catch(() => detail);
      }
      const hint = HINTS[status];
      console.error(`[ZHS] ai-chat gagal [${status}]: ${detail}${hint ? `\n→ ${hint}` : ''}`);
      throw new AiError(status, detail);
    }
    const diag = await diagnoseFetchFailure();
    console.error(`[ZHS] ai-chat gagal [${diag.code}]: ${error.message}\n→ ${diag.hint}`);
    throw new AiError(undefined, error.message, diag.code);
  }

  return data?.reply ?? 'Maaf, asisten ZHS sedang tidak dapat menjawab. Silakan coba lagi.';
}
