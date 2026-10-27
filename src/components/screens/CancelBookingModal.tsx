import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AlertTriangle, X, ShieldCheck } from 'lucide-react';

export const CancelBookingModal: React.FC = () => {
  const { isCancelModalOpen, toggleCancelModal, cancelActiveBooking, activeBooking } = useAppStore();

  if (!isCancelModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={() => toggleCancelModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Alert Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-[#19324d]">
            Batalkan Pesanan?
          </h3>
          <p className="text-xs text-slate-500">
            Apakah Anda yakin ingin membatalkan pesanan ini? Pengembalian dana mengikuti kebijakan resmi ZHS.
          </p>
        </div>

        {/* KEBIJAKAN PENGEMBALIAN DANA TABEL (exact as Figma Page 71) */}
        <div className="space-y-2 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            KEBIJAKAN PENGEMBALIAN DANA:
          </span>

          {/* H-3 or more */}
          <div className="p-3 bg-sky-50 border border-sky-300 rounded-xl flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-bold">Saat Ini</span>
                <strong className="text-[#19324d]">H-3 atau lebih</strong>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">Pembatalan sebelum 21 Nov 2025</span>
            </div>
            <span className="text-sm font-extrabold text-emerald-600">100% Pengembalian</span>
          </div>

          {/* H-1 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-500">
            <div>
              <span className="font-semibold block">H-1</span>
              <span className="text-[10px]">22 – 23 Nov 2025</span>
            </div>
            <span className="font-bold text-amber-600">50% Pengembalian</span>
          </div>

          {/* H-0 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-500">
            <div>
              <span className="font-semibold block">H-0 (Hari tur)</span>
              <span className="text-[10px]">24 Nov 2025</span>
            </div>
            <span className="font-bold text-red-500">0% (Hangus)</span>
          </div>
        </div>

        {/* DANA KEMBALI */}
        <div className="p-3.5 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Dana kembali ke rekening asal:</span>
          <span className="text-base font-extrabold text-emerald-600">
            Rp {activeBooking.totalAmount.toLocaleString('id-ID')}
          </span>
        </div>

        {/* ACTIONS (exact as Figma Page 52 & 71) */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={cancelActiveBooking}
            className="w-full py-3 bg-[#19324d] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-colors"
          >
            Ya, Batalkan
          </button>
          <button
            type="button"
            onClick={() => toggleCancelModal(false)}
            className="w-full py-2.5 text-slate-600 font-semibold text-xs hover:underline"
          >
            Tetap Simpan
          </button>
        </div>

      </div>
    </div>
  );
};
