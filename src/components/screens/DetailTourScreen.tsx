import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, MapPin, Users, Store, ShieldCheck, Share2, Tag, Compass } from 'lucide-react';
import { AVAILABLE_DESTINATIONS } from '../../data/bookingExtras';
import { DestinationReviews } from '../DestinationReviews';

/** Detail destinasi: semua isi berasal dari katalog database, sesuai destinasi yang dipilih. */
export const DetailTourScreen: React.FC = () => {
  const {
    currentUser, selectedDestinationId, activeBooking, setActiveScreen, initDraftBooking, setRedirectAfterLogin
  } = useAppStore();

  const dest =
    AVAILABLE_DESTINATIONS.find((d) => d.id === (selectedDestinationId ?? activeBooking.destinationId)) ??
    AVAILABLE_DESTINATIONS[0];

  if (!dest) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-sm text-slate-500">
        Destinasi belum tersedia.
      </div>
    );
  }

  const handleShare = async () => {
    const data = { title: dest.title, text: `${dest.title} - ${dest.location}`, url: window.location.origin };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`);
        window.alert('Tautan disalin.');
      }
    } catch {
      /* dibatalkan pengguna */
    }
  };

  const handleBook = () => {
    initDraftBooking(dest);
    if (!currentUser) {
      setRedirectAfterLogin('booking-confirm');
      setActiveScreen('login');
    } else {
      setActiveScreen('booking-confirm');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800" style={{ paddingBottom: '140px' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#19324d]">Detail Tour</h1>
          <button onClick={() => void handleShare()} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600" title="Bagikan">
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Hero */}
        <div className="space-y-3">
          <div className="relative h-56 sm:h-80 rounded-3xl overflow-hidden shadow-md bg-slate-200">
            <img src={dest.image} alt={dest.title} className="w-full h-full object-cover" />
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-300 shadow-sm">
              {dest.category}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#19324d]">{dest.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="text-amber-500 font-bold">
                ⭐ {(dest.ratingAvg ?? 0).toFixed(1)}
                {(dest.reviewsCount ?? 0) > 0 ? ` (${dest.reviewsCount} ulasan)` : ' (belum ada ulasan)'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {dest.location}
              </span>
            </div>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Tag className="w-5 h-5 text-sky-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Harga / Orang</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d]">Rp {dest.unitPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <MapPin className="w-5 h-5 text-indigo-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Meeting Point</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d] truncate block">
              {dest.meetingPoints[0]?.name ?? 'Dikonfirmasi pemandu'}
            </span>
          </div>
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Compass className="w-5 h-5 text-amber-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Kategori</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d] truncate block">{dest.category}</span>
          </div>
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center space-y-1 shadow-sm">
            <Users className="w-5 h-5 text-emerald-600 mx-auto" />
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Rasio Pemandu</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19324d]">1 : 10 peserta</span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d]">Tentang Destinasi</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{dest.description}</p>
          {dest.highlights && dest.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {dest.highlights.map((h) => (
                <span key={h} className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-[11px] font-semibold">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Titik kumpul */}
        {dest.meetingPoints.length > 0 && (
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <h3 className="text-base font-bold text-[#19324d]">Titik Kumpul</h3>
            <div className="space-y-2.5">
              {dest.meetingPoints.map((mp) => (
                <div key={mp.id} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#19324d] block">{mp.name}</span>
                    {mp.desc && <p className="text-xs text-slate-600 mt-0.5">{mp.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layanan tambahan */}
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-2">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-950">Dukung UMKM Lokal</h3>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Saat memesan, Anda dapat menambahkan kuliner dari mitra UMKM dan transportasi lokal ke dalam booking.
          </p>
        </div>

        {/* Jaminan */}
        <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#19324d]">Jaminan ZHS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pemandu terverifikasi tim ZHS</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dana aman di escrow hingga tur selesai</span>
            </div>
          </div>
        </div>

        <DestinationReviews destinationDbId={dest.dbId} ratingAvg={dest.ratingAvg} reviewsCount={dest.reviewsCount} />
      </div>

      {/* Bar pemesanan */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 px-4 sm:px-6 py-3 shadow-2xl z-[60]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Mulai dari</span>
            <span className="text-base sm:text-xl font-extrabold text-[#19324d]">
              Rp {dest.unitPrice.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">/ orang</span>
            </span>
          </div>
          <button
            onClick={handleBook}
            className="px-5 py-2.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all"
          >
            PESAN SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};
