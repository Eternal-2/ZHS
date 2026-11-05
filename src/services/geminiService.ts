import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  detail: string;
  userMessage: string;
  constructor(status: number | undefined, detail: string) {
    super(`ai-chat gagal (${status ?? 'tanpa status'}): ${detail}`);
    this.status = status;
    this.detail = detail;
    this.userMessage = `Maaf, asisten AI sedang tidak dapat dihubungi. Silakan coba beberapa saat lagi. (kode: ${status ?? 'jaringan'})`;
  }
}

const HINTS: Record<number, string> = {
  404: 'Fungsi ai-chat belum dideploy ke project Supabase ini (jalankan: supabase functions deploy ai-chat).',
  401: 'Fungsi menolak token (Verify JWT aktif). Deploy ulang dengan config.toml, atau matikan "Verify JWT" untuk ai-chat.',
  500: 'Kesalahan di server fungsi. Biasanya GEMINI_API_KEY belum diatur di Edge Functions > Secrets. Cek Logs fungsi.'
};

export async function callGeminiApi(userMessage: string, history: AiHistoryItem[] = []): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      message: userMessage,
      history: history.slice(-10).map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
    }
  });

  if (error) {
    let status: number | undefined;
    let detail = error.message;
    if (error instanceof FunctionsHttpError) {
      status = error.context.status;
      try {
        const body = await error.context.json();
        detail = body?.error ?? body?.message ?? JSON.stringify(body);
      } catch {
        detail = await error.context.text().catch(() => detail);
      }
    } else {
      detail = `${error.message} (periksa NEXT_PUBLIC_SUPABASE_URL dan koneksi internet)`;
    }
    const hint = status ? HINTS[status] : undefined;
    console.error(`[ZHS] ai-chat gagal [${status ?? 'jaringan'}]: ${detail}${hint ? `\n→ ${hint}` : ''}`);
    throw new AiError(status, detail);
  }

  return data?.reply ?? 'Maaf, asisten ZHS sedang tidak dapat menjawab. Silakan coba lagi.';
}
