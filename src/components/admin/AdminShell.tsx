import React, { useEffect, useState } from 'react';
import {
  CalendarCheck, LayoutDashboard, LogOut, MapPin, MessageSquare, Settings, ShieldCheck, Ticket, UserCheck, Users, Wallet
} from 'lucide-react';
import { fetchDashboard } from '../../services/adminService';
import { AdminGuideReviewScreen } from '../screens/AdminGuideReviewScreen';
import { AdminSupportInbox } from '../screens/AdminSupportInbox';
import { DashboardTab } from './DashboardTab';
import { BookingsTab, GuidesTab, UsersTab, WithdrawalsTab } from './OperationsTabs';
import { DestinationsTab, VouchersTab } from './CatalogTabs';
import { SettingsTab } from './SettingsTab';
import { useLoad } from './ui';

export type AdminTab =
  | 'ringkasan' | 'pemesanan' | 'verifikasi' | 'pemandu' | 'pengguna' | 'penarikan'
  | 'destinasi' | 'voucher' | 'pengaturan' | 'bantuan';

const NAV: { id: AdminTab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: <LayoutDashboard className="w-4 h-4" />, group: 'Operasional' },
  { id: 'pemesanan', label: 'Pemesanan', icon: <CalendarCheck className="w-4 h-4" />, group: 'Operasional' },
  { id: 'penarikan', label: 'Penarikan Dana', icon: <Wallet className="w-4 h-4" />, group: 'Operasional' },
  { id: 'bantuan', label: 'Pusat Bantuan', icon: <MessageSquare className="w-4 h-4" />, group: 'Operasional' },
  { id: 'verifikasi', label: 'Verifikasi Pemandu', icon: <ShieldCheck className="w-4 h-4" />, group: 'Pengguna' },
  { id: 'pemandu', label: 'Data Pemandu', icon: <UserCheck className="w-4 h-4" />, group: 'Pengguna' },
  { id: 'pengguna', label: 'Pengguna', icon: <Users className="w-4 h-4" />, group: 'Pengguna' },
  { id: 'destinasi', label: 'Destinasi', icon: <MapPin className="w-4 h-4" />, group: 'Katalog' },
  { id: 'voucher', label: 'Voucher', icon: <Ticket className="w-4 h-4" />, group: 'Katalog' },
  { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-4 h-4" />, group: 'Katalog' }
];

/** Kerangka panel admin: menu samping (desktop) / menu geser (ponsel) + penanda jumlah yang perlu tindakan. */
export const AdminShell: React.FC<{ adminId: string; adminName: string; onLogout: () => void }> = ({ adminId, adminName, onLogout }) => {
  const [tab, setTab] = useState<AdminTab>('ringkasan');
  const stats = useLoad(fetchDashboard, []);

  // segarkan penanda berkala
  useEffect(() => {
    const t = setInterval(() => void stats.reload(), 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badge = (id: AdminTab): number => {
    const s = stats.data;
    if (!s) return 0;
    return id === 'verifikasi' ? s.guides_pending : id === 'bantuan' ? s.open_tickets : id === 'penarikan' ? s.pending_withdrawals : 0;
  };

  const go = (id: string) => setTab(id as AdminTab);
  const navButton = (item: (typeof NAV)[number], compact: boolean) => {
    const n = badge(item.id);
    return (
      <button
        key={item.id}
        onClick={() => setTab(item.id)}
        className={`flex items-center gap-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
          compact ? 'px-3 py-2 shrink-0' : 'w-full px-3.5 py-2.5'
        } ${tab === item.id ? 'bg-[#19324d] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        {n > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">{n > 99 ? '99+' : n}</span>}
      </button>
    );
  };
  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 lg:flex">
      {/* menu samping (desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 p-4 gap-4 overflow-y-auto">
        <div className="px-2 pt-1">
          <p className="text-base font-black text-[#19324d]">ZHS Admin</p>
          <p className="text-[11px] text-slate-500 truncate">{adminName}</p>
        </div>
        <nav className="flex-1 space-y-4">
          {groups.map((g) => (
            <div key={g} className="space-y-1">
              <p className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{g}</p>
              {NAV.filter((n) => n.group === g).map((n) => navButton(n, false))}
            </div>
          ))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </aside>

      {/* menu geser (ponsel) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="text-sm font-black text-[#19324d]">ZHS Admin</p>
          <button onClick={onLogout} className="text-[11px] text-slate-500 underline inline-flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Keluar</button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-3 py-2.5">{NAV.map((n) => navButton(n, true))}</div>
      </div>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-16">
          {tab === 'ringkasan' && <DashboardTab stats={stats.data} loading={stats.loading} error={stats.error} reload={() => void stats.reload()} goto={go} />}
          {tab === 'pemesanan' && <BookingsTab />}
          {tab === 'penarikan' && <WithdrawalsTab onChanged={() => void stats.reload()} />}
          {tab === 'bantuan' && <AdminSupportInbox adminId={adminId} />}
          {tab === 'verifikasi' && <AdminGuideReviewScreen onChanged={() => void stats.reload()} />}
          {tab === 'pemandu' && <GuidesTab />}
          {tab === 'pengguna' && <UsersTab selfId={adminId} />}
          {tab === 'destinasi' && <DestinationsTab />}
          {tab === 'voucher' && <VouchersTab />}
          {tab === 'pengaturan' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};
