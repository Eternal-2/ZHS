import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Bell, Search, Star, ArrowRight } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { currentUser, setActiveScreen } = useAppStore();

  const tourSpots = [
    {
      id: 'situ-buleud',
      title: 'Situ Buleud & Air Mancur Sri Baduga',
      location: 'Nagri Kidul, Kec. Purwakarta, Kab. Purwakarta',
      rating: '9.4/10 (20.290 review)',
      priceWeekday: 'Rp. 35.000',
      category: 'Cagar Budaya',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'gracia-spa',
      title: 'Gracia Spa Hot Spring Pool',
      location: 'Desa Cikondang, Kec. Ciater, Kabupaten Subang',
      rating: '9.2/10 (8.409 review)',
      priceWeekday: 'Rp. 100.000',
      category: 'Wisata Alam',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'benteng-vredeburg',
      title: 'Museum Benteng Vredeburg',
      location: 'Ngupasan, Kec. Gondomanan, Kota Yogyakarta',
      rating: '9.4/10 (20.290 review)',
      priceWeekday: 'Rp. 14.000',
      category: 'Museum & Sejarah',
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'gunung-bromo',
      title: 'Tur Sunrise Savana Gunung Bromo',
      location: 'Sumberkedawung, Kec. Leces, Kabupaten Probolinggo',
      rating: '9.2/10 (1.416 review)',
      priceWeekday: 'Rp. 400.000',
      category: 'Petualangan',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 space-y-6">
        
        {/* Greeting Banner */}
        <div className="pt-2 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#19324d] tracking-tight">
              {currentUser ? `Halo, ${currentUser.name} 👋` : 'Selamat datang, Sobat Wisata 👋'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Platform reservasi tur cagar budaya dan hidden spot nusantara bergaransi Escrow 100% aman
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('notifications')}
            className="relative p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors ml-3 shrink-0"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5 text-[#19324d]" />
            {/* Badge notifikasi belum dibaca */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow">
              3
            </span>
          </button>
        </div>

        {/* SEARCH BAR - per flow 5.1.2 step 4 */}
        <div 
          onClick={() => setActiveScreen('explore')}
          className="bg-[#f1f5f9] border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-colors shadow-sm"
        >
          <Search className="w-5 h-5 text-slate-400" />
          <span className="text-xs sm:text-sm text-slate-400">
            Cari booking atau jadwal tur...
          </span>
        </div>


        {/* UNGGULAN HERO BANNER (exact as Figma Page 19) */}
        <div 
          onClick={() => setActiveScreen('detail-destinasi')}
          className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer group"
        >
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            alt="Jelajahi Indonesia"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow">
            UNGGULAN
          </span>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
              Jelajahi Indonesia <br />
              dengan tur terbaikmu
            </h2>
            <p className="text-xs text-sky-200 mt-1 flex items-center gap-1">
              <span>Klik untuk lihat detail cagar budaya & air mancur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </div>
        </div>

        {/* JELAJAHI LIST (exact as Figma Page 19 & Desktop Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-[#19324d]">
              Jelajahi
            </h3>
            <button
              onClick={() => setActiveScreen('explore')}
              className="text-xs font-semibold text-[#19324d] hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tourSpots.map((spot) => (
              <div
                key={spot.id}
                onClick={() => setActiveScreen('detail-tour')}
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex gap-3.5 hover:shadow-md hover:border-[#19324d]/30 transition-all cursor-pointer"
              >
                {/* Image */}
                <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={spot.image}
                    alt={spot.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {spot.category}
                    </span>
                    <h4 className="font-bold text-[#19324d] text-sm leading-snug line-clamp-2 mt-1.5">
                      {spot.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      📍 {spot.location}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold mt-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{spot.rating}</span>
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Tiket Masuk</span>
                      <span className="text-xs font-bold text-sky-600">
                        {spot.priceWeekday}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveScreen('detail-tour');
                      }}
                      className="px-2.5 py-1 bg-[#19324d] text-white text-[10px] font-bold rounded-lg shadow-sm"
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
