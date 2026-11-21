import React from 'react';
import { RefreshCw, ShieldCheck, MessageSquare, Wallet, ChevronRight } from 'lucide-react';
import type { DashboardStats } from '../../services/adminService';
import { BOOKING_STATUS, Card, ErrorBox, PageTitle, Spinner, rupiah } from './ui';

const StatCard: React.FC<{ label: string; value: string; sub?: string; tone?: string }> = ({ label, value, sub, tone = 'text-[#19324d]' }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className={`text-xl font-black mt-1 ${tone}`}>{value}</p>
    {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
  </div>
);

/** Grafik batang jumlah pemesanan 14 hari terakhir (SVG murni, tanpa pustaka). */
export const BookingsChart: React.FC<{ daily: DashboardStats['daily'] }> = ({ daily }) => {
  const max = Math.max(1, ...daily.map((d) => d.bookings));
  const W = 560, H = 150, pad = 20, bw = (W - pad * 2) / Math.max(daily.length, 1);
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full h-auto" role="img" aria-label="Pemesanan 14 hari terakhir">
      {[0, 0.5, 1].map((p) => (
        <line key={p} x1={pad} x2={W - pad} y1={H - p * (H - 10)} y2={H - p * (H - 10)} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      {daily.map((d, i) => {
        const h = (d.bookings / max) * (H - 24);
        const x = pad + i * bw + bw * 0.15;
        return (
          <g key={d.date}>
            <rect x={x} y={H - h} width={bw * 0.7} height={Math.max(h, d.bookings ? 2 : 0)} rx="3" fill="#19324d">
              <title>{`${d.date}: ${d.bookings} pemesanan, ${rupiah(d.amount)}`}</title>
            </rect>
            {d.bookings > 0 && <text x={x + bw * 0.35} y={H - h - 4} textAnchor="middle" fontSize="9" fill="#475569">{d.bookings}</text>}
            {i % 2 === 0 && (
              <text x={x + bw * 0.35} y={H + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">{d.date.slice(8)}/{d.date.slice(5, 7)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const DashboardTab: React.FC<{
  stats: DashboardStats | null; loading: boolean; error: string; reload: () => void; goto: (tab: string) => void;
}> = ({ stats, loading, error, reload, goto }) => {
  const todo = stats ? [
    { tab: 'verifikasi', icon: <ShieldCheck className="w-5 h-5" />, n: stats.guides_pending, text: 'pemandu menunggu verifikasi' },
    { tab: 'bantuan', icon: <MessageSquare className="w-5 h-5" />, n: stats.open_tickets, text: 'tiket bantuan perlu dibalas' },
    { tab: 'penarikan', icon: <Wallet className="w-5 h-5" />, n: stats.pending_withdrawals, text: `permintaan penarikan (${rupiah(stats.pending_withdrawals_amount)})` }
  ] : [];
  const statusEntries = stats ? Object.entries(stats.by_status).sort((a, b) => b[1] - a[1]) : [];
  const statusMax = Math.max(1, ...statusEntries.map(([, n]) => n));

  return (
    <div className="space-y-5">
      <PageTitle
        title="Ringkasan"
        subtitle="Kondisi platform saat ini"
        right={
          <button onClick={reload} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Muat ulang">
            <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />
      <ErrorBox message={error} />
      {!stats ? (loading ? <Spinner /> : null) : (
        <>
          <Card title="Perlu tindakan">
            <div className="grid sm:grid-cols-3 gap-3">
              {todo.map((t) => (
                <button
                  key={t.tab}
                  onClick={() => goto(t.tab)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-colors ${
                    t.n > 0 ? 'bg-amber-50 border-amber-300 hover:border-amber-500' : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <span className={t.n > 0 ? 'text-amber-600' : 'text-slate-400'}>{t.icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-lg font-black text-[#19324d] leading-none">{t.n}</span>
                    <span className="block text-[11px] text-slate-600 mt-1">{t.text}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Transaksi bulan ini" value={rupiah(stats.gmv_month)} sub={`${stats.bookings_month} pemesanan`} />
            <StatCard label="Pendapatan platform" value={rupiah(stats.fee_earned)} sub="dari tur yang selesai" tone="text-emerald-700" />
            <StatCard label="Dana di escrow" value={rupiah(stats.escrow_held)} sub="belum dicairkan ke pemandu" tone="text-sky-700" />
            <StatCard label="Total transaksi" value={rupiah(stats.gmv_total)} sub={`${stats.bookings_total} pemesanan`} />
            <StatCard label="Wisatawan" value={String(stats.tourists)} />
            <StatCard label="Pemandu terverifikasi" value={String(stats.guides_approved)} sub={`${stats.guides_active} aktif menerima booking`} />
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <Card title="Pemesanan 14 hari terakhir" className="lg:col-span-3">
              <BookingsChart daily={stats.daily} />
            </Card>
            <Card title="Status pemesanan" className="lg:col-span-2">
              {statusEntries.length === 0 ? (
                <p className="text-xs text-slate-500">Belum ada pemesanan.</p>
              ) : (
                <div className="space-y-2.5">
                  {statusEntries.map(([status, n]) => (
                    <div key={status}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-700">{BOOKING_STATUS[status]?.label ?? status}</span>
                        <span className="font-bold text-[#19324d]">{n}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-[#19324d] rounded-full" style={{ width: `${(n / statusMax) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
