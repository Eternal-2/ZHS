import React from 'react';
import { XCircle, Clock, RefreshCw, ListChecks, LifeBuoy } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

/** Ditampilkan saat booking kedaluwarsa atau dibatalkan sebelum pembayaran selesai. */
export const PaymentFailedScreen: React.FC = () => {
  const { activeBooking, openDestination, setActiveScreen } = useAppStore();
  const expired = activeBooking.status === 'expired';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-5">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center border-2 ${expired ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
          {expired ? <Clock className="w-10 h-10 text-amber-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-[#19324d]">{expired ? 'Waktu Pembayaran Habis' : 'Pembayaran Tidak Berhasil'}</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {expired
              ? 'Pesanan dibatalkan otomatis karena pembayaran tidak diterima tepat waktu. Tidak ada dana yang terpotong.'
              : 'Pesanan ini dibatalkan. Jika dana Anda sudah terpotong, refund akan diproses sesuai kebijakan ZHS.'}
          </p>
          {activeBooking.id && <p className="text-[11px] font-mono text-slate-400">Pesanan {activeBooking.id}</p>}
        </div>
        <div className="space-y-2.5">
          <button
            onClick={() => (activeBooking.destinationId ? openDestination(activeBooking.destinationId) : setActiveScreen('explore'))}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Pesan Lagi
          </button>
          <button
            onClick={() => setActiveScreen('booking-detail')}
            className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl flex items-center justify-center gap-2"
          >
            <ListChecks className="w-4 h-4" /> Lihat Pesanan Saya
          </button>
          <button onClick={() => setActiveScreen('help-center')} className="text-xs text-slate-500 underline inline-flex items-center gap-1">
            <LifeBuoy className="w-3.5 h-3.5" /> Butuh bantuan?
          </button>
        </div>
      </div>
    </div>
  );
};
