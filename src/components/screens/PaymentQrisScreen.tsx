import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, QrCode, ShieldCheck, Clock, Download, 
  CheckCircle2, CreditCard, AlertCircle 
} from 'lucide-react';

export const PaymentQrisScreen: React.FC = () => {
  const { activeBooking, processPaymentSuccess, setActiveScreen } = useAppStore();
  const [seconds, setSeconds] = useState(900); // 15:00

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')} : ${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('booking-confirm')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Pembayaran QRIS
          </h1>

          <div className="w-8" />
        </div>
        
        {/* TOTAL PEMBAYARAN & COUNTDOWN (exact as Figma Page 42 & 62) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 text-center space-y-3 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL PEMBAYARAN
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#19324d]">
            Rp {activeBooking.totalAmount.toLocaleString('id-ID')}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold">
            <Clock className="w-4 h-4 text-sky-600 animate-spin" />
            <span>SELESAIKAN DALAM <strong className="text-[#19324d] ml-1">{formatTimer(seconds)}</strong></span>
          </div>
        </div>

        {/* QR CODE BOX (exact as Figma Page 42 & 45) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm max-w-md mx-auto">
          <div className="relative p-6 bg-slate-50 border border-slate-200 rounded-3xl w-64 h-64 mx-auto flex flex-col items-center justify-center shadow-inner">
            <QrCode className="w-48 h-48 text-[#19324d]" />
            <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
              QRIS NASIONAL ID
            </span>
          </div>

          <span className="text-xs font-bold text-[#19324d] block">
            SCAN QRIS UNTUK MEMBAYAR
          </span>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan ke Galeri</span>
          </button>
        </div>

        {/* 3-STEP PANDUAN (exact as Figma Page 42 & 62) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3 text-xs shadow-sm">
          <h4 className="font-bold text-[#19324d] text-sm mb-1">
            Panduan Pembayaran:
          </h4>
          <ol className="space-y-2 text-slate-600 pl-4 list-decimal leading-relaxed">
            <li>Buka aplikasi e-wallet (GoPay, OVO, Dana) atau mobile banking pilihan Anda.</li>
            <li>Pilih fitur <strong>Scan / Bayar</strong> dan arahkan kamera ke kode QR di atas.</li>
            <li>Periksa nominal <strong>Rp {activeBooking.totalAmount.toLocaleString('id-ID')}</strong>, masukkan PIN dan selesaikan transaksi.</li>
          </ol>
        </div>

        {/* DANA AMAN TERJAGA & LEGALITAS (exact as Figma Page 42) */}
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
          <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block">Dana Anda aman bersama kami (Sistem Escrow)</strong>
            <p className="text-[11px] text-sky-800 leading-snug">
              Pembayaran akan diteruskan ke penyedia jasa (pemandu) setelah Anda mengonfirmasi kedatangan dan tur berhasil terlaksana.
            </p>
            <span className="text-[10px] text-slate-400 block pt-1">
              Berlisensi & Diawasi Bank Indonesia • © 2024 Tourism Marketplace
            </span>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3.5 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={processPaymentSuccess}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>BAYAR SEKARANG →</span>
          </button>
        </div>
      </div>

    </div>
  );
};
