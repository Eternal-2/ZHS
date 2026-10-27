import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_GUIDES, MOCK_UMKM } from '../data/mockData';
import { 
  Search, MapPin, Star, Sparkles, ShieldCheck, Store, 
  ArrowRight, CheckCircle2, ArrowLeft, SlidersHorizontal,
  Compass, Users, Clock, Tag
} from 'lucide-react';
import { SmartMatchView } from './SmartMatchView';

interface TourCardData {
  id: string;
  title: string;
  category: 'Cagar Budaya' | 'Wisata Alam' | 'Air Panas & Curug' | 'Kuliner & UMKM';
  guide: string;
  location: string;
  rating: string;
  reviewsCount: number;
  pricePerPerson: number;
  image: string;
  highlights: string[];
  screenTarget: 'detail-tour' | 'detail-destinasi';
}

export const ExploreScreen: React.FC = () => {
  const { setActiveScreen, initDraftBooking, startBooking } = useAppStore();
  const [exploreMode, setExploreMode] = useState<'catalog' | 'smart-search'>('catalog');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'populer' | 'rating' | 'harga'>('populer');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Semua', 
    'Cagar Budaya', 
    'Wisata Alam', 
    'Air Panas & Curug', 
    'Kuliner & UMKM'
  ];

  const exploreTours: TourCardData[] = [
    {
      id: 'situ-buleud',
      title: 'Trip to Situ Buleud & Air Mancur Sri Baduga',
      category: 'Cagar Budaya',
      guide: 'Bambang Pamungkas',
      location: 'Nagri Kidul, Kec. Purwakarta, Kab. Purwakarta',
      rating: '9.4',
      reviewsCount: 20290,
      pricePerPerson: 35000,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      highlights: ['Cagar Budaya Sunda', 'Air Mancur Laser Menari', 'Voucher Sate Maranggi'],
      screenTarget: 'detail-tour'
    },
    {
      id: 'gracia-spa',
      title: 'Gracia Spa Hot Spring Pool',
      category: 'Air Panas & Curug',
      guide: 'Hanif Ramadhan',
      location: 'Desa Cikondang, Kec. Ciater, Kabupaten Subang',
      rating: '9.2',
      reviewsCount: 8409,
      pricePerPerson: 100000,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      highlights: ['Kolam Air Panas Alami', 'Dikelilingi Kebun Teh', 'Relaksasi Belerang Asri'],
      screenTarget: 'detail-tour'
    },
    {
      id: 'pasir-langlang',
      title: 'Pasir Langlang Panyawangan (Hutan Pinus)',
      category: 'Wisata Alam',
      guide: 'Siti Aminah',
      location: 'Desa Cihanjawar, Kec. Bojong/Wanayasa, Purwakarta',
      rating: '9.5',
      reviewsCount: 4210,
      pricePerPerson: 45000,
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      highlights: ['Hutan Pinus Alami', 'Jalur Piknik Ramah Anak', 'Spot Hammock Asri'],
      screenTarget: 'detail-tour'
    },
    {
      id: 'curug-tilu',
      title: 'Curug Tilu & Kolam Alami Ciririp',
      category: 'Air Panas & Curug',
      guide: 'Furab',
      location: 'Desa Ciririp, Kec. Sukasari, Kab. Purwakarta',
      rating: '9.1',
      reviewsCount: 3120,
      pricePerPerson: 40000,
      image: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
      highlights: ['Green Canyon Purwakarta', 'Air Jernih Alami', 'Spot Berenang Santai'],
      screenTarget: 'detail-tour'
    },
    {
      id: 'benteng-vredeburg',
      title: 'Museum Benteng Vredeburg',
      category: 'Cagar Budaya',
      guide: 'Bigmo',
      location: 'Ngupasan, Kec. Gondomanan, Kota Yogyakarta',
      rating: '9.4',
      reviewsCount: 20290,
      pricePerPerson: 14000,
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
      highlights: ['Diorama Perjuangan', 'Arsitektur Benteng Kolonial', 'Spot Foto Bersejarah'],
      screenTarget: 'detail-tour'
    },
    {
      id: 'gunung-bromo',
      title: 'Tur Sunrise Savana Gunung Bromo',
      category: 'Wisata Alam',
      guide: 'Wahyu Kurniawan',
      location: 'Sumberkedawung, Kec. Leces, Kab. Probolinggo',
      rating: '9.3',
      reviewsCount: 1416,
      pricePerPerson: 400000,
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      highlights: ['Golden Sunrise Bromo', 'Kawah Bromo & Pasir Berbisik', 'Jeep 4x4 Terverifikasi'],
      screenTarget: 'detail-tour'
    }
  ];

  const filteredTours = exploreTours
    .filter((item) => {
      const matchCat = activeCategory === 'Semua' || item.category === activeCategory;
      const matchQuery = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guide.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return parseFloat(b.rating) - parseFloat(a.rating);
      if (sortBy === 'harga') return a.pricePerPerson - b.pricePerPerson;
      return b.reviewsCount - a.reviewsCount; // populer
    });

  const handleSelectTour = (tour: TourCardData) => {
    initDraftBooking(tour.title, tour.location);
    setActiveScreen(tour.screenTarget);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 md:pb-16">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Mode Toggle: Katalog Wisata vs Smart Search AI */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#19324d] tracking-tight">
              Eksplorasi Wisata Nusantara
            </h1>
            <p className="text-xs text-slate-500">
              Pilih mode penjelajahan katalog atau pencocokan otomatis dengan AI
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-2xl self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setExploreMode('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                exploreMode === 'catalog'
                  ? 'bg-[#19324d] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🧭 Katalog Wisata</span>
            </button>
            <button
              onClick={() => setExploreMode('smart-search')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                exploreMode === 'smart-search'
                  ? 'bg-[#19324d] text-white shadow-sm'
                  : 'text-amber-900 bg-amber-100 hover:bg-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Smart Search AI</span>
            </button>
          </div>
        </div>

        {exploreMode === 'smart-search' ? (
          <SmartMatchView embedded={true} onBackToCatalog={() => setExploreMode('catalog')} />
        ) : (
          <>
            {/* HERO SEARCH & FILTER CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
                    ZAM ZAM HIDDEN SPOT EXPLORER
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-[#19324d]">
                    Temukan Spot Wisata & Pemandu Resmi
                  </h2>
                </div>

                {/* GPS anchor badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-900 w-fit">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>Area: <strong>Purwakarta & Jawa Barat</strong></span>
                </div>
              </div>

              {/* PROMINENT SMART SEARCH AI BANNER / TOMBOL */}
              <div className="p-4 bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm font-extrabold text-[#19324d] block">
                      Butuh Rekomendasi Instan? Gunakan Smart Search AI
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-relaxed block">
                      Algoritma demand-supply mencocokkan minat, budget, dan lokasi Anda dengan pemandu resmi terbaik (6 bobot penilaian 100%).
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setExploreMode('smart-search')}
                  className="px-4 py-2.5 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Jalankan Smart Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search Input Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari cagar budaya, curug, air panas, atau nama pemandu..."
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#19324d] focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>

          {/* Category Filter Pills & Sort */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#19324d] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort chips */}
            <div className="flex items-center gap-1 text-xs shrink-0">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Urutkan:
              </span>
              {(['populer', 'rating', 'harga'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    sortBy === s
                      ? 'bg-sky-100 text-sky-900 border border-sky-300'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {s === 'populer' ? 'Terpopuler' : s === 'rating' ? 'Rating' : 'Harga'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 1: DAFTAR TUR & DESTINASI WISATA (Grid 1 on Mobile, 3 on Desktop) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#19324d]">
                Spot Wisata Terkurasi
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                {filteredTours.length} Spot
              </span>
            </div>

            <span className="text-xs text-slate-400">
              Perlindungan Escrow 100%
            </span>
          </div>

          {filteredTours.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
              <div className="text-3xl">🔍</div>
              <h4 className="font-bold text-[#19324d] text-base">Tidak Ada Spot yang Cocok</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau pilih kategori "Semua" untuk melihat seluruh destinasi terkurasi ZHS.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('Semua');
                }}
                className="px-4 py-2 bg-[#19324d] text-white text-xs font-bold rounded-full"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTours.map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => handleSelectTour(tour)}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#19324d]/40 transition-all flex flex-col justify-between cursor-pointer group"
                >
                  {/* Image with Badges */}
                  <div>
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-extrabold text-[#19324d] shadow-sm">
                        {tour.category}
                      </span>

                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{tour.rating}</span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-[11px] text-white">
                        <MapPin className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                        <span className="truncate drop-shadow">{tour.location}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <h4 className="font-extrabold text-[#19324d] text-base leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                        {tour.title}
                      </h4>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="text-[11px] font-semibold text-slate-700">Pemandu:</span>
                        <span className="font-bold text-[#19324d] flex items-center gap-1">
                          {tour.guide}
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tour.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Price and CTA */}
                  <div className="p-4 sm:p-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Tiket & Pemandu Mulai
                        </span>
                        <span className="text-base font-black text-[#19324d]">
                          Rp {tour.pricePerPerson.toLocaleString('id-ID')}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">/org</span>
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTour(tour);
                        }}
                        className="px-4 py-2 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1"
                      >
                        <span>Pesan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: SUPPLY POOL PEMANDU WISATA TERVERIFIKASI */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>SUPPLY POOL BERLISENSI BNSP & HPI</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#19324d]">
                Pemandu Wisata Lokal Terverifikasi
              </h3>
              <p className="text-xs text-slate-500">
                Pemandu resmi yang lolos verifikasi berkas, kompetensi lapangan, dan dilindungi kode etik ZHS.
              </p>
            </div>

            <button
              onClick={() => setExploreMode('smart-search')}
              className="text-xs font-bold text-[#19324d] hover:text-sky-700 flex items-center gap-1 underline underline-offset-4 self-start sm:self-auto cursor-pointer"
            >
              <span>Cocokkan via Smart Search AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_GUIDES.map((guide) => (
              <div
                key={guide.id}
                className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-[#19324d]/30 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start gap-3 mb-2.5">
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-extrabold text-[#19324d] text-sm truncate">
                          {guide.name}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{guide.location}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          ⭐ {guide.rating}
                        </span>
                        <span className="text-slate-400">({guide.reviewsCount} review)</span>
                        <span className="text-emerald-700 font-medium">⚡ {guide.responseRate}%</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {guide.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {guide.specialties.slice(0, 2).map((sp, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-medium">Tarif Pemandu</span>
                    <span className="text-xs font-black text-[#19324d]">
                      Rp {guide.pricePerDay.toLocaleString('id-ID')}/hari
                    </span>
                  </div>

                  <button
                    onClick={() => startBooking(guide)}
                    className="px-3.5 py-1.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs rounded-full shadow-2xs transition-all active:scale-95"
                  >
                    Pilih Pemandu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: KEMITRAAN UMKM KULINER & KRIYA LOKAL */}
        <section className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold mb-1">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                <span>KEMITRAAN UMKM & VOUCHER DISKON</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#19324d]">
                Mitra UMKM Lokal & Storytelling Budaya
              </h3>
              <p className="text-xs text-slate-500">
                Pemesanan tur Anda langsung menyokong kuliner khas dan produk kerajinan tangan warga lokal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_UMKM.map((umkm) => (
              <div
                key={umkm.id}
                className="bg-[#f8fafc] border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#19324d]/30 transition-all"
              >
                <div>
                  <div className="h-36 relative overflow-hidden bg-slate-100">
                    <img src={umkm.image} alt={umkm.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#19324d] shadow-sm">
                      {umkm.category}
                    </span>
                    {umkm.discountVoucher && (
                      <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-[#19324d] text-white text-[10px] font-extrabold shadow">
                        Kupon: {umkm.discountVoucher}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="font-extrabold text-[#19324d] text-sm">{umkm.name}</h4>
                    <p className="text-[11px] text-sky-800 font-semibold flex items-center gap-1">
                      <Tag className="w-3 h-3 text-sky-600" />
                      <span>{umkm.featuredProduct}</span>
                    </p>
                    <p className="text-xs text-slate-600 italic leading-relaxed pt-1">
                      "{umkm.storytelling}"
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px] font-medium">{umkm.location}</span>
                  <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>MOU Resmi</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DANA AMAN TERJAGA BANNER (Standard across all screens) */}
        <div className="p-4 sm:p-5 bg-sky-50 border border-sky-200 rounded-3xl flex items-start sm:items-center gap-3.5 text-xs text-sky-950 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1">
            <strong className="block text-sm text-[#19324d]">
              Jaminan Transaksi Dana Aman Terjaga (Escrow Protection)
            </strong>
            <p className="text-[11px] text-sky-900 leading-snug mt-0.5">
              Seluruh pembayaran disimpan di Rekening Bersama ZHS dan baru dicairkan ke pemandu wisata setelah kunjungan Anda terverifikasi selesai di lokasi. Pengembalian 100% jika dibatalkan H-3.
            </p>
          </div>
        </div>
          </>
        )}

      </div>

    </div>
  );
};
