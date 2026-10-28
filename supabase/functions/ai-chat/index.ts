// Proxy chat AI. API key Gemini hanya ada di server (supabase secrets set GEMINI_API_KEY=...).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

// Model dicoba berurutan sampai ada yang berhasil. Ubah lewat secret GEMINI_MODELS (dipisah koma).
const MODELS = (Deno.env.get('GEMINI_MODELS') ??
  'gemini-3.5-flash,gemini-3.1-flash-lite,gemini-flash-latest,gemini-flash-lite-latest')
  .split(',').map((m) => m.trim()).filter(Boolean);

/** Susun konteks dari database agar jawaban AI selalu sama dengan data aplikasi (harga, refund, pemandu). */
async function buildKnowledge() {
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const [dest, guides, policies, tiers, settings] = await Promise.all([
    db.from('destinations').select('title,location,category,base_price,description').eq('is_active', true),
    db.from('public_guides').select('full_name,rating_avg,specialties,price_per_day,base_location'),
    db.from('cancellation_policies').select('*').order('min_days_before', { ascending: false }),
    db.from('pricing_tiers').select('*').order('min_pax'),
    db.from('app_settings').select('*')
  ]);
  const set = Object.fromEntries((settings.data ?? []).map((s: any) => [s.key, s.value]));
  const rupiah = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID');

  const destText = (dest.data ?? []).map((d: any) =>
    `- ${d.title} (${d.location}) — ${d.category}, ${rupiah(d.base_price)}/orang. ${d.description ?? ''}`).join('\n');
  const guideText = (guides.data ?? []).map((g: any) =>
    `- ${g.full_name} (rating ${g.rating_avg}, spesialis ${(g.specialties ?? []).join(', ')}, basis ${g.base_location ?? '-'})`).join('\n');
  const refundText = (policies.data ?? []).map((p: any) =>
    `- Pembatalan H-${p.min_days_before}${p.min_days_before > 0 ? ' atau lebih' : ''}: pengembalian ${p.refund_percent}%`).join('\n');
  const tierText = (tiers.data ?? []).map((t: any) => `- ${t.label}: diskon ${t.discount_percent}%`).join('\n');

  return `
Kamu adalah Asisten Cerdas Resmi platform Zam Zam Hidden Spot (ZHS).
ZHS menghubungkan wisatawan dengan pemandu wisata lokal berlisensi BNSP/HPI dan mitra UMKM lokal.

DESTINASI SAAT INI:
${destText || '- (belum ada data)'}

PEMANDU TERVERIFIKASI:
${guideText || '- (belum ada data)'}

DISKON KELOMPOK:
${tierText}
Biaya pemandu tambahan: ${rupiah(Number(set.extra_guide_fee ?? 0))} per ${set.pax_per_guide ?? 10} peserta berikutnya.

ESCROW: dana pembayaran ditampung di rekening bersama ZHS dan baru dicairkan ke pemandu setelah wisatawan melakukan check-out/konfirmasi tur selesai.

KEBIJAKAN REFUND RESMI:
${refundText}
Jika pemandu tidak konfirmasi dalam ${set.guide_confirm_hours ?? 24} jam, sistem menawarkan pemandu pengganti (Next-Best Match) atau refund.

SMART MATCH: Rating (25%), Minat (25%), Jarak GPS (15%), Budget (15%), Riwayat Tur (10%), Response Rate (10%).

ATURAN JAWABAN:
- Jawab dalam Bahasa Indonesia yang hangat, jelas, dan ringkas; gunakan poin bila perlu.
- Untuk harga, refund, dan kebijakan, HANYA gunakan data di atas. Jika tidak ada di data, katakan belum tahu dan arahkan ke Pusat Bantuan.
- Boleh membantu pertanyaan wisata umum (tips, sejarah, kuliner), tetapi jangan mengarang data pemandu, harga, atau kebijakan.
`.trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) return json({ error: 'GEMINI_API_KEY belum diatur' }, 500);

    const { message, history = [] } = await req.json();
    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return json({ error: 'Pesan tidak valid' }, 400);
    }

    const contents = [
      ...history.slice(-10).map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: String(h.text).slice(0, 2000) }] })),
      { role: 'user', parts: [{ text: message }] }
    ];
    const systemInstruction = { parts: [{ text: await buildKnowledge() }] };

    for (const model of MODELS) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 1200 }
        }),
        signal: AbortSignal.timeout(20000)
      }).catch(() => null);
      if (!res?.ok) continue;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return json({ reply: text });
    }
    return json({ reply: 'Maaf, asisten AI sedang sibuk. Silakan coba lagi atau hubungi Pusat Bantuan ZHS.' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Terjadi kesalahan server' }, 500);
  }
});
