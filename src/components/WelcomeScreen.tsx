import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LogoZH } from './LogoZH';
import { 
  ShieldCheck, Compass, Store, 
  ArrowRight, CheckCircle2, ChevronRight, Star, MapPin
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();

  const featuredSpots = [
    {
      id: 'situ-buleud',
      title: 'Situ Buleud & Air Mancur Sri Baduga',
      location: 'Purwakarta, Jawa Barat',
      price: 'Rp 35.000',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'pasir-langlang',
      title: 'Pasir Langlang Panyawangan (Hutan Pinus)',
      location: 'Wanayasa, Purwakarta',
      price: 'Rp 40.500',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'bromo-sunrise',
      title: 'Tur Sunrise Savana Gunung Bromo',
      location: 'Probolinggo, Jawa Timur',
      price: 'Rp 360.000',
      rating: '4.95',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 py-3.5 sticky top-0 z-20 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveScreen('welcome')}>
          <LogoZH size={40} withContainer={true} />
          <div>
            <h1 className="text-[#19324d] font-extrabold text-base leading-tight tracking-tight">
              Zamzam Hidden Spot
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              #Guided by Knowledge & Insight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScreen('explore')}
            className="text-xs font-bold text-[#19324d] hover:text-sky-700 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors hidden sm:block"
          >
            Jelajahi Wisata
          </button>
          <button
            onClick={() => setActiveScreen('register')}
            className="text-xs font-bold text-[#19324d] px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors hidden sm:block"
          >
            Daftar
          </button>
          <button
            id="btn-guide-register-nav"
            onClick={() => setActiveScreen('guide-register')}
            className="text-xs font-bold text-amber-700 px-4 py-2 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors hidden sm:block"
          >
            Jadi Pemandu
          </button>
          <button
            id="btn-nav-login"
            onClick={() => setActiveScreen('login')}
            className="text-xs font-bold text-white px-5 py-2 rounded-full bg-[#19324d] hover:bg-[#122438] shadow-sm transition-transform active:scale-95"
          >
            Masuk / Login
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 md:py-16 space-y-12 z-10">
        
        {/* HERO SECTION: SIMPLE, RINGKAS, CIRI KHAS ZHS */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold tracking-wide shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Ekosistem Reservasi Wisata Cagar Budaya & Escrow Terpadu</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[#19324d] tracking-tight leading-tight">
            Jelajahi Hidden Spot Nusantara Bersama Pemandu Berlisensi Resmi
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Temukan spot wisata tersembunyi dengan jaminan <strong className="text-emerald-700">Escrow 100% Aman</strong>, dipandu langsung oleh pemandu bersertifikasi <strong className="text-[#19324d]">BNSP</strong>, serta kemitraan kuliner lokal autentik.
          </p>

          {/* TWO PRIMARY CTA BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="btn-explore-welcome"
              onClick={() => setActiveScreen('explore')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Mulai Jelajahi Wisata</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-login-hero"
              onClick={() => setActiveScreen('login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-[#19324d] font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>Masuk ke Akun</span>
            </button>

            <button
              id="btn-guide-register-hero"
              onClick={() => setActiveScreen('guide-register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-800 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>Daftar sebagai Pemandu</span>
            </button>
          </div>
        </div>

        {/* 3 CORE VALUE PILLARS (FOKUS PADA APA YANG DITAWARKAN ZHS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Pillar 1: Escrow Protection */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                100% Aman
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Dana Aman Terjaga (Escrow)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                Pembayaran Anda disimpan di rekening penampung bersama ZHS. Dana baru dicairkan ke pemandu setelah verifikasi tur selesai di lokasi.
              </p>
            </div>
          </div>

          {/* Pillar 2: BNSP Guide */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-900">
                Rasio 1:10
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Pemandu Resmi BNSP
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                Pemandu wisata bersertifikasi resmi dan paham cagar budaya lokal. Rekomendasi 1 pemandu per 10 orang menjamin pengalaman trip tetap intim dan aman.
              </p>
            </div>
          </div>

          {/* Pillar 3: UMKM Bundling & Transport */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-100 text-sky-900">
                Mitra Lokal
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Kemitraan UMKM & Transport
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                Dukungan langsung ekonomi desa lewat bundling kuliner khas daerah (Sate Maranggi, oleh-oleh) serta armada transportasi siap antar-jemput.
              </p>
            </div>
          </div>

        </div>

        {/* FEATURED DESTINATIONS PREVIEW (CAN EXPLORE FREELY) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[#19324d]">
                Pilihan Destinasi Wisata Populer
              </h3>
              <p className="text-xs text-slate-500">
                Bebas jelajahi informasi spot wisata, rute, dan jadwal sebelum login
              </p>
            </div>

            <button
              onClick={() => setActiveScreen('explore')}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua Katalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setActiveScreen('explore')}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={spot.image}
                    alt={spot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{spot.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-extrabold text-[#19324d] text-sm line-clamp-1 group-hover:text-sky-700 transition-colors">
                    {spot.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{spot.location}</span>
                  </p>
                  
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#19324d]">
                      {spot.price} <span className="text-[10px] font-normal text-slate-400">/org</span>
                    </span>
                    <span className="text-[11px] font-bold text-sky-700 flex items-center gap-0.5">
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER BAR (CLEAN TRUST INDICATORS, NO DEMO CLUTTER) */}
      <footer className="bg-white border-t border-slate-200 py-5 px-6 z-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Escrow Resmi</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pemandu BNSP</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mitra UMKM</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            © 2026 Zamzam Hidden Spot Booking. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>

    </div>
  );
};
