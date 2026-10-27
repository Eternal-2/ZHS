import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ArrowLeft, MapPin, Calendar, Users, MessageSquare,
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Clock, Star, DollarSign, ChevronRight, Check, X
} from 'lucide-react';

// ============================================================
// GUIDE BOOKING REQUEST SCREEN (Konfirmasi Booking by Pemandu)
// ============================================================
export const GuideBookingRequestScreen: React.FC = () => {
  const { setActiveScreen, activeBooking, guideConfirmBooking, cancelBookingById } = useAppStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectFlow, setShowRejectFlow] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleConfirm = () => {
    guideConfirmBooking();
    setShowConfirmModal(false);
    setBookingConfirmed(true);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#19324d]">Booking Diterima! 🎉</h2>
            <p className="text-sm text-slate-500">Jadwal berhasil dikunci. Wisatawan akan menerima e-tiket segera.</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 text-left space-y-1">
            <p className="font-bold">Yang terjadi selanjutnya:</p>
            <ul className="space-y-1">
              <li>✓ Status booking: <strong>Dikonfirmasi</strong></li>
              <li>✓ Tanggal dikunci di kalender Anda</li>
              <li>✓ E-tiket dikirim ke Wisatawan</li>
              <li>✓ Komisi awal diamankan di Saldo Escrow</li>
              <li>✓ Notifikasi 'Booking Berhasil Dikonfirmasi' terkirim</li>
            </ul>
          </div>
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-semibold">
            💰 Komisi Escrow: <strong className="text-sky-900">Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong> diamankan
          </div>
          <button
            onClick={() => setActiveScreen('guide-dashboard')}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-sm rounded-2xl shadow-md"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showRejectFlow) {
    return <GuideRejectBookingScreen
      onBack={() => setShowRejectFlow(false)}
      booking={activeBooking}
    />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-dashboard')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Detail Permintaan Booking</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-700">Pending - Menunggu Konfirmasi Anda</span>
            </div>
          </div>
        </div>

        {/* Escrow Status */}
        <div className="bg-sky-50 border border-sky-300 rounded-2xl p-3.5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-sky-900">Dana Wisatawan Sudah Aman di Escrow ZHS</span>
            <p className="text-sky-700 mt-0.5">Pembayaran telah dikonfirmasi. Dana akan rilis ke Anda setelah tur selesai.</p>
          </div>
        </div>

        {/* Wisatawan Profile */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Profil Wisatawan</h3>
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
              alt="Wisatawan"
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
            />
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#19324d]">Niceguymo</h4>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>4.8 (12 tur)</span>
                <span className="text-slate-400 ml-2">• Level 5: Heritage Explorer</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* Tour Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Detail Tur yang Dipesan</h3>

          <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100">
            <img
              src={activeBooking.destinationImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
              alt={activeBooking.title}
              className="w-full h-full object-cover"
            />
          </div>

          <h4 className="text-base font-black text-[#19324d]">{activeBooking.title}</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Tanggal Tur</span>
                <strong>{activeBooking.date}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Jumlah Peserta</span>
                <strong>{activeBooking.participants} Orang</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <span className="text-slate-500 block">Titik Penjemputan</span>
                <strong>{activeBooking.meetingPoint}</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-500 block">Nilai Escrow</span>
                <strong className="text-emerald-700">Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl h-28 flex items-center justify-center text-slate-400 text-xs">
            <MapPin className="w-5 h-5 mr-1" /> Peta Titik Penjemputan
          </div>

          {activeBooking.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <span className="font-bold block">Catatan dari Wisatawan:</span>
              <p className="mt-0.5">"{activeBooking.notes}"</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="text-xs text-slate-500 text-center">
            <Clock className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
            Batas konfirmasi: <strong className="text-amber-700">24 jam</strong> setelah permintaan diterima
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Konfirmasi Booking
          </button>

          <button
            onClick={() => setShowRejectFlow(true)}
            className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Tolak Booking
          </button>
        </div>

      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-[#19324d]">Konfirmasi Booking?</h3>
            <p className="text-xs text-slate-500">
              Dengan menekan <strong>Ya, Kunci Jadwal</strong>, tanggal {activeBooking.date} akan dikunci di kalender Anda dan Anda berkomitmen untuk memandu tur ini.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
              >
                Ya, Kunci Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// GUIDE REJECT BOOKING SCREEN
// ============================================================
const GuideRejectBookingScreen: React.FC<{ onBack: () => void; booking: any }> = ({ onBack, booking }) => {
  const { setActiveScreen, cancelBookingById } = useAppStore();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    'Jadwal sudah penuh pada tanggal tersebut',
    'Jumlah peserta melebihi kapasitas',
    'Lokasi di luar jangkauan area saya',
    'Kondisi cuaca tidak memungkinkan',
    'Alasan pribadi/darurat',
    'Lainnya'
  ];

  const handleConfirmReject = () => {
    cancelBookingById(booking.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-black text-[#19324d]">Booking Ditolak</h2>
          <p className="text-sm text-slate-500 leading-relaxed">Permintaan booking telah ditolak. Refund penuh akan dikembalikan ke Wisatawan dalam 1x24 jam kerja.</p>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 text-left space-y-1">
            <p className="font-bold">Yang terjadi selanjutnya:</p>
            <ul className="space-y-1">
              <li>✓ Status booking: <strong>Ditolak</strong></li>
              <li>✓ Dana dikembalikan 100% ke Wisatawan</li>
              <li>✓ Wisatawan mendapat notifikasi alasan penolakan</li>
            </ul>
          </div>
          <button
            onClick={() => setActiveScreen('guide-dashboard')}
            className="w-full py-3.5 bg-[#19324d] text-white font-bold text-sm rounded-2xl"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Tolak Permintaan Booking</h1>
            <p className="text-xs text-slate-500">Pilih alasan penolakan untuk diteruskan ke Wisatawan</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>Setelah Anda menolak, dana wisatawan akan dikembalikan secara otomatis. Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d]">Alasan Penolakan *</h3>
          <div className="space-y-2">
            {reasons.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  reason === r
                    ? 'border-[#19324d] bg-[#19324d]/5 text-[#19324d] font-bold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Pesan Tambahan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan pesan untuk wisatawan..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#19324d] transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleConfirmReject}
          disabled={!reason}
          className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Konfirmasi Penolakan
        </button>
      </div>
    </div>
  );
};
