import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Star, ArrowLeft, QrCode, CheckCircle2, Camera, X, Image } from 'lucide-react';

const RATING_CATEGORIES = [
  { key: 'knowledge', label: 'Pengetahuan Pemandu' },
  { key: 'communication', label: 'Komunikasi & Keramahan' },
  { key: 'punctuality', label: 'Ketepatan Waktu' },
  { key: 'safety', label: 'Keselamatan & Keamanan' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Tidak Memuaskan',
  2: 'Kurang Memuaskan',
  3: 'Cukup Baik',
  4: 'Memuaskan',
  5: 'Sangat Memuaskan!',
};

export const ReviewScreen: React.FC = () => {
  const { activeBooking, setActiveScreen, completeTourCheckOut } = useAppStore();

  const [ratings, setRatings] = useState<Record<string, number>>({
    knowledge: activeBooking.reviewRating || 5,
    communication: activeBooking.reviewRating || 5,
    punctuality: activeBooking.reviewRating || 5,
    safety: activeBooking.reviewRating || 5,
  });
  const [reviewText, setReviewText] = useState(
    activeBooking.reviewComment ||
    'Pemandu sangat ramah, menjelaskan nilai sejarah dan cagar budaya dengan sangat mendalam. Sate Maranggi UMKM mitra juga sangat lezat!'
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [minCharError, setMinCharError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avgRating = Math.round(
    Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length
  );

  const handleSetRating = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev.slice(0, 4), ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewText.trim().length < 20) {
      setMinCharError('Ulasan minimal 20 karakter');
      return;
    }
    setMinCharError('');
    completeTourCheckOut(avgRating, reviewText, activeBooking.id);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col p-5 sm:p-8 max-w-lg mx-auto">

      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveScreen('live-tour')}
          className="p-1 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-wider text-[#19324d]">
          Beri Ulasan & Selesaikan Tur
        </h1>
        <div className="w-5" />
      </div>

      {isSuccess ? (
        /* ─── SUCCESS STATE ─── */
        <div className="my-auto py-10 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#19324d]">Ulasan Berhasil Dikirim!</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Terima kasih atas ulasan Anda! Dana Escrow sebesar{' '}
            <strong>Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong> telah dicairkan ke Pemandu{' '}
            <strong>{activeBooking.guide?.name}</strong>.
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-bold max-w-xs mx-auto">
            🎉 +100 Poin Gamifikasi Ditambahkan ke Akun Anda!
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 max-w-xs mx-auto">
            Status ulasan: <strong className="text-[#19324d]">Sudah Diulas ✓</strong>
          </div>

          <div className="space-y-2 pt-2 max-w-xs mx-auto">
            <button
              onClick={() => setActiveScreen('booking-detail')}
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md block transition-all"
            >
              Lihat Riwayat Booking
            </button>
            <button
              onClick={() => setActiveScreen('home')}
              className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-50 block transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 flex-1">

          {/* Guide Avatar & Name */}
          <div className="text-center space-y-2">
            <img
              src={activeBooking.guide?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt="Guide"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#19324d] mx-auto shadow-md"
            />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PEMANDU WISATA ANDA
            </span>
            <h3 className="text-lg font-extrabold text-[#19324d]">
              {activeBooking.guide?.name || 'Pemandu ZHS'}
            </h3>
            <p className="text-xs text-slate-500">{activeBooking.title}</p>
          </div>

          {/* ─── MULTI-KATEGORI RATING (Flow 5.1.7 step 5) ─── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-[#19324d] uppercase tracking-wider">
              Rating per Kategori
            </h4>
            {RATING_CATEGORIES.map((cat) => (
              <div key={cat.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">{cat.label}</span>
                  <span className={`text-[10px] font-bold ${ratings[cat.key] >= 4 ? 'text-emerald-600' : ratings[cat.key] >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
                    {RATING_LABELS[ratings[cat.key]]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleSetRating(cat.key, star)}
                      className={`transition-transform hover:scale-125 active:scale-95 ${
                        ratings[cat.key] >= star ? 'text-amber-400' : 'text-slate-200'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Average Rating Badge */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Rating Keseluruhan</span>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-extrabold text-[#19324d]">{avgRating}.0 / 5</span>
              </div>
            </div>
          </div>

          {/* ─── ULASAN NARASI (Flow 5.1.7 step 6) ─── */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Ulasan Naratif
            </label>
            <textarea
              rows={4}
              required
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                if (e.target.value.trim().length >= 20) setMinCharError('');
              }}
              placeholder="Ceritakan pengalaman Anda bersama pemandu... (min. 20 karakter)"
              className={`w-full p-4 bg-white border rounded-2xl text-xs text-slate-800 focus:outline-none shadow-sm leading-relaxed transition-colors ${
                minCharError ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#19324d]'
              }`}
            />
            <div className="flex justify-between">
              <p className={`text-[10px] ${minCharError ? 'text-red-500 font-semibold' : 'text-slate-400 italic'}`}>
                {minCharError || `"Ulasan Anda membantu UMKM lokal dan memperkuat reputasi pemandu!"`}
              </p>
              <span className={`text-[10px] font-mono ${reviewText.length < 20 ? 'text-red-400' : 'text-slate-400'}`}>
                {reviewText.length}/20+
              </span>
            </div>
          </div>

          {/* ─── UPLOAD FOTO OPSIONAL (Flow 5.1.7 step 7) ─── */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Foto Pendukung <span className="text-slate-400 font-normal normal-case">(Opsional, maks. 5)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                  <img src={photo} alt={`foto-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-[#19324d] hover:text-[#19324d] transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] mt-0.5">Tambah</span>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            {photos.length === 0 && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Image className="w-3.5 h-3.5" />
                <span>Unggah foto untuk memperkuat ulasan Anda</span>
              </p>
            )}
          </div>

          {/* ─── TIP QRIS OPSIONAL ─── */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center space-y-2 shadow-sm">
            <span className="text-[11px] font-bold text-[#19324d] uppercase tracking-wider block">
              Tip untuk Pemandu (Opsional)
            </span>
            <div className="w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl mx-auto flex flex-col items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-800" />
              <span className="text-[8px] font-mono text-slate-400 uppercase">QRIS TIP</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Scan QRIS untuk memberi apresiasi tip langsung
            </span>
          </div>

          {/* ─── ACTIONS ─── */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all"
            >
              Kirim Ulasan
            </button>
            <button
              type="button"
              onClick={() => setActiveScreen('home')}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-2"
            >
              Nanti Saja (Ingatkan saya kemudian)
            </button>
          </div>

        </form>
      )}
    </div>
  );
};
