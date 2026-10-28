import { supabase } from '../lib/supabase';

/**
 * Chat AI sekarang dipanggil lewat Edge Function `ai-chat`.
 * API key Gemini TIDAK lagi ada di browser: tersimpan sebagai secret di Supabase.
 */
export interface AiHistoryItem {
  sender: 'user' | 'ai' | 'admin';
  text: string;
}

export async function callGeminiApi(userMessage: string, history: AiHistoryItem[] = []): Promise<string> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: {
      message: userMessage,
      history: history.slice(-10).map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
    }
  });
  if (error) throw new Error(error.message);
  return data?.reply ?? 'Maaf, asisten ZHS sedang tidak dapat menjawab. Silakan coba lagi.';
}
