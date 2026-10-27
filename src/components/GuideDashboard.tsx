import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AVAILABLE_DESTINATIONS } from '../data/bookingExtras';
import { 
  UserCheck, ShieldCheck, Calendar, DollarSign, 
  TrendingUp, CheckCircle2, MessageSquare, QrCode, 
  AlertCircle, Users, MapPin, Clock, ArrowRight,
  Settings, Star, Check, X, Wallet, ChevronRight, RefreshCw,
  Compass, CheckSquare, Square
} from 'lucide-react';

export const GuideDashboard: React.FC = () => {
  const { 
    currentUser, 
    userBookings, 
    guideAvailability, 
    toggleGuideAvailability, 
    guideWithdrawableBalance, 
    withdrawGuideBalance, 
    guideValidateQr, 
    guideAcceptLeadBooking,
    guideManagedDestinations,
    setGuideManagedDestinations,
    openDirectChat,
    markTourCompleted,
    setActiveScreen
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'tours' | 'chat' | 'destinations' | 'pricing' | 'reviews'>('tours');
  const [dailyRate, setDailyRate] = useState(350000);
  const [coverageArea, setCoverageArea] = useState('Purwakarta, Subang & Bandung Barat');
  const [maxPax, setMaxPax] = useState(10);
  const [qrInput, setQrInput] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrFeedback, setQrFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [leadAccepted, setLeadAccepted] = useState(false);

  // Guide destination selections state
  const [selectedDests, setSelectedDests] = useState<string[]>(
    guideManagedDestinations || ['situ-buleud', 'pasir-langlang', 'curug-tilu', 'gracia-spa']
  );
  const [destSavedSuccess, setDestSavedSuccess] = useState(false);

  // Active bookings where guide is assigned
  const activeTours = userBookings.filter(
    b => b.status === 'confirmed_by_guide' || b.status === 'in_tour'
  );
  const completedTours = userBookings.filter(b => b.status === 'completed');

  // Total escrow locked in active tours
  const escrowLockedAmount = activeTours.reduce((acc, b) => acc + b.totalAmount, 0);

  const handleValidateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    const res = guideValidateQr(qrInput.trim());
    setQrFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setQrModalOpen(false);
        setQrInput('');
        setQrFeedback(null);
      }, 1500);
    }
  };

  const handleWithdraw = () => {
    if (guideWithdrawableBalance <= 0) return;
    withdrawGuideBalance();
    setWithdrawSuccess(true);
    setTimeout(() => setWithdrawSuccess(false), 3000);
  };

  const handleAcceptLead = () => {
    guideAcceptLeadBooking();
    setLeadAccepted(true);
  };

  const handleToggleDestination = (destId: string) => {
    setDestSavedSuccess(false);
    if (selectedDests.includes(destId)) {
      setSelectedDests(selectedDests.filter(id => id !== destId));
    } else {
      setSelectedDests([...selectedDests, destId]);
    }
  };

  const handleSaveDestinations = () => {
    setGuideManagedDestinations(selectedDests);
    setDestSavedSuccess(true);
    setTimeout(() => setDestSavedSuccess(false), 4000);
  };

  const handleSelectAllDestinations = () => {
    setDestSavedSuccess(false);
    setSelectedDests(AVAILABLE_DESTINATIONS.map(d => d.id));
  };

  const handleDeselectAllDestinations = () => {
    setDestSavedSuccess(false);
    setSelectedDests([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 md:pb-16">
      
      {/* GUIDE PROFILE TOP BANNER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* Guide Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                  alt="Guide Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover border-2 border-amber-400 shadow-sm"
                />
                <span className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lisensi BNSP #ID-BNSP-889</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mitra Resmi ZHS</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-[#19324d]">
                  {currentUser?.name || 'Bambang Pamungkas, S.Sos'}
                </h1>

                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.95 Rating Kepuasan</span>
                  </span>
                  <span>•</span>
                  <span>{completedTours.length + 142} Tur Tuntas</span>
                  <span>•</span>
                  <span>Jangkauan: {coverageArea}</span>
                </p>
              </div>
            </div>

            {/* Availability Toggle Switch */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between md:justify-end gap-4 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  STATUS OPERASIONAL
                </span>
                <span className={`text-xs font-black ${guideAvailability ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {guideAvailability ? '● SIAP TERIMA TOUR (ONLINE)' : '○ ISTIRAHAT (OFFLINE)'}
                </span>
              </div>

              <button
                onClick={toggleGuideAvailability}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                  guideAvailability
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {guideAvailability ? 'Online' : 'Ubah ke Online'}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* ESCROW FINANCIAL CARDS (TRANSPARAN KHUSUS PEMANDU) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Saldo Siap Cair */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Saldo Siap Dicairkan</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>

            <div>
              <div className="text-2xl font-black text-[#19324d]">
                Rp {guideWithdrawableBalance.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hasil dari tur-tur yang telah selesai divalidasi
              </p>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={guideWithdrawableBalance <= 0}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Tarik Saldo ke Rekening
            </button>

            {withdrawSuccess && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 text-center font-semibold animate-in fade-in">
                ✓ Permintaan penarikan diproses! Dana dikirim ke rekening Anda.
              </div>
            )}
          </div>

          {/* Card 2: Saldo Tertahan di Escrow */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Dana Tertahan di Escrow</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>

            <div>
              <div className="text-2xl font-black text-[#19324d]">
                Rp {escrowLockedAmount.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dari {activeTours.length} reservasi aktif yang sedang berjalan
              </p>
            </div>

            <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 leading-snug">
              🔒 Dana otomatis rilis ke saldo Anda segera setelah tur selesai.
            </div>
          </div>

          {/* Card 3: Response Rate & Ranking */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Performa Smart Match</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>

            <div>
              <div className="text-2xl font-black text-[#19324d]">
                98% Respon Cepat
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prioritas Match Teratas • Rating 4.95 / 5.0
              </p>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-snug">
              ⭐ Pemandu unggulan aktif untuk {selectedDests.length} destinasi wisata.
            </div>
          </div>

        </div>

        {/* QUICK ACTIONS: AKSES CEPAT FLOW PEMANDU */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveScreen('guide-booking-request')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#19324d] group-hover:text-emerald-700 transition-colors">Konfirmasi Booking</p>
              <p className="text-[10px] text-slate-500">Tinjau & terima permintaan</p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen('guide-start-tour')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-sky-300 transition-all text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#19324d] group-hover:text-sky-700 transition-colors">Mulai Tur Hari Ini</p>
              <p className="text-[10px] text-slate-500">Aktifkan sesi & check-in</p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen('guide-no-show-report')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-300 transition-all text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#19324d] group-hover:text-amber-700 transition-colors">Laporkan No-Show</p>
              <p className="text-[10px] text-slate-500">Wisatawan tidak hadir</p>
            </div>
          </button>

          <button
            onClick={() => setActiveScreen('guide-dispute')}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all text-left space-y-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#19324d] group-hover:text-red-700 transition-colors">Ajukan Dispute</p>
              <p className="text-[10px] text-slate-500">Sengketa escrow</p>
            </div>
          </button>
        </div>

        {/* TAB NAVIGATION: TAMPILAN OPERASIONAL PEMANDU */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tours'
                ? 'bg-[#19324d] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}

          >
            <Calendar className="w-4 h-4" />
            <span>Tur Aktif & Permintaan ({activeTours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-[#19324d] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat Wisatawan ({activeTours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'destinations'
                ? 'bg-[#19324d] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pilihan Wisata yang Dipandu ({selectedDests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'bg-[#19324d] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Tarif & Kapasitas Supply</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-[#19324d] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Ulasan Wisatawan ({completedTours.length})</span>
          </button>
        </div>

        {/* TAB 1: TUR AKTIF & PERMINTAAN */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#19324d]">
                  Tur Sedang Berjalan & Reservasi Terkonfirmasi
                </h3>
                <p className="text-xs text-slate-500">
                  Validasi kedatangan wisatawan via E-Tiket QR dan selesaikan tur untuk klaim dana escrow
                </p>
              </div>

              <button
                onClick={() => setQrModalOpen(true)}
                className="px-4 py-2.5 bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <QrCode className="w-4 h-4" />
                <span>Pindai / Validasi E-Tiket QR</span>
              </button>
            </div>

            {/* Active Tours List */}
            {activeTours.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-[#19324d]">Tidak Ada Tur Aktif Saat Ini</h4>
                <p className="text-xs text-slate-500">
                  Nantikan permintaan baru yang masuk melalui Smart Matching Engine ZHS.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg">
                          {tour.id}
                        </span>
                        <span className="text-xs font-bold text-[#19324d]">
                          {tour.title}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                        tour.status === 'in_tour'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tour.status === 'in_tour' ? 'Sedang Berlangsung (In Tour)' : 'Escrow Terkunci (Siap Jalan)'}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium block">WISATAWAN & PESERTA</span>
                        <strong className="text-slate-800 block text-sm">
                          Niceguymo ({tour.participants} Orang)
                        </strong>
                        <span className="text-slate-500 text-[11px]">
                          Rasio 1 Pemandu untuk {tour.participants} Peserta (Sesuai Standar)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium block">TITIK KUMPUL & JADWAL</span>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-semibold">{tour.meetingPoint}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tour.date}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 font-medium block">NILAI ESCROW TERKUNCI</span>
                        <div className="text-base font-black text-emerald-700">
                          Rp {tour.totalAmount.toLocaleString('id-ID')}
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          Metode: {tour.paymentMethod}
                        </span>
                      </div>
                    </div>

                    {/* Operational Action Buttons for the Guide */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDirectChat(tour.id)}
                          className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-sky-700" />
                          <span>Buka Chat Wisatawan</span>
                        </button>

                        <button
                          onClick={() => {
                            setQrInput(tour.checkInQrCode);
                            setQrModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Validasi Tiket ({tour.checkInQrCode})</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          markTourCompleted(tour.id);
                          alert(`Tur ${tour.id} telah resmi Anda selesaikan! Dana Escrow Rp ${tour.totalAmount.toLocaleString('id-ID')} berhasil dicairkan.`);
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan Tur & Rilis Escrow</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INCOMING DEMAND LEADS FROM MATCHING ENGINE */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                  <h4 className="text-sm font-extrabold text-[#19324d]">
                    Permintaan Tur Masuk (Matching Engine)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Batas Waktu: 20 Jam
                </span>
              </div>

              {!leadAccepted ? (
                <div className="bg-white border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <strong className="text-sm text-[#19324d] block font-bold">
                      Wisatawan Ramadhan (2 Peserta) • Tur Lembah Hijau & Mata Air Asri
                    </strong>
                    <p className="text-slate-600">
                      Tanggal: 25 Oktober 2026 • Bundling Kopi & Oleh-oleh Desa Cihanjawar
                    </p>
                    <span className="text-emerald-700 font-bold block">
                      Estimasi Escrow: Rp 81.000 (Sesuai Tarif Anda)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { guideAcceptLeadBooking(); setActiveScreen('guide-booking-request'); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tinjau Booking</span>
                    </button>
                    <button
                      onClick={() => alert('Permintaan dialihkan ke pemandu lain di matching pool.')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Permintaan berhasil diterima! Tur kini masuk ke daftar reservasi aktif Anda.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CHAT WISATAWAN */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Daftar Percakapan dengan Wisatawan
              </h3>
              <p className="text-xs text-slate-500">
                Pesan terhubung langsung dengan kode reservasi dan proteksi ZHS
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {activeTours.map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => openDirectChat(tour.id)}
                  className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
                        alt="Niceguymo"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#19324d]">
                          Niceguymo
                        </strong>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {tour.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        "Halo Mas Bambang! Senang bisa dipandu Mas Bambang..."
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {tour.title} • {tour.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-3 py-1.5 bg-[#19324d] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs">
                      <span>Buka Chat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PILIHAN DESTINASI WISATA YANG DIPANDU (FITUR SPESIALISASI PEMANDU) */}
        {activeTab === 'destinations' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Header & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold mb-1.5">
                  <Compass className="w-3.5 h-3.5 text-sky-600" />
                  <span>Jangkauan Wilayah: {coverageArea}</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#19324d]">
                  Pilih Wisata yang Siap Anda Pandu
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan spot wisata mana saja yang Anda kuasai. Sistem matching engine hanya akan mencocokkan Anda dengan pesanan untuk wisata yang Anda centang.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllDestinations}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllDestinations}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            {/* Save Success Notice */}
            {destSavedSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold animate-in fade-in shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Perubahan berhasil disimpan! Anda terdaftar sebagai pemandu aktif untuk {selectedDests.length} destinasi wisata ini di sistem ZHS.
                </span>
              </div>
            )}

            {/* Destination Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_DESTINATIONS.map((dest) => {
                const isSelected = selectedDests.includes(dest.id);

                return (
                  <div
                    key={dest.id}
                    onClick={() => handleToggleDestination(dest.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                      isSelected
                        ? 'bg-sky-50/50 border-sky-400 shadow-xs ring-1 ring-sky-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="pt-0.5 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-sky-600 fill-sky-100" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    {/* Image */}
                    <img
                      src={dest.image}
                      alt={dest.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {dest.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isSelected ? '✓ Aktif Dipandu' : 'Non-Aktif'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-[#19324d] leading-snug line-clamp-1">
                        {dest.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{dest.location}</span>
                      </p>

                      <div className="text-[11px] font-bold text-sky-700">
                        Tarif Dasar: Rp {dest.unitPrice.toLocaleString('id-ID')} / orang
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                Total Terpilih: <strong className="text-[#19324d] text-sm">{selectedDests.length}</strong> dari {AVAILABLE_DESTINATIONS.length} Destinasi
              </div>

              <button
                type="button"
                onClick={handleSaveDestinations}
                className="w-full sm:w-auto px-6 py-3 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan Destinasi Wisata</span>
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: TARIF & SUPPLY CONFIGURATION */}
        {activeTab === 'pricing' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 max-w-2xl mx-auto shadow-sm">
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Pengaturan Tarif & Kapasitas Pemandu
              </h3>
              <p className="text-xs text-slate-500">
                Data ini digunakan oleh Smart Matching Engine ZHS untuk mempertemukan Anda dengan wisatawan yang relevan
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                  Tarif Harian Pemandu (Rp)
                </label>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#19324d]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                  Area Jangkauan Wilayah
                </label>
                <input
                  type="text"
                  value={coverageArea}
                  onChange={(e) => setCoverageArea(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#19324d]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                  Rasio Ideal Peserta Per Trip (Rekomendasi ZHS: 1:10)
                </label>
                <input
                  type="number"
                  value={maxPax}
                  onChange={(e) => setMaxPax(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#19324d]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Jika pemesanan melebihi 10 peserta, sistem secara otomatis merekomendasikan penambahan 1 co-guide.
                </p>
              </div>

              <button
                onClick={() => alert('Pengaturan tarif dan kapasitas berhasil disimpan ke database ZHS!')}
                className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                Simpan & Sinkronkan ke Smart Match
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: REVIEWS & REPUTATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#19324d]">
                Ulasan & Rating dari Wisatawan
              </h3>
              <p className="text-xs text-slate-500">
                Ulasan resmi setelah dana escrow berhasil dicairkan
              </p>
            </div>

            <div className="space-y-3">
              {completedTours.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-[#19324d]">{t.title}</strong>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{t.reviewRating || 5} / 5</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{t.reviewComment || 'Pemandu sangat ramah, wawasan sejarah cagar budaya sangat mendalam dan titik kumpul tepat waktu!'}"
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    Diselesaikan pada: {t.completedAt || '28 September 2026'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* QR CHECK-IN VALIDATION MODAL */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#19324d] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-sky-600" />
                <span>Validator E-Tiket QR Wisatawan</span>
              </h3>
              <button
                onClick={() => { setQrModalOpen(false); setQrFeedback(null); }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pindai atau masukkan kode E-Tiket wisatawan untuk mengubah status tur menjadi <strong>In Tour (Sedang Berlangsung)</strong>.
            </p>

            <form onSubmit={handleValidateQr} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  KODE E-TIKET QR
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Contoh: ZHS-QR-BK99201"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase text-slate-800 focus:outline-none focus:border-[#19324d]"
                />
              </div>

              {qrFeedback && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  qrFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-red-50 text-red-800 border border-red-300'
                }`}>
                  {qrFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{qrFeedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                Validasi Tiket Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
