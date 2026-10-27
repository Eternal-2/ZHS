import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Ticket, FileText } from 'lucide-react';

export const PaymentSuccessScreen: React.FC = () => {
  const { activeBooking, setActiveScreen } = useAppStore();
  const [downloadModal, setDownloadModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-6 sm:p-8 max-w-lg mx-auto">
      
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6">
        
        {/* BIG BLUE SUCCESS CHECKMARK (exact as Figma Page 46 & 63) */}
        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in-95">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL PEMBAYARAN
          </span>
          <div className="text-3xl font-black text-[#19324d]">
            Rp {activeBooking.totalAmount.toLocaleString('id-ID')}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#19324d] pt-2">
            PEMBAYARAN BERHASIL
          </h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Transaksi Anda telah berhasil diproses. Terima kasih telah memesan tiket di platform kami.
          </p>
        </div>

        {/* TRANSACTION METADATA & SUMMARY (exact as Figma Page 46) */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-sm text-left">
          <div className="flex justify-between text-slate-600">
            <span>Destinasi Wisata</span>
            <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{activeBooking.title}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Pemandu ({activeBooking.guidesCount || 1} Pemandu)</span>
            <span className="font-bold text-slate-900">{activeBooking.guide?.name || 'Pemandu Lokal'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Jumlah Peserta</span>
            <span className="font-bold text-slate-900">{activeBooking.participants} Orang</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Transportasi</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px]">{activeBooking.selectedTransport?.name || 'Mandiri'}</span>
          </div>
          {activeBooking.foodAddOns && activeBooking.foodAddOns.length > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Add-on Kuliner ({activeBooking.foodAddOns.length} Menu)</span>
              <span className="font-bold text-orange-600">
                {activeBooking.foodAddOns.map(f => f.name.split('(')[0].trim()).slice(0, 2).join(', ')}
                {activeBooking.foodAddOns.length > 2 ? ` +${activeBooking.foodAddOns.length - 2}` : ''}
              </span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600">
            <span>Metode Pembayaran</span>
            <span className="font-bold text-slate-800">QRIS Digital (Escrow Locked)</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>ID Booking</span>
            <span className="font-mono font-bold text-slate-800">{activeBooking.id}</span>
          </div>
          <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
            <span>Status Proteksi</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dana Aman Terjaga (Escrow)</span>
            </span>
          </div>
        </div>

        {/* BUTTON ACTIONS (exact as Figma Page 46 & 63) */}
        <div className="w-full space-y-3 pt-2">
          <button
            onClick={() => setActiveScreen('booking-detail')}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>Lihat Riwayat & E-Tiket Tur</span>
          </button>

          <button
            onClick={() => setDownloadModal(true)}
            className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Unduh Invoice (PDF)</span>
          </button>

          <button
            onClick={() => setActiveScreen('home')}
            className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-1"
          >
            Kembali ke Beranda
          </button>
        </div>

      </div>

      {/* DOWNLOAD INVOICE PROGRESS MODAL (exact as Figma Page 49 & 50) */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-[#19324d]">
                Invoice Berhasil Diunduh
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Invoice_BK-10245.pdf
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setDownloadModal(false);
                  setActiveScreen('live-tour');
                }}
                className="w-full py-2.5 bg-[#19324d] text-white font-bold text-xs rounded-xl shadow"
              >
                Lihat E-Tiket Tur
              </button>
              <button
                onClick={() => setDownloadModal(false)}
                className="w-full py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
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
