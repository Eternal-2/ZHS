import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, CheckCircle2, Tag, Compass, MessageSquare, CreditCard, ChevronRight } from 'lucide-react';

export const NotificationsScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Notifikasi
          </h1>

          <div className="w-8" />
        </div>
        
        {/* TODAY (exact as Figma Page 12) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            TODAY
          </span>

          {/* Booking Confirmed */}
          <div 
            onClick={() => setActiveScreen('booking-detail')}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#19324d] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Booking Confirmed</h4>
                <span className="text-[10px] text-slate-400">2h ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Your trip to Curug Cipurut is confirmed. Enjoy your journey!
              </p>
            </div>
          </div>

          {/* Special Promo */}
          <div 
            onClick={() => setActiveScreen('voucher')}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#19324d] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Special Promo</h4>
                <span className="text-[10px] text-slate-400">4h ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                50% discount for Situ Buleud tickets this weekend. Limited offer!
              </p>
            </div>
          </div>
        </div>

        {/* YESTERDAY (exact as Figma Page 12) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            YESTERDAY
          </span>

          <div 
            onClick={() => setActiveScreen('detail-destinasi')}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#19324d] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Recommended Destination</h4>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Discover new places to visit in Purwakarta this month.
              </p>
            </div>
          </div>
        </div>

        {/* EARLIER (exact as Figma Page 12) */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            EARLIER
          </span>

          <div 
            onClick={() => setActiveScreen('review')}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#19324d] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Review Request</h4>
                <span className="text-[10px] text-slate-400">2 days ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                How was your visit to Cihampelas? Tell others about it!
              </p>
            </div>
          </div>

          <div 
            onClick={() => setActiveScreen('payment-success')}
            className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3.5 shadow-sm hover:border-[#19324d] cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs sm:text-sm text-[#19324d]">Payment Successful</h4>
                <span className="text-[10px] text-slate-400">5 days ago</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Payment for ID-992384 has been processed successfully.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
