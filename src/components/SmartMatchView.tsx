import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Sparkles, Sliders, CheckCircle2, MapPin, 
  ArrowRight, Store, Calendar, Users, RefreshCw, X, Compass, ArrowLeft, Star
} from 'lucide-react';
import { AVAILABLE_DESTINATIONS, DestinationItem } from '../data/bookingExtras';

interface SmartMatchViewProps {
  embedded?: boolean;
  onBackToCatalog?: () => void;
}

export const SmartMatchView: React.FC<SmartMatchViewProps> = ({ 
  embedded = false, 
  onBackToCatalog 
}) => {
  const { 
    smartMatchCriteria, 
    setSmartMatchCriteria, 
    executeSmartMatch, 
    smartMatchResults, 
    startBooking,
    toggleAiDrawer,
    setActiveScreen
  } = useAppStore();

  const [hasSearched, setHasSearched] = useState(smartMatchResults.length > 0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [guideBookingModal, setGuideBookingModal] = useState<{ guide: any; recommendedUMKM: any } | null>(null);

  const interestsList = [
    'Hidden Spot Alam & Mata Air',
    'Wisata Kuliner Tradisional Osing',
    'Budaya, Heritage & Candi Kuno',
    'Trekking Pegunungan & Sunrise',
    'Workshop Kriya & Keramik Desa'
  ];

  const handleMatch = () => {
    setIsCalculating(true);
    setTimeout(() => {
      executeSmartMatch();
      setIsCalculating(false);
      setHasSearched(true);
    }, 600);
  };

  return (
    <div className={`${embedded ? 'w-full' : 'min-h-screen bg-[#f8fafc] text-slate-800 pb-24 md:pb-16'}`}>
      
      {/* Standalone Header (only when not embedded) */}
      {!embedded && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setActiveScreen('explore')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Jelajahi</span>
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Smart Match AI Engine
          </h1>
          <div className="w-8" />
        </div>
      )}

      <div className={`${embedded ? 'space-y-6' : 'max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6'}`}>
        
        {/* Banner Title & Description */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Smart Search: Demand & Supply Matching</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#19324d] tracking-tight">
              Pencocokan Cerdas Wisatawan & Pemandu Terverifikasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Algoritma sistem mencocokkan preferensi Anda dengan supply pemandu resmi berlisensi BNSP dan kemitraan UMKM kuliner berdasarkan kalkulasi bobot 6 faktor (100%).
            </p>
          </div>

          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#19324d] text-xs font-bold rounded-2xl transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              ← Kembali ke Katalog Destinasi
            </button>
          )}
        </div>

        {/* TWO-COLUMN LAYOUT: DEMAND INPUT FORM (LEFT) & TOP-N RESULTS (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: DEMAND INPUT FORM */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-[#19324d] text-sm sm:text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Input Kebutuhan Wisata (Demand)</span>
              </h3>
              <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                Filter Cerdas Aktif
              </span>
            </div>

            {/* Interest */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Kategori Minat Wisata
              </label>
              <select
                value={smartMatchCriteria.interest}
                onChange={(e) => setSmartMatchCriteria({ interest: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#19324d] focus:bg-white transition-colors"
              >
                {interestsList.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* GPS Location Toggle vs Manual Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Deteksi Lokasi GPS</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    {smartMatchCriteria.useGps ? 'GPS Otomatis' : 'Input Manual'}
                  </span>
                  <input
                    type="checkbox"
                    checked={smartMatchCriteria.useGps}
                    onChange={(e) => setSmartMatchCriteria({ useGps: e.target.checked })}
                    className="w-4 h-4 rounded text-[#19324d] focus:ring-0 cursor-pointer accent-[#19324d]"
                  />
                </div>
              </div>

              {!smartMatchCriteria.useGps ? (
                <input
                  type="text"
                  placeholder="Ketik Kota / Wilayah Destinasi"
                  value={smartMatchCriteria.manualCity}
                  onChange={(e) => setSmartMatchCriteria({ manualCity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#19324d] focus:bg-white transition-colors"
                />
              ) : (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">GPS Terdeteksi: Radius 15km Purwakarta & Jawa Barat</span>
                </div>
              )}
            </div>

            {/* Date & Participants */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tanggal Tur</span>
                </label>
                <input
                  type="date"
                  value={smartMatchCriteria.date}
                  onChange={(e) => setSmartMatchCriteria({ date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#19324d] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Jumlah Peserta</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={smartMatchCriteria.participants}
                  onChange={(e) => setSmartMatchCriteria({ participants: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#19324d] focus:bg-white"
                />
              </div>
            </div>

            {/* Budget Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Target Budget Tur</label>
                <span className="text-xs font-black text-[#19324d]">
                  Rp {smartMatchCriteria.budget.toLocaleString('id-ID')}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={1500000}
                step={50000}
                value={smartMatchCriteria.budget}
                onChange={(e) => setSmartMatchCriteria({ budget: Number(e.target.value) })}
                className="w-full accent-[#19324d] cursor-pointer"
              />
            </div>

            {/* WEIGHTED SCORING INFO PANEL */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Bobot Kalkulasi Algoritma (100%):
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Rating:</span>
                  <span className="font-bold text-amber-600">25%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Minat:</span>
                  <span className="font-bold text-amber-600">25%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Jarak GPS:</span>
                  <span className="font-bold text-sky-600">15%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Budget:</span>
                  <span className="font-bold text-emerald-600">15%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Riwayat:</span>
                  <span className="font-bold text-purple-600">10%</span>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 block">Response:</span>
                  <span className="font-bold text-blue-600">10%</span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleMatch}
              disabled={isCalculating}
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Mengkalkulasi Skor Algoritma...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Jalankan Smart Match Sekarang</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT: TOP-N RECOMMENDATIONS LIST */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#19324d] text-base flex items-center gap-2">
                  <span>Hasil Rekomendasi Pemandu Teratas</span>
                  {smartMatchResults.length > 0 && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {smartMatchResults.length} Rekomendasi
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Pemandu terverifikasi resmi BNSP dengan kesesuaian minat dan jadwal tertinggi.
                </p>
              </div>
            </div>

            {!hasSearched && smartMatchResults.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-base font-extrabold text-[#19324d]">Siap Mencari Pemandu Terbaik?</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Tentukan kriteria minat wisata dan budget Anda di form sebelah kiri, lalu klik <strong>"Jalankan Smart Match"</strong> untuk mendapatkan peringkat pemandu yang paling relevan.
                </p>
                <button
                  onClick={handleMatch}
                  className="px-6 py-2.5 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Kalkulasi Pemandu Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {smartMatchResults.map((result, idx) => (
                  <div
                    key={result.guide.id}
                    className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all shadow-sm space-y-4"
                  >
                    {/* Top Row: Guide Identity + Match Score Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={result.guide.avatar}
                          alt={result.guide.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
                              #{idx + 1} Best Match
                            </span>
                            <span className="text-sm font-extrabold text-[#19324d]">{result.guide.name}</span>
                            <span title="Terverifikasi BNSP"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{result.guide.location}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{result.guide.rating}</span>
                            </span>
                            <span className="text-slate-400">({result.guide.reviewsCount} review)</span>
                            <span className="text-emerald-700 font-semibold">⚡ {result.guide.responseRate}% respon</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge (Percentage) */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-emerald-600">
                          {result.matchScore}%
                        </div>
                        <span className="text-[10px] text-slate-500 block font-bold">
                          Kecocokan
                        </span>
                      </div>
                    </div>

                    {/* Breakdown Bar */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-1.5">
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>Detail Nilai: Rating {result.scoringBreakdown.ratingScore}/25 · Minat {result.scoringBreakdown.interestScore}/25 · GPS {result.scoringBreakdown.distanceScore}/15 · Budget {result.scoringBreakdown.budgetScore}/15</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(result.scoringBreakdown.ratingScore/25)*25}%` }} className="bg-amber-400" title="Rating 25%" />
                        <div style={{ width: `${(result.scoringBreakdown.interestScore/25)*25}%` }} className="bg-orange-500" title="Minat 25%" />
                        <div style={{ width: `${(result.scoringBreakdown.distanceScore/15)*15}%` }} className="bg-sky-500" title="GPS 15%" />
                        <div style={{ width: `${(result.scoringBreakdown.budgetScore/15)*15}%` }} className="bg-emerald-500" title="Budget 15%" />
                        <div style={{ width: `${(result.scoringBreakdown.historyScore/10)*10}%` }} className="bg-purple-500" title="Riwayat 10%" />
                        <div style={{ width: `${(result.scoringBreakdown.responseScore/10)*10}%` }} className="bg-cyan-500" title="Response 10%" />
                      </div>
                    </div>

                    {/* Bundling Mitra UMKM */}
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">
                            Bundling Kemitraan UMKM:
                          </span>
                          <span className="text-xs font-bold text-[#19324d]">
                            {result.recommendedUMKM.name} — {result.recommendedUMKM.featuredProduct}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Diskon {result.recommendedUMKM.discountVoucher}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Tarif Tur Harian</span>
                        <span className="text-base font-black text-[#19324d]">
                          Rp {result.guide.pricePerDay.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAiDrawer(true)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Tanya AI
                        </button>

                        <button
                          onClick={() => setGuideBookingModal({ guide: result.guide, recommendedUMKM: result.recommendedUMKM })}
                          className="px-4 py-2 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-98"
                        >
                          <span>Pesan Sekarang</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* MODAL PILIH DESTINASI SETELAH MEMILIH PEMANDU (TIDAK LANGSUNG TERKUNCI) */}
      {guideBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={guideBookingModal.guide.avatar}
                  alt={guideBookingModal.guide.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#19324d]">
                    Pilih Destinasi untuk Tur
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold block">
                    Didampingi oleh <strong>{guideBookingModal.guide.name}</strong>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setGuideBookingModal(null)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900">
              <Compass className="w-4 h-4 text-sky-600 inline mr-1.5" />
              <span>Memilih pemandu tidak mengunci wisata. Anda bisa bebas mengubah destinasi di form reservasi kapan saja.</span>
            </div>

            <div className="overflow-y-auto space-y-3 py-1 pr-1 flex-1">
              {AVAILABLE_DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => {
                    startBooking(guideBookingModal.guide, dest as any, guideBookingModal.recommendedUMKM);
                    setGuideBookingModal(null);
                  }}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-[#19324d] hover:bg-white rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 group shadow-2xs"
                >
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-sky-100 text-[#19324d] border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                      {dest.category}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-[#19324d] mt-1 line-clamp-1 group-hover:text-blue-700">
                      {dest.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {dest.location}
                    </p>
                    <span className="text-xs font-black text-[#19324d] mt-1 block">
                      Mulai Rp {dest.unitPrice.toLocaleString('id-ID')} / orang
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#19324d] shrink-0" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  startBooking(guideBookingModal.guide, undefined, guideBookingModal.recommendedUMKM);
                  setGuideBookingModal(null);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Lewati & Tentukan Nanti di Formulir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
