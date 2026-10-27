export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const DEFAULT_GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

const ZHS_SYSTEM_INSTRUCTION = `
Kamu adalah Asisten Cerdas Resmi platform Zam Zam Hidden Spot (ZHS).
ZHS adalah platform ekosistem travelling dan tour guide terpadu (v2.0) yang menghubungkan wisatawan dengan pemandu wisata lokal berlisensi BNSP/HPI dan mitra UMKM lokal.

Konteks Sistem & Pengetahuan Platform ZHS:
1. Destinasi Unggulan:
   - Taman Air Mancur Sri Baduga & Situ Buleud (Purwakarta, Jawa Barat): Danau bersejarah era kolonial, konservasi cagar budaya Sunda, air mancur menari laser terbesar, kuliner Sate Maranggi Hj. Yetty dan Es Ciming.
   - Gracia Spa Hot Spring Pool (Subang): Kolam air panas belerang alami di tengah kebun teh Ciater.
   - Museum Benteng Vredeburg (Yogyakarta): Peninggalan kolonial dengan diorama sejarah perjuangan nasional.
   - Tur Sunrise Gunung Bromo (Probolinggo): Wisata alam savana dan matahari terbit.
   - Pasir Langlang Panyawangan (Ujung Aspal, Wanayasa): Hutan pinus asri untuk piknik keluarga.
   - Curug Cipurut & Curug Tilu: Wisata air terjun dan kolam alami tersembunyi di Purwakarta.
2. Pemandu Wisata Terverifikasi (Berlisensi BNSP):
   - Bambang Pamungkas (Rating 4.9, Spesialis Cagar Budaya & Sejarah, Midnight Blue Badge).
   - Siti Aminah (Rating 4.8, Ramah Keluarga & Kuliner).
   - Furab (Rating 4.7, Fotografer Lapangan & Petualangan).
3. Mitra UMKM & Storytelling:
   - Kemitraan resmi dengan UMKM kuliner & kriya lokal (Sate Maranggi, Batik Tulis Alami, Madu Hutan Lestari, Kopi Osing). Setiap pemesanan tur langsung memberdayakan ekonomi warga lokal.
4. Jaminan Pembayaran Escrow (Dana Aman Terjaga):
   - Dana pembayaran wisatawan TIDAK langsung dicairkan ke rekening pemandu, melainkan ditampung di sistem Rekening Bersama Escrow resmi ZHS. Dana baru dicairkan setelah tur selesai divalidasi dan dikonfirmasi oleh wisatawan.
5. Kebijakan Refund & Pembatalan Resmi:
   - Pembatalan H-3 atau lebih sebelum hari tur: 100% Pengembalian Dana penuh ke rekening asal.
   - Pembatalan H-1: 50% Pengembalian Dana.
   - Pembatalan H-0 (hari pelaksanaan tur): 0% (Hangus).
   - Jika pemandu tidak konfirmasi dalam 24 jam: Sistem otomatis menawarkan Next-Best Match (pemandu pengganti) atau refund 100% instan.
6. Algoritma Smart Match Engine (100%):
   - Rating Pemandu (25%), Kecocokan Minat Wisata (25%), Jarak GPS (15%), Budget (15%), Riwayat Tur (10%), Response Rate (10%).

Instruksi Respon:
- WAJIB menjawab secara spesifik, kontekstual, dan langsung menjawab apa pun yang ditanyakan oleh pengguna! JANGAN memberikan jawaban template yang kaku atau generic jika pengguna menanyakan hal spesifik.
- Berikan jawaban yang kaya, mendalam, hangat, terstruktur rapi (gunakan poin-poin/markdown), dan dalam Bahasa Indonesia yang komunikatif.
- Kamu memiliki kebebasan penuh untuk menjawab semua pertanyaan apa saja (baik seputar wisata, rekomendasi tempat, sejarah, kuliner, tips persiapan, teknis sistem SCM ZHS, maupun pertanyaan umum sehari-hari).
`;

export async function callGeminiApi(
  userPrompt: string,
  history: { sender: 'user' | 'ai' | 'admin'; text: string }[],
  _customApiKey?: string
): Promise<string> {
  const apiKey = _customApiKey || (typeof window !== 'undefined' && localStorage.getItem('zhs_gemini_api_key')) || DEFAULT_GEMINI_API_KEY;
  if (!apiKey) {
    return getOfflineFallbackResponse(userPrompt);
  }

  try {
    const formattedContents: GeminiMessage[] = [];

    // Add recent history (up to last 6 messages) for contextual conversation
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      if (msg.sender === 'user') {
        formattedContents.push({
          role: 'user',
          parts: [{ text: msg.text }]
        });
      } else if (msg.sender === 'ai') {
        formattedContents.push({
          role: 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Add current user prompt
    formattedContents.push({
      role: 'user',
      parts: [{ text: userPrompt }]
    });

    // Active models verified on this project's API version
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3-flash-preview',
      'gemini-flash-lite-latest',
      'gemini-3.7-flash'
    ];

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: ZHS_SYSTEM_INSTRUCTION }]
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.75,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1500,
            }
          })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate && candidate.trim().length > 0) {
            return candidate.trim();
          }
        } else {
          const errBody = await response.json().catch(() => ({}));
          console.warn(`Model ${model} returned error:`, response.status, errBody);
        }
      } catch (subErr) {
        console.warn(`Attempt with ${model} timed out or failed:`, subErr);
      }
    }

    // Fallback only if all live Google models fail to connect
    return getOfflineFallbackResponse(userPrompt);
  } catch (error) {
    console.error('Gemini API fetch error:', error);
    return getOfflineFallbackResponse(userPrompt);
  }
}

function getOfflineFallbackResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('situ buleud') || lower.includes('sri baduga') || lower.includes('sejarah')) {
    return 'Situ Buleud merupakan danau cagar budaya seluas 4 hektar di pusat Purwakarta yang dibangun sejak era kolonial Belanda. Awalnya danau ini difungsikan sebagai area konservasi badak putih purba, sebelum berkembang menjadi pusat kebudayaan Sunda dengan Air Mancur Menari Sri Baduga berlaser spektakuler terbesar di Asia Tenggara.';
  } else if (lower.includes('refund') || lower.includes('batal') || lower.includes('uang kembali')) {
    return 'Kebijakan Pengembalian Dana (Refund) ZHS:\n• Pembatalan H-3 atau lebih: 100% Pengembalian Dana penuh ke rekening asal.\n• Pembatalan H-1: 50% Pengembalian Dana.\n• Pembatalan H-0 (hari pelaksanaan tur): 0% (Hangus).\nSemua transaksi diproteksi aman melalui sistem Rekening Bersama Escrow (Dana Aman Terjaga).';
  } else if (lower.includes('escrow') || lower.includes('dana aman') || lower.includes('bayar')) {
    return 'Sistem Escrow "Dana Aman Terjaga" ZHS menampung pembayaran Anda secara transparan di rekening bersama resmi ZHS. Dana baru diteruskan ke pemandu lokal setelah tur selesai terlaksana dan Anda mengonfirmasi kedatangan di lokasi.';
  } else if (lower.includes('pemandu') || lower.includes('rekomendasi') || lower.includes('guide')) {
    return 'Kami merekomendasikan pemandu berlisensi resmi BNSP/HPI kami:\n1. Bambang Pamungkas (⭐ 4.9 - Spesialis Sejarah, Budaya & Cagar Budaya Purwakarta)\n2. Siti Aminah (⭐ 4.8 - Spesialis Budaya Sunda & Ramah Anak/Keluarga)\n3. Furab (⭐ 4.7 - Fotografer Dokumentasi & Petualangan Alam)';
  } else {
    return `Halo! Saya Asisten AI Zam Zam Hidden Spot (didukung Google Gemini). Saya siap menjawab pertanyaan Anda seputar destinasi wisata cagar budaya, pemandu berlisensi, sistem Escrow Dana Aman Terjaga, rekomendasi kuliner UMKM lokal, maupun tips perjalanan. Ada yang bisa saya bantu?`;
  }
}
