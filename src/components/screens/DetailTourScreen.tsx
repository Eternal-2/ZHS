import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, Clock, MapPin, Calendar, Users, Check, 
  ChevronRight, Store, ShieldCheck, AlertCircle, Share2 
} from 'lucide-react';

export const DetailTourScreen: React.FC = () => {
  const { 
    currentUser, 
    setActiveScreen, 
    setBookingParticipants, 
    initDraftBooking, 
    setRedirectAfterLogin 
  } = useAppStore();
  const [includeMaranggi, setIncludeMaranggi] = useState(true);
  const [isGroupTour, setIsGroupTour] = useState(false);

  const participants = isGroupTour ? 25 : 3;
  const basePricePerPerson = 35000;
  const maranggiPrice = includeMaranggi ? 35000 * participants : 0;
  const transportPrice = isGroupTour ? 450000 : 0;
  const totalEstimasi = basePricePerPerson * participants + maranggiPrice + transportPrice;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800" style={{ paddingBottom: '140px' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Detail Tour
          </h1>

          <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* HERO IMAGE & TITLE (exact as Figma Page 30) */}
        <div className="space-y-3">
          <div className="relative h-56 sm:h-80 rounded-3xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
              alt="Trip to Situ Buleud"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-300 shadow-sm">
              TERSEDIA
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19324d]">
                Trip to Situ Buleud
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span className="text-amber-500 font-bold">⭐ 4.5 (855 reviews)</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Purwakarta, Jawa Barat
                </span>
              </div>
            </div>

            {/* Toggle demo rombongan 25 orang (Figma Page 60) */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600 px-2">Mode Rombongan:</span>
              <button
                type="button"
                onClick={() => {
                  setIsGroupTour(!isGroupTour);
                  setBookingParticipants(!isGroupTour ? 25 : 3);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isGroupTour ? 'bg-[#19324d] text-white shadow' : 'bg-white text-slate-700 border'
                }`}
              >
                {isGroupTour ? '25 Orang (Multi-Guide)' : 'Pribadi (3 Orang)'}
              </button>
            </div>
          </div>
        </div>

        {/* 4-GRID SPECS (exact as Figma Page 30) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Clock className="w-5 h-5 text-sky-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">DURASI</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d]">3 Jam</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <MapPin className="w-5 h-5 text-indigo-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">MEETING POINT</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d] truncate block">Stasiun Purwakarta</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Calendar className="w-5 h-5 text-amber-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">JADWAL</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d]">1 April 2026</span>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Users className="w-5 h-5 text-emerald-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">MAKS PESERTA</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d]">
              {isGroupTour ? '25 Orang' : '5 Orang'}
            </span>
          </div>
        </div>

        {/* DESKRIPSI & NILAI BUDAYA (exact as Figma Page 30 & 32) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d]">
            Deskripsi & Nilai Budaya
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Situ Buleud merupakan ikon bersejarah Purwakarta yang dahulunya adalah tempat pemandian bagi badak purba. Kini, kawasan ini bertransformasi menjadi ruang publik yang memadukan keindahan alam dengan kemegahan air mancur menari Sri Baduga. Jelajahi area hijau yang asri dan rasakan denyut budaya Sunda yang masih terjaga erat di jantung kota.
          </p>

          <button
            onClick={() => setActiveScreen('detail-destinasi')}
            className="px-4 py-2 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Detail Destinasi & Sejarah
          </button>
        </div>

        {/* AGENDA PERJALANAN (Timeline exact as Figma Page 30) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d]">
            Agenda Perjalanan
          </h3>

          <div className="space-y-4 pl-2 border-l-2 border-[#19324d]/30 ml-2">
            <div className="relative pl-4">
              <span className="w-3 h-3 rounded-full bg-[#19324d] absolute -left-[23px] top-1" />
              <span className="text-xs font-bold text-[#19324d] block">08:00 — Meeting Point</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Berkumpul di Stasiun Purwakarta untuk briefing singkat keselamatan & perkenalan pemandu.
              </p>
            </div>

            <div className="relative pl-4">
              <span className="w-3 h-3 rounded-full bg-sky-600 absolute -left-[23px] top-1" />
              <span className="text-xs font-bold text-[#19324d] block">09:00 — Exploration</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Keliling area Situ Buleud dan mempelajari sejarah pohon randu kuno dan konservasi danau.
              </p>
            </div>

            <div className="relative pl-4">
              <span className="w-3 h-3 rounded-full bg-amber-500 absolute -left-[23px] top-1" />
              <span className="text-xs font-bold text-[#19324d] block">10:30 — Photo Session & Budaya</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Waktu bebas untuk mengabadikan momen di titik-titik ikonik dan Bale Panyawangan.
              </p>
            </div>
          </div>
        </div>

        {/* DUKUNG UMKM LOKAL (Bundling Sate Maranggi exact as Figma Page 30 & 60) */}
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-950">
                Dukung UMKM Lokal
              </h3>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-200/60 px-2 py-0.5 rounded-full">
              Kemitraan Resmi
            </span>
          </div>

          <div className="p-3.5 bg-white border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80"
                alt="Sate Maranggi"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                  Bundling Sate Maranggi Khas Purwakarta
                </h4>
                <p className="text-[11px] text-slate-500">
                  Nikmati kuliner autentik... <strong className="text-amber-600">+ Rp 35.000 / org</strong>
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={includeMaranggi}
              onChange={(e) => setIncludeMaranggi(e.target.checked)}
              className="w-5 h-5 accent-[#19324d] cursor-pointer"
            />
          </div>
        </div>

        {/* YANG TERMASUK (exact as Figma Page 30) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d]">
            Yang Termasuk
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Pemandu Berlisensi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Tiket Masuk Cagar Budaya</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Dokumentasi Foto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Snack & Air Mineral</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Transportasi Lokal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
              <span>Dana Aman Terjaga (Escrow)</span>
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM BOOKING BAR - di atas bottom nav (mobile only) */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 sm:px-6 py-3 shadow-2xl z-[60]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
              TOTAL ESTIMASI ({participants} PESERTA)
            </span>
            <span className="text-base sm:text-xl font-extrabold text-[#19324d]">
              Rp {totalEstimasi.toLocaleString('id-ID')}
            </span>
          </div>

          <button
            onClick={() => {
              initDraftBooking('Trip to Situ Buleud', 'Purwakarta, Jawa Barat');
              setBookingParticipants(participants);
              if (!currentUser) {
                setRedirectAfterLogin('booking-confirm');
                setActiveScreen('login');
              } else {
                setActiveScreen('booking-confirm');
              }
            }}
            className="px-5 py-2.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all"
          >
            PESAN SEKARANG
          </button>
        </div>
      </div>

    </div>
  );
};
