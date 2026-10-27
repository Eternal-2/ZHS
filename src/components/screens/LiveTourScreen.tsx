import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, QrCode, Phone, AlertTriangle, ShieldCheck, 
  MapPin, Clock, MessageSquare, CheckCircle2, ChevronRight, Star 
} from 'lucide-react';

export const LiveTourScreen: React.FC = () => {
  const { activeBooking, setActiveScreen, currentUser, markTourCompleted, openDirectChat } = useAppStore();
  const [activeTab, setActiveTab] = useState<'ticket' | 'session'>('session');
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const isCompleted = activeBooking.status === 'completed';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('booking-detail')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Riwayat Booking</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            {activeTab === 'ticket' ? 'E-Tiket Digital' : (isCompleted ? 'Sesi Tur Selesai' : 'Live Tour Session')}
          </h1>

          <button
            onClick={() => setEmergencyOpen(!emergencyOpen)}
            className="px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Bantuan</span>
          </button>
        </div>
        
        {/* TAB TOGGLE: E-Tiket vs Live Session */}
        <div className="grid grid-cols-2 p-1 bg-slate-200 rounded-2xl max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('session')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'session' ? 'bg-[#19324d] text-white shadow' : 'text-slate-600'
            }`}
          >
            {isCompleted ? 'Status Tur (Selesai)' : 'Live Tour (Berjalan)'}
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ticket' ? 'bg-[#19324d] text-white shadow' : 'text-slate-600'
            }`}
          >
            E-Tiket QR
          </button>
        </div>

        {/* E-TIKET DIGITAL (exact as Figma Page 53) */}
        {activeTab === 'ticket' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm max-w-sm mx-auto">
            <div className="space-y-1">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-block ${
                isCompleted 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                {isCompleted ? '✓ Tiket Telah Digunakan & Tur Selesai' : 'Tiket Aktif dalam Escrow'}
              </span>
              <h2 className="text-xl font-extrabold text-[#19324d] pt-1">
                {activeBooking.title}
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                KODE QR CHECK-IN: {activeBooking.checkInQrCode || 'ZHS-QR-LIVE'}
              </p>
            </div>

            <div className="p-6 bg-[#19324d] rounded-3xl w-60 h-60 mx-auto flex items-center justify-center shadow-lg">
              <div className="bg-white p-3 rounded-2xl">
                <QrCode className="w-40 h-40 text-[#19324d]" />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              {isCompleted 
                ? 'Tur ini telah resmi diselesaikan. E-Tiket ini tersimpan sebagai bukti riwayat perjalanan sah.' 
                : 'Tunjukkan kode ini kepada pemandu di pintu masuk atau pindai di terminal mandiri.'}
            </p>

            <button
              onClick={() => setActiveTab('session')}
              className="w-full py-3 bg-[#19324d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md"
            >
              Lihat Progres Tur
            </button>
          </div>
        )}

        {/* LIVE TOUR SESSION (Ongoing vs Completed) */}
        {activeTab === 'session' && (
          <div className="space-y-5">
            
            {/* Status Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        TUR SELESAI • ESCROW RELEASED
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        ONGOING SESSION
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {isCompleted ? `Selesai: ${activeBooking.completedAt || 'Tuntas'}` : 'Estimasi Berakhir: 16:30 WIB'}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#19324d]">
                  {activeBooking.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeBooking.destination} • Didampingi Pemandu Resmi Bersertifikat BNSP
                </p>
              </div>

              {/* Completed Notice Banner */}
              {isCompleted && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tur Berhasil Dituntaskan</span>
                    </strong>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Escrow Sukses Dicairkan
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Dana sebesar <strong>Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong> telah berhasil dilepas dari penampungan aman (Escrow) ke Pemandu <strong>{activeBooking.guide?.name}</strong>.
                  </p>
                  {activeBooking.reviewRating && (
                    <div className="pt-2 mt-2 border-t border-emerald-200 text-xs flex items-center gap-2 text-emerald-900">
                      <span className="font-semibold">Ulasan Anda:</span>
                      <span className="font-bold text-amber-600">⭐ {activeBooking.reviewRating}/5</span>
                      <span className="text-slate-600 italic truncate">"{activeBooking.reviewComment}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Guide Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeBooking.guide?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Pemandu"
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#19324d]">
                      {activeBooking.guide?.name || 'Bambang Pamungkas'}
                    </h4>
                    <span className="text-[11px] text-slate-500">Pemandu BNSP • Terverifikasi Resmi</span>
                  </div>
                </div>

                <button
                  onClick={() => openDirectChat(activeBooking.id)}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[#19324d] flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                  title="Hubungi Pemandu Tur"
                >
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span className="hidden sm:inline">Chat Pemandu</span>
                </button>
              </div>
            </div>

            {/* ITINERARY TIMELINE */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">
                  Rencana & Progres Perjalanan
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isCompleted ? '4 dari 4 Checkpoint Selesai (100%)' : 'Checkpoint 2 dari 4'}
                </span>
              </div>

              <div className="space-y-4 pl-2 border-l-2 border-[#19324d]/30 ml-2 text-xs">
                {/* 1 */}
                <div className="relative pl-4">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] absolute -left-[24px] top-0.5">
                    ✓
                  </span>
                  <div className="flex justify-between items-center">
                    <strong className="text-[#19324d]">Meeting Point</strong>
                    <span className="text-slate-400 text-[11px]">09:00 AM</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">{activeBooking.meetingPoint || 'Plaza Air Mancur Gerbang Barat'}</span>
                </div>

                {/* 2 */}
                <div className="relative pl-4">
                  {isCompleted ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] absolute -left-[24px] top-0.5">
                      ✓
                    </span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] absolute -left-[24px] top-0.5 animate-pulse">
                      ▶
                    </span>
                  )}
                  <div className={`p-3 rounded-2xl space-y-1 ${isCompleted ? 'bg-slate-50 border border-slate-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex justify-between items-center">
                      <strong className={isCompleted ? 'text-slate-800' : 'text-blue-900'}>Eksplorasi Spot Utama & Cerita Sejarah</strong>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white'}`}>
                        {isCompleted ? 'SELESAI' : 'IN PROGRESS'}
                      </span>
                    </div>
                    <p className={`text-[11px] ${isCompleted ? 'text-slate-600' : 'text-blue-800'}`}>
                      Menelusuri sejarah konservasi budaya bersama pemandu lokal berlisensi.
                    </p>
                  </div>
                </div>

                {/* 3 */}
                <div className="relative pl-4">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] absolute -left-[24px] top-0.5 ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-300'
                  }`}>
                    {isCompleted ? '✓' : ''}
                  </span>
                  <div className="flex justify-between items-center">
                    <strong className={isCompleted ? 'text-[#19324d]' : 'text-slate-600'}>Traditional Lunch (Mitra UMKM Terpilih)</strong>
                    <span className="text-slate-400 text-[11px]">12:30 PM</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Warung Mitra Kuliner / Sate Maranggi</span>
                </div>

                {/* 4 */}
                <div className="relative pl-4">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] absolute -left-[24px] top-0.5 ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-300'
                  }`}>
                    {isCompleted ? '✓' : ''}
                  </span>
                  <div className="flex justify-between items-center">
                    <strong className={isCompleted ? 'text-[#19324d]' : 'text-slate-600'}>Tutup Tur & Penyerahan Feedback</strong>
                    <span className="text-slate-400 text-[11px]">16:30 PM</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">Pencairan Escrow ke Pemandu</span>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIONS */}
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('ticket')}
                className="w-full py-3.5 bg-[#19324d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md hover:bg-[#122438] transition-colors"
              >
                Lihat E-Tiket Digital (QR)
              </button>

              {isCompleted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveScreen('review')}
                    className="w-full py-3 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs uppercase tracking-wider rounded-full shadow-2xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{activeBooking.reviewRating ? 'Ubah / Lihat Ulasan' : 'Beri Ulasan Tur'}</span>
                  </button>
                  <button
                    onClick={() => setActiveScreen('booking-detail')}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-full shadow-2xs hover:bg-slate-50 transition-colors"
                  >
                    Kembali ke Riwayat Booking
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    markTourCompleted(activeBooking.id);
                    setActiveScreen('review');
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesaikan Tur & Beri Ulasan Sekarang</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* EMERGENCY PANEL MODAL (exact as Figma Page 68) */}
      {emergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Pusat Bantuan Darurat</span>
              </h3>
              <button onClick={() => setEmergencyOpen(false)} className="text-slate-400">✕</button>
            </div>

            <p className="text-xs text-slate-600">
              Tim darurat dan customer support ZHS siaga mendampingi Anda 24/7 selama kegiatan wisata.
            </p>

            <div className="space-y-2 text-xs">
              <a
                href="tel:081234567890"
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 block"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <strong>Hubungi Admin ZHS (24 Jam)</strong>
                </div>
                <span>+62 812-3456-7890</span>
              </a>

              <a
                href="tel:081122223333"
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-100 block"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  <div>
                    <strong>Kontak Darurat Tersimpan</strong>
                    <span className="text-[10px] text-slate-400 block">{currentUser?.emergencyContact?.name}</span>
                  </div>
                </div>
                <span>{currentUser?.emergencyContact?.phone}</span>
              </a>
            </div>

            <button
              onClick={() => setEmergencyOpen(false)}
              className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
