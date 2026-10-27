import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_GUIDES, MOCK_DESTINATIONS, MOCK_UMKM } from '../data/mockData';
import { 
  ShieldCheck, QrCode, CheckCircle2, Clock, 
  Star, Sparkles, Store, CreditCard, UserCheck 
} from 'lucide-react';

export const EscrowBookingView: React.FC = () => {
  const { 
    activeBooking, 
    confirmPayment, 
    guideConfirmBooking, 
    completeTourCheckOut,
    setActiveScreen 
  } = useAppStore();

  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'BCA Virtual Account' | 'GoPay' | 'ShopeePay'>('QRIS');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('Tur luar biasa! Pemandu sangat ramah, paham jalur rahasia, dan oleh-oleh UMKM Osing autentik.');

  // If no active booking, provide a default initialized demo booking
  const booking = activeBooking || {
    id: 'BK-892104',
    guide: MOCK_GUIDES[0],
    destination: MOCK_DESTINATIONS[0],
    bundledUMKM: MOCK_UMKM[0],
    date: '2026-10-25',
    participants: 2,
    totalAmount: 400000,
    paymentMethod: 'QRIS',
    status: 'pending_payment',
    checkInQrCode: 'ZHS-QR-K3M90A'
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending_payment':
        return <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">Menunggu Pembayaran</span>;
      case 'escrow_locked':
        return <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold">Dana Aman di Escrow (Menunggu Konfirmasi Pemandu)</span>;
      case 'confirmed_by_guide':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">Terkonfirmasi · Siap Check-In QR</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">Tur Selesai · Dana Escrow Cair</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1b2d] text-slate-100 px-4 md:px-8 py-8 pb-24 md:pb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sistem Pembayaran Escrow (Dana Aman Terjaga)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Detail Booking Tur & Status Escrow
            </h1>
            <p className="text-xs text-slate-400">Kode Booking: <strong>{booking.id}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* ESCROW UX EXPLANATION BANNER (PDF Halaman 3 UX recommendation) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-emerald-950/60 border border-blue-500/40 flex items-start gap-3.5 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-white text-sm">Prinsip Perlindungan Transaksi ZHS</h4>
            <p className="text-slate-300 leading-relaxed">
              Dana Anda tidak langsung masuk ke rekening pribadi pemandu, melainkan ditampung di sistem Rekening Bersama Escrow resmi <strong>("Dana Aman Terjaga")</strong>. Pemandu memiliki batas 24 jam untuk konfirmasi. Dana baru dicairkan setelah tur selesai tuntas dan Anda menekan tombol konfirmasi selesai.
            </p>
          </div>
        </div>

        {/* TWO-COLUMN DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SUMMARY & BUNDLING ITINERARY */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Package Summary Card */}
            <div className="bg-[#14263c] border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-sm border-b border-slate-700/60 pb-2">
                Ringkasan Paket Wisata & Pemandu
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={booking.guide?.avatar}
                  alt={booking.guide?.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{booking.guide?.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-400 block">{booking.guide?.location}</span>
                  <span className="text-[11px] text-amber-300">⭐ {booking.guide?.rating} Rating Pemandu</span>
                </div>
              </div>

              {/* Bundling UMKM Card */}
              {booking.bundledUMKM && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Store className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                        Bundling Kemitraan UMKM:
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {booking.bundledUMKM.name} ({booking.bundledUMKM.featuredProduct})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded">
                    Voucher Aktif
                  </span>
                </div>
              )}

              {/* Trip specs */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tanggal Kunjungan</span>
                  <span className="font-semibold text-white">{booking.date}</span>
                </div>
                <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Jumlah Peserta</span>
                  <span className="font-semibold text-white">{booking.participants} Orang</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="pt-3 border-t border-slate-700/60 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Jasa Pemandu BNSP (1 Hari)</span>
                  <span>Rp {booking.guide?.pricePerDay.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bundling Paket Kuliner/Kriya UMKM</span>
                  <span>Rp 50.000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Biaya Layanan & Rekening Escrow</span>
                  <span className="text-emerald-400 font-semibold">Gratis (Promo v2.0)</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                  <span>Total Pembayaran</span>
                  <span className="text-amber-400">Rp {booking.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Simulating Next-Best Match if needed (PDF Halaman 3) */}
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pemandu tidak merespons dalam 24 jam? Sistem otomatis alihkan ke <strong>Next-Best Match</strong>.</span>
              </div>
            </div>

          </div>

          {/* RIGHT: INTERACTIVE PAYMENT & ESCROW LIFECYCLE */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* STAGE 1: PENDING PAYMENT */}
            {booking.status === 'pending_payment' && (
              <div className="bg-[#14263c] border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Pilih Metode Pembayaran</span>
                </h3>

                <div className="space-y-2">
                  {(['QRIS', 'BCA Virtual Account', 'GoPay', 'ShopeePay'] as const).map((method) => (
                    <label
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method
                          ? 'border-amber-400 bg-slate-800/90 text-white shadow-sm'
                          : 'border-slate-700/60 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">
                          {paymentMethod === method && '●'}
                        </span>
                        <span className="text-xs font-semibold">{method}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400">Verifikasi Otomatis</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'QRIS' && (
                  <div className="p-4 bg-white rounded-2xl text-center space-y-2 text-slate-900 max-w-xs mx-auto">
                    <div className="w-36 h-36 bg-slate-100 border border-slate-300 rounded-xl mx-auto flex items-center justify-center p-2">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <span className="text-[11px] font-bold block">Scan QRIS Nasional (Semua Bank / E-Wallet)</span>
                  </div>
                )}

                <button
                  onClick={() => confirmPayment(paymentMethod)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Konfirmasi Pembayaran ke Rekening Escrow</span>
                </button>
              </div>
            )}

            {/* STAGE 2: ESCROW LOCKED (WAITING GUIDE CONFIRMATION) */}
            {booking.status === 'escrow_locked' && (
              <div className="bg-[#14263c] border border-sky-500/40 rounded-2xl p-5 space-y-4 shadow-xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Dana Berhasil Masuk Escrow</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Notifikasi telah dikirimkan ke pemandu <strong>{booking.guide?.name}</strong>. Pemandu memiliki batas waktu konfirmasi 24 jam.
                  </p>
                </div>

                {/* Simulation trigger for demo purposes */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-left space-y-2">
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Simulasi Sistem (Aksi Pemandu):
                  </span>
                  <button
                    onClick={guideConfirmBooking}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>[Simulasi] Pemandu Menerima & Mengonfirmasi Booking</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: CONFIRMED & READY FOR DIGITAL QR CHECK-IN */}
            {booking.status === 'confirmed_by_guide' && (
              <div className="bg-[#14263c] border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">E-Tiket & Check-In Digital Siap</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Tunjukkan QR Code ini kepada pemandu saat hari tur untuk memulai sesi perjalanan.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl max-w-xs mx-auto text-slate-900">
                  <QrCode className="w-32 h-32 mx-auto text-slate-900" />
                  <p className="text-xs font-mono font-bold mt-1 tracking-widest">{booking.checkInQrCode}</p>
                </div>

                {/* Tour Completion Action */}
                <div className="pt-2">
                  <button
                    onClick={() => completeTourCheckOut(rating, review)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Tur Selesai & Cairkan Escrow ke Pemandu</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: TOUR COMPLETED & GAMIFICATION REWARD */}
            {booking.status === 'completed' && (
              <div className="bg-[#14263c] border border-purple-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/40">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">Tur Berhasil Selesai!</h3>
                  <p className="text-xs text-slate-300">
                    Dana Escrow telah dicairkan ke pemandu. Anda mendapatkan <strong>+100 Poin Gamifikasi ZHS</strong>.
                  </p>
                </div>

                {/* Rating & Review */}
                <div className="space-y-3 pt-2 border-t border-slate-700/60">
                  <label className="block text-xs font-semibold text-slate-300">
                    Beri Ulasan & Nilai Pemandu (Feedback Loop Skor Supply):
                  </label>

                  <div className="flex gap-2 justify-center py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1.5 rounded-lg transition-transform hover:scale-125 ${
                          rating >= star ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />

                  <button
                    onClick={() => setActiveScreen('explore')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow"
                  >
                    Simpan Ulasan & Kembali ke Jelajahi
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
