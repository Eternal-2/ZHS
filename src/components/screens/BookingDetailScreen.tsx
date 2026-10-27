import React, { useState } from 'react';
import { useAppStore, BookingState } from '../../store/useAppStore';
import { 
  ArrowLeft, MapPin, Star, Ticket, FileText, 
  MessageSquare, Compass, Calendar, Sparkles, CheckCircle2, 
  ShieldCheck, AlertCircle, Clock, X, ChevronRight, QrCode, RotateCcw
} from 'lucide-react';

export const BookingDetailScreen: React.FC = () => {
  const { 
    userBookings, 
    setActiveScreen, 
    toggleCancelModal, 
    initDraftBooking, 
    setActiveBookingById, 
    markTourCompleted,
    openDirectChat,
    pointsBalance 
  } = useAppStore();

  const [filterTab, setFilterTab] = useState<'Semua' | 'Aktif' | 'Selesai' | 'Dibatalkan'>('Semua');
  const [detailModalBooking, setDetailModalBooking] = useState<BookingState | null>(null);

  // Filter calculations
  const activeBookings = userBookings.filter(b => 
    b.status === 'confirmed_by_guide' || b.status === 'in_tour' || b.status === 'pending_payment' || b.status === 'escrow_locked'
  );
  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');

  const filteredList = userBookings.filter((b) => {
    if (filterTab === 'Aktif') return b.status === 'confirmed_by_guide' || b.status === 'in_tour' || b.status === 'pending_payment' || b.status === 'escrow_locked';
    if (filterTab === 'Selesai') return b.status === 'completed';
    if (filterTab === 'Dibatalkan') return b.status === 'cancelled';
    return true; // 'Semua'
  });

  const getStatusBadge = (status: BookingState['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selesai & Escrow Dicairkan</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Dibatalkan (100% Refund)</span>
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Pembayaran</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Sedang Berjalan (Escrow Aktif)</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28 md:pb-16">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#19324d] tracking-tight">
              Riwayat Booking & E-Tiket
            </h1>
            <p className="text-xs text-slate-500">
              Pantau status tur aktif, akses tiket digital, dan riwayat pelepasan dana escrow
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start sm:self-auto shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Dana Aman di Rekening Escrow ZHS</span>
          </div>
        </div>
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">Total Pesanan</span>
            <span className="text-2xl font-black text-[#19324d] mt-1 block">{userBookings.length}</span>
            <span className="text-[10px] text-slate-400">Reservasi Tur</span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-[11px] text-sky-700 font-semibold block uppercase tracking-wider">Aktif / Berjalan</span>
            <span className="text-2xl font-black text-sky-700 mt-1 block">{activeBookings.length}</span>
            <span className="text-[10px] text-sky-600">Dalam Pendampingan</span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-[11px] text-emerald-700 font-semibold block uppercase tracking-wider">Tur Selesai</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{completedBookings.length}</span>
            <span className="text-[10px] text-emerald-600">Escrow Tuntas</span>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
            <span className="text-[11px] text-amber-700 font-semibold block uppercase tracking-wider">Poin Loyalitas</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">{pointsBalance}</span>
            <span className="text-[10px] text-amber-700">Tukar Voucher</span>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          {(
            [
              { key: 'Semua', count: userBookings.length },
              { key: 'Aktif', count: activeBookings.length },
              { key: 'Selesai', count: completedBookings.length },
              { key: 'Dibatalkan', count: cancelledBookings.length }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === tab.key
                  ? 'bg-[#19324d] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.key}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                filterTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* BOOKINGS LIST */}
        {filteredList.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm max-w-md mx-auto my-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-3xl">
              🎟️
            </div>
            <h3 className="text-lg font-extrabold text-[#19324d]">
              Tidak Ada Booking di Kategori "{filterTab}"
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {filterTab === 'Aktif'
                ? 'Semua tur Anda saat ini telah selesai atau Anda belum melakukan reservasi baru.'
                : filterTab === 'Selesai'
                  ? 'Belum ada tur yang diselesaikan. Selesaikan tur aktif Anda untuk melihat bukti dan memberi ulasan.'
                  : 'Tidak ada data reservasi pada kategori filter ini.'}
            </p>
            <button
              onClick={() => setActiveScreen('explore')}
              className="py-3 px-6 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-full shadow-md transition-all inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Jelajahi Wisata Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((booking) => {
              const isOngoing = booking.status === 'confirmed_by_guide' || booking.status === 'in_tour';
              const isDone = booking.status === 'completed';

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Top Bar of Card: ID, Date Created, and Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          BOOKING ID
                        </span>
                        <strong className="text-sm font-extrabold text-[#19324d]">
                          {booking.id}
                        </strong>
                      </div>
                      <span className="text-slate-300">|</span>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          TANGGAL PESAN
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {booking.createdAt}
                        </span>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  {/* Middle Content: Thumbnail + Tour info */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Image */}
                    <div className="md:col-span-3 h-36 sm:h-32 rounded-2xl overflow-hidden relative border border-slate-100">
                      <img
                        src={booking.destinationImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'}
                        alt={booking.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white font-bold">
                        {booking.participants} Peserta
                      </span>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-6 space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-[#19324d] leading-snug">
                        {booking.title}
                      </h3>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{booking.meetingPoint || booking.destination}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Jadwal: <strong>{booking.date}</strong></span>
                        </div>
                        {booking.selectedTransport && booking.selectedTransport.id !== 'none' && (
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="text-xs">🚗</span>
                            <span>Transport: <strong>{booking.selectedTransport.name}</strong></span>
                          </div>
                        )}
                        {booking.foodAddOns && booking.foodAddOns.length > 0 && (
                          <div className="flex items-center gap-2 text-orange-700">
                            <span className="text-xs">🍱</span>
                            <span>Add-on: <strong>{booking.foodAddOns.length} Menu Kuliner Bundling</strong></span>
                          </div>
                        )}
                      </div>

                      {/* Guide row */}
                      {booking.guide && (
                        <div className="flex items-center gap-2 pt-1">
                          <img
                            src={booking.guide.avatar}
                            alt={booking.guide.name}
                            className="w-7 h-7 rounded-full object-cover border border-amber-400"
                          />
                          <span className="text-xs font-bold text-[#19324d]">
                            {booking.guide.name}
                          </span>
                          <span className="text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full font-semibold border border-sky-200">
                            BNSP Certified
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price & Billing */}
                    <div className="md:col-span-3 text-left md:text-right space-y-1 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        Total Biaya ({booking.paymentMethod})
                      </span>
                      <span className="text-lg sm:text-xl font-black text-[#19324d] block">
                        Rp {booking.totalAmount.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        {isDone ? '✓ Escrow Resmi Dicairkan' : '✓ Dana Terkunci di Escrow'}
                      </span>
                    </div>

                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailModalBooking(booking)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#19324d] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Rincian & Invoice</span>
                      </button>

                      {isOngoing && (
                        <button
                          onClick={() => {
                            setActiveBookingById(booking.id);
                            toggleCancelModal(true);
                          }}
                          className="px-3 py-2 text-red-600 hover:text-red-800 text-xs font-bold rounded-xl transition-colors hover:bg-red-50"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* If Ongoing: Button to chat with guide, view digital ticket and finish tour */}
                      {isOngoing && (
                        <>
                          <button
                            onClick={() => openDirectChat(booking.id)}
                            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                            title="Chat langsung dengan pemandu tur"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                            <span>Chat Pemandu</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveBookingById(booking.id);
                              setActiveScreen('live-tour');
                            }}
                            className="px-4 py-2 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Buka E-Tiket & Live Tour</span>
                          </button>

                          <button
                            onClick={() => {
                              markTourCompleted(booking.id);
                              setActiveBookingById(booking.id);
                              setActiveScreen('review');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selesaikan Tur</span>
                          </button>
                        </>
                      )}

                      {/* If Completed: View E-Ticket archive or write review or rebook */}
                      {isDone && (
                        <>
                          <button
                            onClick={() => {
                              setActiveBookingById(booking.id);
                              setActiveScreen('live-tour');
                            }}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>Lihat E-Tiket Arsip</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveBookingById(booking.id);
                              setActiveScreen('review');
                            }}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{booking.reviewRating ? `Ulasan (⭐ ${booking.reviewRating})` : 'Beri Ulasan'}</span>
                          </button>

                          <button
                            onClick={() => {
                              initDraftBooking(booking.title, booking.destination);
                              setActiveScreen('detail-tour');
                            }}
                            className="px-3.5 py-2 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pesan Lagi</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* DETAIL MODAL / DRAWER FOR SPECIFIC BOOKING */}
      {detailModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  RINCIAN BOOKING LENGKAP
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-[#19324d]">
                  {detailModalBooking.id}
                </h3>
              </div>

              <button
                onClick={() => setDetailModalBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto space-y-4 py-1 pr-1 flex-1 text-xs">
              
              {/* Status Badge */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Reservasi</span>
                  <div className="mt-1">{getStatusBadge(detailModalBooking.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Metode Bayar</span>
                  <strong className="text-xs text-[#19324d]">{detailModalBooking.paymentMethod}</strong>
                </div>
              </div>

              {/* Destination & Guide */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-[#19324d]">
                  {detailModalBooking.title}
                </h4>
                <div className="space-y-1 text-slate-600">
                  <p>📍 Meeting Point: <strong>{detailModalBooking.meetingPoint}</strong></p>
                  <p>📅 Jadwal Tur: <strong>{detailModalBooking.date}</strong></p>
                  <p>👥 Peserta: <strong>{detailModalBooking.participants} Orang</strong> ({detailModalBooking.guidesCount || 1} Pemandu Resmi)</p>
                  {detailModalBooking.selectedTransport && (
                    <p>🚗 Transportasi: <strong>{detailModalBooking.selectedTransport.name}</strong></p>
                  )}
                </div>
              </div>

              {/* QR Code Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <span className="text-[10px] font-bold text-[#19324d] uppercase tracking-wider block">
                  KODE QR CHECK-IN RESMI
                </span>
                <div className="w-28 h-28 bg-white border border-slate-200 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-xs">
                  <QrCode className="w-full h-full text-[#19324d]" />
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-700 block">
                  {detailModalBooking.checkInQrCode}
                </span>
              </div>

              {/* Food Add-on Breakdown if any */}
              {detailModalBooking.foodAddOns && detailModalBooking.foodAddOns.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl space-y-2">
                  <strong className="text-orange-950 font-bold block">🍱 Rincian Add-on Kuliner Bundling:</strong>
                  <div className="space-y-1.5">
                    {detailModalBooking.foodAddOns.map((food, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-700">
                          {food.quantity}x {food.name} ({food.selectedVariant}{food.selectedSpicy ? `, ${food.selectedSpicy}` : ''})
                        </span>
                        <strong className="text-orange-950">
                          Rp {food.totalPrice.toLocaleString('id-ID')}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Rincian Pembayaran
                </span>
                <div className="flex justify-between text-slate-600">
                  <span>Tiket Wisata & Jasa Pemandu</span>
                  <span>Rp {detailModalBooking.originalAmount.toLocaleString('id-ID')}</span>
                </div>
                {detailModalBooking.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon Voucher / Poin</span>
                    <span>- Rp {detailModalBooking.discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-[#19324d] text-sm pt-2 border-t border-slate-200">
                  <span>Total Tagihan (LUNAS)</span>
                  <span>Rp {detailModalBooking.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveBookingById(detailModalBooking.id);
                  setDetailModalBooking(null);
                  setActiveScreen('live-tour');
                }}
                className="flex-1 py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors text-center"
              >
                Buka E-Tiket Digital
              </button>
              <button
                type="button"
                onClick={() => setDetailModalBooking(null)}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
