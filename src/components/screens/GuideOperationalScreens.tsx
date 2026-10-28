import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ArrowLeft, MapPin, QrCode, CheckCircle2, Clock,
  Users, AlertTriangle, Check, X, Camera, Upload,
  ChevronRight, Star, ShieldCheck, AlertCircle
} from 'lucide-react';

type AgendaStatus = 'done' | 'ongoing' | 'upcoming';

interface AgendaItem {
  time: string;
  title: string;
  desc: string;
  status: AgendaStatus;
}

interface Participant {
  name: string;
  code: string;
  checkedIn: boolean;
}

// ============================================================
// GUIDE START TUR SCREEN (Tur Hari Ini & Sesi Aktif)
// ============================================================
export const GuideStartTourScreen: React.FC = () => {
  const { activeBooking, setActiveScreen } = useAppStore();
  const [sessionActive, setSessionActive] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<{ success: boolean; message: string } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: activeBooking.touristName || 'Wisatawan', code: activeBooking.checkInQrCode, checkedIn: false },
    { name: 'Peserta 2', code: 'ZHS-QR-GUEST2', checkedIn: false },
    { name: 'Peserta 3', code: 'ZHS-QR-GUEST3', checkedIn: false },
  ]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { time: '09:00', title: 'Meeting Point & Check-In', desc: activeBooking.meetingPoint || 'Plaza Air Mancur Gerbang Barat', status: 'upcoming' },
    { time: '09:30', title: 'Eksplorasi Spot Utama', desc: 'Menelusuri sejarah dan konservasi budaya', status: 'upcoming' },
    { time: '12:30', title: 'Makan Siang (Mitra UMKM)', desc: 'Warung Sate Maranggi Heritage', status: 'upcoming' },
    { time: '14:00', title: 'Spot Tambahan & Foto', desc: 'Spot tersembunyi eksklusif ZHS', status: 'upcoming' },
    { time: '16:30', title: 'Tutup Sesi & Penutupan', desc: 'Penyampaian feedback & rilis escrow', status: 'upcoming' },
  ]);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [tourFinished, setTourFinished] = useState(false);

  // Timer countdown simulation
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleActivateSession = () => {
    setSessionActive(true);
    setShowActivateModal(false);
    // Update agenda: first item becomes ongoing
    setAgenda(prev => prev.map((item, i) => i === 0 ? { ...item, status: 'ongoing' } : item));
  };

  const handleScanQr = () => {
    const code = qrInput.trim().toUpperCase();
    const participant = participants.find(p => p.code.toUpperCase() === code);
    if (participant) {
      setParticipants(prev =>
        prev.map(p => p.code.toUpperCase() === code ? { ...p, checkedIn: true } : p)
      );
      setQrResult({ success: true, message: `Verifikasi Berhasil! ${participant.name} telah check-in.` });
      setQrInput('');
    } else {
      setQrResult({ success: false, message: 'Kode QR tidak ditemukan atau tidak valid.' });
    }
  };

  const markAgendaDone = (idx: number) => {
    setAgenda(prev => prev.map((item, i) => {
      if (i === idx) return { ...item, status: 'done' };
      if (i === idx + 1) return { ...item, status: 'ongoing' };
      return item;
    }));
  };

  const handleFinishTour = () => {
    setTourFinished(true);
    setShowFinishModal(false);
    setActiveScreen('guide-tour-summary');
  };

  const allCheckedIn = participants.every(p => p.checkedIn);
  const checkedCount = participants.filter(p => p.checkedIn).length;

  if (tourFinished) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-dashboard')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-[#19324d]">Tur Hari Ini</h1>
            <p className="text-xs text-slate-500">{activeBooking.date}</p>
          </div>
          {sessionActive && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-700">AKTIF {formatTime(elapsedSeconds)}</span>
            </div>
          )}
        </div>

        {/* Tour Info Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-100">
              <img
                src={activeBooking.destinationImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'}
                alt={activeBooking.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[#19324d] text-sm leading-snug">{activeBooking.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{activeBooking.meetingPoint}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{activeBooking.participants} Peserta</span>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-slate-100 border border-slate-200 rounded-2xl h-24 flex items-center justify-center text-slate-400 text-xs gap-2">
            <MapPin className="w-4 h-4" /> Peta Lokasi Titik Temu
          </div>

          {!sessionActive ? (
            <button
              onClick={() => setShowActivateModal(true)}
              className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Aktifkan Sesi Tur & Beritahu Wisatawan</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowQrScanner(true)}
                className="py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Check-In Digital
              </button>
              <button
                onClick={() => setShowFinishModal(true)}
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Tur Selesai
              </button>
            </div>
          )}
        </div>

        {/* Participants Check-In */}
        {sessionActive && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Check-In Peserta</h3>
              <span className="text-xs font-bold text-slate-500">{checkedCount}/{participants.length} hadir</span>
            </div>
            {participants.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  p.checkedIn
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{p.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{p.code}</p>
                </div>
                {p.checkedIn ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <button
                    onClick={() => {
                      setQrInput(p.code);
                      setShowQrScanner(true);
                    }}
                    className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-sky-100"
                  >
                    Scan QR
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Agenda */}
        {sessionActive && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Agenda Perjalanan</h3>
              <span className="text-xs text-slate-500">
                {agenda.filter(a => a.status === 'done').length}/{agenda.length} selesai
              </span>
            </div>

            <div className="space-y-2 pl-3 border-l-2 border-slate-200 ml-2">
              {agenda.map((item, i) => (
                <div key={i} className="relative pl-4">
                  <div className={`absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[9px] ${
                    item.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    item.status === 'ongoing' ? 'bg-[#19324d] border-[#19324d] text-white animate-pulse' :
                    'bg-white border-slate-300'
                  }`}>
                    {item.status === 'done' && '✓'}
                    {item.status === 'ongoing' && '▶'}
                  </div>

                  <div className={`p-3 rounded-2xl border transition-all ${
                    item.status === 'done' ? 'bg-slate-50 border-slate-200' :
                    item.status === 'ongoing' ? 'bg-blue-50 border-blue-200' :
                    'bg-white border-slate-100 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{item.time}</span>
                          <strong className="text-xs text-[#19324d]">{item.title}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      {item.status === 'ongoing' && (
                        <button
                          onClick={() => markAgendaDone(i)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 whitespace-nowrap"
                        >
                          ✓ Selesai
                        </button>
                      )}
                      {item.status === 'done' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">SELESAI</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No-Show Report Button */}
        {sessionActive && !allCheckedIn && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>Jika wisatawan tidak hadir setelah <strong>15 menit</strong> dari jadwal, Anda dapat mengajukan laporan ketidakhadiran.</p>
            </div>
            <button
              onClick={() => setActiveScreen('guide-no-show-report')}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Laporan Ketidakhadiran Wisatawan
            </button>
          </div>
        )}

      </div>

      {/* Activate Session Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-black text-[#19324d]">Aktifkan Sesi Tur?</h3>
            <p className="text-xs text-slate-500">
              Notifikasi push akan dikirim ke seluruh peserta bahwa tur telah dimulai dan pemandu sudah berada di lokasi.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowActivateModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleActivateSession}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm"
              >
                Ya, Aktifkan!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#19324d]">Check-In Digital</h3>
              <button onClick={() => { setShowQrScanner(false); setQrResult(null); }} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR viewfinder */}
            <div className="w-full h-40 bg-slate-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-4 border-2 border-amber-400/60 rounded-xl" />
              <QrCode className="w-16 h-16 text-white/40" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-400/40 animate-bounce" />
            </div>

            <div>
              <p className="text-xs text-slate-500 text-center mb-2">Atau masukkan kode booking secara manual:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode booking (contoh: ZHS-QR-BK99201)"
                  value={qrInput}
                  onChange={e => setQrInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#19324d]"
                />
                <button
                  onClick={handleScanQr}
                  className="px-4 py-2 bg-[#19324d] text-white text-xs font-bold rounded-xl"
                >
                  Cek
                </button>
              </div>
            </div>

            {qrResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                qrResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-700 border border-red-300'
              }`}>
                {qrResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {qrResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finish Tour Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-[#19324d]">Tutup Sesi Tur?</h3>
            <p className="text-xs text-slate-500">
              Konfirmasi bahwa seluruh itinerary telah dikunjungi dan tur berjalan sesuai rencana.
              Dana Escrow akan dirilis ke rekening Anda dalam 1×24 jam.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleFinishTour}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl"
              >
                Ya, Selesai & Tutup Tur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// GUIDE TOUR SUMMARY SCREEN
// ============================================================
export const GuideTourSummaryScreen: React.FC = () => {
  const { activeBooking, setActiveScreen, markTourCompleted } = useAppStore();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    markTourCompleted(activeBooking.id);
  }, []);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-black text-[#19324d]">Tur Selesai! Terima Kasih 🎉</h2>
          <p className="text-sm text-slate-500">Dana Escrow sedang diproses untuk dirilis ke rekening Anda.</p>
          <button onClick={() => setActiveScreen('guide-dashboard')} className="w-full py-3.5 bg-[#19324d] text-white font-bold text-sm rounded-2xl">
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        <h1 className="text-xl font-black text-[#19324d]">Ringkasan Tur</h1>

        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-300 rounded-3xl p-5 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-black text-emerald-800">Tur Berhasil Diselesaikan!</h2>
          <p className="text-xs text-emerald-700">
            Status booking: <strong>Selesai</strong> • Dana Escrow dilepas dalam 1×24 jam
          </p>
          <div className="pt-2 text-sm font-extrabold text-emerald-800">
            💰 Rp {activeBooking.totalAmount.toLocaleString('id-ID')} akan ditransfer ke rekening Anda
          </div>
        </div>

        {/* Tour Summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Detail Tur</h3>
          <div className="space-y-2 text-slate-700">
            <p>📍 <strong>{activeBooking.title}</strong></p>
            <p>📅 Tanggal: {activeBooking.date}</p>
            <p>👥 Peserta: {activeBooking.participants} orang</p>
            <p>💵 Total: Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Review for Wisatawan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Ulasan Terhadap Wisatawan</h3>
          <p className="text-xs text-slate-500">Wisatawan juga akan mendapat notifikasi untuk memberikan ulasan tentang tur ini</p>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Rating Wisatawan</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 transition-colors ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            placeholder="Berikan ulasan Anda tentang perilaku dan kehadiran wisatawan..."
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#19324d]"
          />

          <button
            onClick={() => setSubmitted(true)}
            disabled={rating === 0}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl transition-all"
          >
            Kirim Ulasan & Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// GUIDE NO-SHOW REPORT SCREEN
// ============================================================
export const GuideNoShowReportScreen: React.FC = () => {
  const { activeBooking, setActiveScreen } = useAppStore();
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto maksimum 5MB');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setPhotoFile(file);
      setPhotoUploaded(true);
      setUploading(false);
    }, 1200);
  };

  if (reportSent) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-[#19324d]">Laporan Terkirim</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Laporan ketidakhadiran wisatawan telah dikirim ke tim admin. Status tur berubah menjadi <strong>Laporan Ketidakhadiran - Dalam Peninjauan</strong>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 text-left space-y-1">
            <p className="font-bold">Selanjutnya:</p>
            <ul className="space-y-1">
              <li>✓ Bukti foto dan timestamp tersimpan</li>
              <li>✓ Mekanisme Escrow Dispute diaktifkan</li>
              <li>✓ Wisatawan mendapat notifikasi laporan</li>
              <li>✓ Dana kompensasi akan dicairkan setelah verifikasi admin</li>
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

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-start-tour')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Laporkan Ketidakhadiran</h1>
            <p className="text-xs text-slate-500">Dokumentasi untuk proses klaim kompensasi Escrow</p>
          </div>
        </div>

        {/* Warning Card */}
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-start gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Perhatian Sebelum Melaporkan</p>
              <p>Laporan ini bersifat <strong>resmi dan tidak dapat dibatalkan</strong>. Pastikan Anda sudah menunggu minimal <strong>15 menit</strong> dari jadwal yang disepakati.</p>
              <p>Dana kompensasi dari Escrow akan dicairkan ke akun Anda setelah verifikasi admin selesai.</p>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Waktu Tunggu SOP</p>
          <div className="text-5xl font-black text-red-600">00:15:00</div>
          <p className="text-xs text-slate-500">Batas waktu tunggu sesuai SOP ZHS</p>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full w-full" />
          </div>
          <p className="text-xs font-bold text-red-600">⏰ Waktu tunggu telah berakhir</p>
        </div>

        {/* Booking Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-xs space-y-2">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Detail Booking</h3>
          <p><strong>Wisatawan:</strong> {activeBooking.touristName || 'Wisatawan'}</p>
          <p><strong>Tur:</strong> {activeBooking.title}</p>
          <p><strong>Jadwal:</strong> {activeBooking.date}</p>
          <p><strong>Titik Temu:</strong> {activeBooking.meetingPoint}</p>
          <p><strong>Nilai Escrow:</strong> <span className="text-emerald-700 font-bold">Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</span></p>
        </div>

        {/* Photo Upload */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-bold text-[#19324d]">Bukti Kehadiran Anda di Titik Temu *</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Format JPG/PNG, maks 5MB. Foto akan di-geotagging secara otomatis.
            </p>
          </div>

          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer text-center transition-all ${
              photoUploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
            }`}
          >
            {uploading ? (
              <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-[#19324d] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Mengunggah foto...</p>
              </div>
            ) : photoUploaded ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-700">Foto berhasil diunggah sebagai bukti</p>
                <p className="text-[11px] text-emerald-600">📍 Geotagging otomatis diterapkan</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Ambil/Unggah Foto Bukti</p>
                <p className="text-xs text-slate-400">Foto harus menampilkan lokasi titik temu dengan jelas</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Submit */}
        <button
          onClick={() => photoUploaded && setReportSent(true)}
          disabled={!photoUploaded}
          className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Kirim Laporan
        </button>
      </div>
    </div>
  );
};

// ============================================================
// GUIDE DISPUTE SCREEN
// ============================================================
export const GuideDisputeScreen: React.FC = () => {
  const { activeBooking, setActiveScreen } = useAppStore();
  const [description, setDescription] = useState('');
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-5">
          <ShieldCheck className="w-14 h-14 text-sky-600 mx-auto" />
          <h2 className="text-xl font-black text-[#19324d]">Dispute Diselesaikan</h2>
          <p className="text-sm text-slate-500">Status: <strong>Closed (Dispute Selesai)</strong></p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 text-left">
            <p className="font-bold mb-1">Keputusan Admin ZHS:</p>
            <p>Dana Escrow sebesar <strong>Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong> dicairkan ke rekening Pemandu.</p>
            <p className="mt-1 text-[11px] text-emerald-600">Seluruh riwayat dispute tersimpan untuk keperluan audit.</p>
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
          <button onClick={() => setActiveScreen('guide-dashboard')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Pengajuan Dispute</h1>
            <p className="text-xs text-slate-500">Sengketa terkait booking {activeBooking.id}</p>
          </div>
        </div>

        {/* Frozen funds banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-0.5">
            <p className="font-bold">Dana Dibekukan Sementara</p>
            <p>Rp {activeBooking.totalAmount.toLocaleString('id-ID')} akan ditahan hingga admin ZHS menyelesaikan peninjauan dispute ini.</p>
          </div>
        </div>

        {/* Dispute form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d]">Formulir Dispute</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deskripsi Masalah *</label>
            <textarea
              rows={4}
              placeholder="Jelaskan permasalahan secara detail dan faktual..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#19324d]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Bukti Pendukung (Foto/Dokumen)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer text-center transition-all ${
                evidenceUploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d]'
              }`}
            >
              {evidenceUploaded ? (
                <div className="flex items-center justify-center gap-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-bold">Bukti berhasil diunggah</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">Klik untuk unggah foto atau dokumen bukti</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) setEvidenceUploaded(true); }} />
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800">
            <p className="font-bold">📋 Proses Dispute:</p>
            <ol className="mt-1 space-y-0.5 list-decimal list-inside">
              <li>Pihak lain akan menerima notifikasi dan memberikan tanggapan</li>
              <li>Admin ZHS meninjau semua bukti, riwayat chat & data transaksi</li>
              <li>Keputusan admin bersifat final dan mengikat</li>
              <li>Dana didistribusikan sesuai keputusan admin</li>
            </ol>
          </div>
        </div>

        <button
          onClick={() => description && setSubmitted(true)}
          disabled={!description}
          className="w-full py-4 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all"
        >
          Ajukan Dispute
        </button>
      </div>
    </div>
  );
};
