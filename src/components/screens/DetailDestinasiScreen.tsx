import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Sun, Clock, MapPin, Store, Plus, Check } from 'lucide-react';

export const DetailDestinasiScreen: React.FC = () => {
  const { currentUser, setActiveScreen, setRedirectAfterLogin, initDraftBooking } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Detail Destinasi
          </h1>

          <div className="w-8" />
        </div>
        
        {/* HERO IMAGE & WEATHER BADGE (exact as Figma Page 31) */}
        <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
            alt="Taman Air Mancur Sri Baduga"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Weather & Best Time Chips (exact as Figma Page 31) */}
          <div className="absolute bottom-4 left-4 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold shadow">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Cerah · 28°C</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-sky-950/80 backdrop-blur-md text-sky-200 text-xs font-medium border border-sky-400/40">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Waktu Terbaik: 16:00 – 19:00</span>
            </div>
          </div>
        </div>

        {/* TITLE & DESCRIPTION */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>PURWAKARTA, JAWA BARAT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19324d]">
            Taman Air Mancur Sri Baduga
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Situ Buleud merupakan danau bersejarah di pusat Purwakarta yang kini bertransformasi menjadi atraksi air mancur menari terbesar di Asia Tenggara dengan teknologi sinar laser modern.
          </p>
        </div>

        {/* SEJARAH & BUDAYA (exact as Figma Page 31) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d] flex items-center gap-2">
            <span>Sejarah & Budaya</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Dahulu merupakan area konservasi Badak Putih di masa kolonial. Kini menjadi pusat pelestarian budaya Sunda, tempat di mana nilai-nilai luhur bertemu dengan modernitas.
          </p>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              DOKUMENTASI BUDAYA
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl overflow-hidden relative h-32 group">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"
                  alt="Tari Jaipong"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold">
                  Tari Jaipong
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden relative h-32 group">
                <img
                  src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80"
                  alt="Pameran Seni"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold">
                  Pameran Seni Sunda
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* REKOMENDASI ITINERARY (exact as Figma Page 31) */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#19324d]">
              Rekomendasi Itinerary
            </h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
              Kepadatan Normal
            </span>
          </div>

          <div className="space-y-3.5 pl-2 border-l-2 border-[#19324d]/30 ml-2 text-xs">
            <div className="relative pl-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#19324d] absolute -left-[22px] top-1" />
              <strong className="text-[#19324d]">16:00 — Jalan Santai</strong>
              <p className="text-slate-500 mt-0.5">Menikmati udara sore di area pepohonan rindang Situ Buleud.</p>
            </div>

            <div className="relative pl-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute -left-[22px] top-1" />
              <strong className="text-[#19324d]">17:30 — Kuliner UMKM</strong>
              <p className="text-slate-500 mt-0.5">Eksplorasi jajanan lokal khas Purwakarta (Sate Maranggi & Es Ciming).</p>
            </div>

            <div className="relative pl-4">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 absolute -left-[22px] top-1" />
              <strong className="text-[#19324d]">19:30 — Puncak Air Mancur</strong>
              <p className="text-slate-500 mt-0.5">Pertunjukan utama air mancur menari berpadu tata cahaya laser spektakuler.</p>
            </div>
          </div>
        </div>

        {/* KULINER UMKM LOKAL (exact as Figma Page 31) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#19324d]">
              Kuliner UMKM Lokal
            </h3>
            <span className="text-xs text-[#19324d] font-semibold cursor-pointer">Lihat Semua</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex gap-3 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80"
                alt="Sate Maranggi"
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Sate Maranggi</h4>
                    <span className="text-xs font-extrabold text-amber-600">Rp 35.000</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    Sate daging sapi dengan bumbu rempah khas yang meresap sempurna.
                  </p>
                </div>
                <button className="text-[10px] text-[#19324d] font-bold bg-slate-100 px-2 py-1 rounded-lg w-fit hover:bg-slate-200 mt-1">
                  + Tambah ke Itinerary
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex gap-3 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80"
                alt="Es Ciming"
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Es Ciming</h4>
                    <span className="text-xs font-extrabold text-amber-600">Rp 15.000</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    Minuman legendaris Purwakarta dengan isian cendol, kacang hijau, dan sirup spesial.
                  </p>
                </div>
                <button className="text-[10px] text-[#19324d] font-bold bg-slate-100 px-2 py-1 rounded-lg w-fit hover:bg-slate-200 mt-1">
                  + Tambah ke Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM BAR (exact as Figma Page 31) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3.5 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
              PAKET WISATA BUDAYA
            </span>
            <span className="text-lg font-extrabold text-[#19324d]">
              Mulai Rp 35.000 / orang
            </span>
          </div>

          <button
            onClick={() => {
              initDraftBooking('Situ Buleud & Air Mancur Sri Baduga', 'Purwakarta, Jawa Barat');
              if (!currentUser) {
                setRedirectAfterLogin('booking-confirm');
                setActiveScreen('login');
              } else {
                setActiveScreen('booking-confirm');
              }
            }}
            className="px-6 py-3 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all"
          >
            PESAN SEKARANG
          </button>
        </div>
      </div>

    </div>
  );
};
