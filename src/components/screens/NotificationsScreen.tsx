import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ScreenType } from '../../store/useAppStore';
import { ArrowLeft, CheckCircle2, Tag, Compass, MessageSquare, CreditCard, BellOff, CheckCheck } from 'lucide-react';
import { timeAgo } from '../../services/tourismService';
import type { AppNotification } from '../../services/tourismService';

// Layar yang boleh dituju dari notifikasi (nilai berasal dari database, jadi divalidasi)
const ALLOWED: ScreenType[] = [
  'booking-detail', 'live-tour', 'voucher', 'help-center', 'admin-chat', 'guide-dashboard', 'guide-verification-status', 'home'
];

const iconFor = (n: AppNotification) => {
  const t = n.title.toLowerCase();
  if (t.includes('pembayaran') || t.includes('refund')) return { icon: <CreditCard className="w-5 h-5" />, cls: 'bg-emerald-100 text-emerald-600' };
  if (t.includes('poin') || t.includes('voucher')) return { icon: <Tag className="w-5 h-5" />, cls: 'bg-amber-100 text-amber-600' };
  if (t.includes('balasan') || t.includes('bantuan')) return { icon: <MessageSquare className="w-5 h-5" />, cls: 'bg-sky-100 text-sky-600' };
  if (t.includes('tur')) return { icon: <Compass className="w-5 h-5" />, cls: 'bg-indigo-100 text-indigo-600' };
  return { icon: <CheckCircle2 className="w-5 h-5" />, cls: 'bg-orange-100 text-orange-600' };
};

const groupLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(today) - startOfDay(d)) / 86400000);
  return diffDays <= 0 ? 'HARI INI' : diffDays === 1 ? 'KEMARIN' : 'SEBELUMNYA';
};

export const NotificationsScreen: React.FC = () => {
  const {
    currentUser, notifications, userBookings, loadNotifications,
    markNotificationRead, markAllNotificationsRead, setActiveBookingById, setActiveScreen
  } = useAppStore();

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const home: ScreenType = currentUser?.role === 'pemandu' ? 'guide-dashboard' : 'home';
  const unread = notifications.filter((n) => !n.isRead).length;

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    notifications.forEach((n) => {
      const key = groupLabel(n.createdAt);
      map.set(key, [...(map.get(key) ?? []), n]);
    });
    return ['HARI INI', 'KEMARIN', 'SEBELUMNYA'].filter((k) => map.has(k)).map((k) => ({ label: k, items: map.get(k)! }));
  }, [notifications]);

  const open = (n: AppNotification) => {
    void markNotificationRead(n.id);
    const target = (n.linkScreen ?? '') as ScreenType;
    if (!ALLOWED.includes(target)) return;
    if (n.refId) {
      const booking = userBookings.find((b) => b.dbId === n.refId);
      if (booking) setActiveBookingById(booking.id);
    }
    setActiveScreen(target);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen(home)}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{home === 'home' ? 'Kembali ke Beranda' : 'Kembali ke Dashboard'}</span>
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#19324d]">Notifikasi</h1>
          <button
            onClick={() => void markAllNotificationsRead()}
            disabled={unread === 0}
            className="text-[11px] font-bold text-sky-600 disabled:text-slate-300 flex items-center gap-1"
            title="Tandai semua dibaca"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
            <BellOff className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-[#19324d]">Belum ada notifikasi</p>
            <p className="text-xs text-slate-500">Status booking, pembayaran, dan balasan bantuan akan muncul di sini.</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{g.label}</span>
              {g.items.map((n) => {
                const { icon, cls } = iconFor(n);
                return (
                  <div
                    key={n.id}
                    onClick={() => open(n)}
                    className={`p-4 border rounded-2xl flex items-start gap-3.5 shadow-sm cursor-pointer transition-colors hover:border-[#19324d] ${
                      n.isRead ? 'bg-white border-slate-200' : 'bg-sky-50/60 border-sky-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cls}`}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-[#19324d] truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{n.body}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
