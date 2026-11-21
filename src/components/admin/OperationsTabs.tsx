import React, { useState } from 'react';
import { Copy, RefreshCw, Search } from 'lucide-react';
import {
  fetchBookings, fetchGuides, fetchUsers, fetchWithdrawals, processWithdrawal, setGuideActive, setUserRole
} from '../../services/adminService';
import type { AdminWithdrawal } from '../../services/adminService';
import {
  BOOKING_STATUS, Btn, Card, Empty, ErrorBox, FilterTabs, PageTitle, Pill, Spinner, dateId, dateTimeId,
  inputCls, rupiah, useDebounced, useLoad
} from './ui';

const RefreshBtn: React.FC<{ onClick: () => void; loading: boolean }> = ({ onClick, loading }) => (
  <button onClick={onClick} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Muat ulang">
    <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
  </button>
);

const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 min-w-[200px]">
    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} />
  </div>
);

// ===================== Pemesanan =====================
export const BookingsTab: React.FC = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, loading, error, reload } = useLoad(() => fetchBookings(status, q), [status, q]);

  return (
    <div className="space-y-4">
      <PageTitle title="Pemesanan" subtitle="Seluruh booking di platform (200 terbaru sesuai filter)" right={<RefreshBtn onClick={reload} loading={loading} />} />
      <div className="flex gap-2 flex-wrap">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari kode, nama, email, atau destinasi…" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Semua status</option>
          {Object.entries(BOOKING_STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
        </select>
      </div>
      <ErrorBox message={error} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Tidak ada pemesanan yang cocok.</Empty> : (
        <div className="space-y-2.5">
          {(data ?? []).map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-[1.2fr_1fr_1fr_auto] gap-3 items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-[#19324d]">{b.code}</span>
                  <Pill cls={BOOKING_STATUS[b.status]?.cls}>{BOOKING_STATUS[b.status]?.label ?? b.status}</Pill>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate mt-1">{b.destination_title}</p>
                <p className="text-[11px] text-slate-500">Tur {dateId(b.tour_date)} · {b.participants} peserta</p>
              </div>
              <div className="text-xs min-w-0">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Wisatawan</p>
                <p className="font-semibold text-slate-800 truncate">{b.tourist_name}</p>
                <p className="text-slate-500 truncate">{b.tourist_email}</p>
              </div>
              <div className="text-xs min-w-0">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Pemandu</p>
                <p className="font-semibold text-slate-800 truncate">{b.guide_name}</p>
                <p className="text-slate-500">{b.payment_method ?? 'Belum ada pembayaran'}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm font-black text-[#19324d]">{rupiah(b.total_amount)}</p>
                <p className="text-[10px] text-slate-400">dibuat {dateTimeId(b.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== Pengguna =====================
const ROLE_CLS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800', pemandu: 'bg-indigo-100 text-indigo-800',
  wisatawan: 'bg-slate-100 text-slate-700', umkm: 'bg-amber-100 text-amber-800'
};

export const UsersTab: React.FC<{ selfId: string }> = ({ selfId }) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const q = useDebounced(search);
  const { data, loading, error, reload } = useLoad(() => fetchUsers(q, role), [q, role]);

  const change = async (id: string, name: string, to: 'wisatawan' | 'admin') => {
    const text = to === 'admin'
      ? `Jadikan ${name} sebagai ADMIN? Ia akan punya akses ke dokumen KTP pemandu dan data transaksi.`
      : `Cabut akses admin dari ${name}?`;
    if (!window.confirm(text)) return;
    setBusy(true); setActionError(''); setNotice('');
    try {
      await setUserRole(id, to);
      setNotice(to === 'admin' ? `${name} kini menjadi admin.` : `Akses admin ${name} dicabut.`);
      await reload();
    } catch (e: any) { setActionError(e?.message ?? 'Gagal mengubah role'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Pengguna" subtitle="Semua akun terdaftar. Pemandu dan UMKM diatur lewat verifikasi, bukan dari sini." right={<RefreshBtn onClick={reload} loading={loading} />} />
      <div className="flex gap-2 flex-wrap">
        <SearchBox value={search} onChange={setSearch} placeholder="Cari nama, email, atau telepon…" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Semua role</option>
          <option value="wisatawan">Wisatawan</option>
          <option value="pemandu">Pemandu</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {notice && <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl p-3">{notice}</div>}
      <ErrorBox message={error || actionError} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Tidak ada pengguna yang cocok.</Empty> : (
        <div className="space-y-2">
          {(data ?? []).map((u) => (
            <div key={u.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{u.full_name}</p>
                  <Pill cls={ROLE_CLS[u.role]}>{u.role}</Pill>
                  {u.id === selfId && <Pill cls="bg-sky-100 text-sky-800">Anda</Pill>}
                </div>
                <p className="text-xs text-slate-500 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                <p className="text-[11px] text-slate-400">Bergabung {dateId(u.created_at)} · {u.bookings_count} booking · {u.points.toLocaleString('id-ID')} poin</p>
              </div>
              <div className="shrink-0">
                {u.role === 'wisatawan' && <Btn tone="ghost" disabled={busy} onClick={() => void change(u.id, u.full_name, 'admin')}>Jadikan Admin</Btn>}
                {u.role === 'admin' && u.id !== selfId && <Btn tone="danger" disabled={busy} onClick={() => void change(u.id, u.full_name, 'wisatawan')}>Cabut Admin</Btn>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== Data pemandu =====================
const VERIF_CLS: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Terverifikasi', cls: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'Menunggu verifikasi', cls: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
  need_fix: { label: 'Perlu perbaikan', cls: 'bg-red-100 text-red-700' },
  draft: { label: 'Draf', cls: 'bg-slate-100 text-slate-600' }
};

export const GuidesTab: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useLoad(fetchGuides, []);

  const toggle = async (id: string, name: string, active: boolean) => {
    const text = active ? `Aktifkan kembali ${name}? Ia akan muncul lagi di katalog dan bisa dipesan.` : `Nonaktifkan ${name}? Ia tidak akan muncul di katalog dan tidak bisa dipesan (booking yang berjalan tidak terpengaruh).`;
    if (!window.confirm(text)) return;
    setBusy(true); setActionError('');
    try { await setGuideActive(id, active); await reload(); }
    catch (e: any) { setActionError(e?.message ?? 'Gagal mengubah status pemandu'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Data Pemandu" subtitle="Semua pemandu beserta performa dan saldo dompetnya" right={<RefreshBtn onClick={reload} loading={loading} />} />
      <ErrorBox message={error || actionError} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Belum ada pemandu.</Empty> : (
        <div className="space-y-2.5">
          {(data ?? []).map((g) => (
            <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-4 grid sm:grid-cols-[1.4fr_1fr_auto] gap-3 items-center">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{g.name}</p>
                  <Pill cls={VERIF_CLS[g.verification]?.cls}>{VERIF_CLS[g.verification]?.label ?? g.verification}</Pill>
                  {g.verification === 'approved' && <Pill cls={g.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}>{g.is_available ? 'Aktif' : 'Nonaktif'}</Pill>}
                </div>
                <p className="text-xs text-slate-500 truncate">{g.email}{g.phone ? ` · ${g.phone}` : ''}</p>
                <p className="text-[11px] text-slate-400">{g.base_location ?? 'Lokasi belum diisi'} · tarif {rupiah(g.price)}/hari</p>
              </div>
              <div className="text-xs">
                <p><strong>{g.completed}</strong> tur selesai · ⭐ {Number(g.rating).toFixed(1)} ({g.reviews} ulasan)</p>
                <p className="text-slate-500">Saldo dompet: <strong className="text-[#19324d]">{rupiah(g.balance)}</strong></p>
              </div>
              <div className="shrink-0">
                {g.verification === 'approved' && (
                  g.is_available
                    ? <Btn tone="danger" disabled={busy} onClick={() => void toggle(g.id, g.name, false)}>Nonaktifkan</Btn>
                    : <Btn tone="success" disabled={busy} onClick={() => void toggle(g.id, g.name, true)}>Aktifkan</Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===================== Penarikan dana =====================
const WD_STATUS: Record<string, { label: string; cls: string }> = {
  requested: { label: 'Menunggu', cls: 'bg-amber-100 text-amber-800' },
  processed: { label: 'Sudah ditransfer', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' }
};

const WithdrawalCard: React.FC<{ w: AdminWithdrawal; busy: boolean; onDone: (approve: boolean, note?: string) => void }> = ({ w, busy, onDone }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try { await navigator.clipboard.writeText(w.account_number); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* diabaikan */ }
  };
  const approve = () => {
    if (window.confirm(`Pastikan Anda SUDAH mentransfer ${rupiah(w.amount)} ke ${w.bank_name} ${w.account_number} a.n. ${w.account_holder}. Tandai sebagai sudah ditransfer?`)) onDone(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-800">{w.guide_name}</p>
            <Pill cls={WD_STATUS[w.status]?.cls}>{WD_STATUS[w.status]?.label ?? w.status}</Pill>
          </div>
          <p className="text-[11px] text-slate-400">Diajukan {dateTimeId(w.created_at)}{w.processed_at ? ` · diproses ${dateTimeId(w.processed_at)}` : ''}</p>
        </div>
        <p className="text-lg font-black text-[#19324d]">{rupiah(w.amount)}</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-bold text-slate-700">{w.bank_name} · a.n. {w.account_holder}</p>
          <p className="font-mono text-slate-600 tracking-wide">{w.account_number}</p>
        </div>
        <Btn tone="ghost" onClick={() => void copy()} className="inline-flex items-center gap-1.5">
          <Copy className="w-3.5 h-3.5" /> {copied ? 'Tersalin' : 'Salin no. rekening'}
        </Btn>
      </div>

      {w.admin_note && <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5">Catatan: {w.admin_note}</p>}

      {w.status === 'requested' && (rejecting ? (
        <div className="space-y-2">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Alasan penolakan (dikirim ke pemandu; dana dikembalikan ke dompetnya)" className={inputCls} />
          <div className="flex gap-2">
            <Btn tone="danger" disabled={busy || !reason.trim()} onClick={() => onDone(false, reason)}>Tolak & Kembalikan Dana</Btn>
            <Btn tone="ghost" onClick={() => { setRejecting(false); setReason(''); }}>Batal</Btn>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Btn tone="success" disabled={busy} onClick={approve}>Tandai Sudah Ditransfer</Btn>
          <Btn tone="danger" disabled={busy} onClick={() => setRejecting(true)}>Tolak</Btn>
        </div>
      ))}
    </div>
  );
};

export const WithdrawalsTab: React.FC<{ onChanged?: () => void }> = ({ onChanged }) => {
  const [filter, setFilter] = useState('requested');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const { data, loading, error, reload } = useLoad(() => fetchWithdrawals(filter), [filter]);

  const run = async (w: AdminWithdrawal, approve: boolean, note?: string) => {
    setBusy(true); setActionError(''); setNotice('');
    try {
      await processWithdrawal(w.id, approve, note);
      setNotice(approve ? `Penarikan ${rupiah(w.amount)} untuk ${w.guide_name} ditandai sudah ditransfer.` : `Penarikan ditolak; ${rupiah(w.amount)} dikembalikan ke dompet ${w.guide_name}.`);
      await reload();
      onChanged?.();
    } catch (e: any) { setActionError(e?.message ?? 'Gagal memproses'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <PageTitle title="Penarikan Dana" subtitle="Transfer dilakukan manual oleh admin, lalu tandai di sini" right={<RefreshBtn onClick={reload} loading={loading} />} />
      <FilterTabs value={filter} onChange={setFilter} options={[
        { id: 'requested', label: 'Menunggu' }, { id: 'processed', label: 'Sudah ditransfer' },
        { id: 'rejected', label: 'Ditolak' }, { id: '', label: 'Semua' }
      ]} />
      {notice && <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl p-3">{notice}</div>}
      <ErrorBox message={error || actionError} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Tidak ada permintaan penarikan pada kategori ini.</Empty> : (
        <div className="space-y-3">
          {(data ?? []).map((w) => <WithdrawalCard key={w.id} w={w} busy={busy} onDone={(a, n) => void run(w, a, n)} />)}
        </div>
      )}
      <Card><p className="text-[11px] text-slate-500">Nomor rekening saat ini tersimpan apa adanya di database. Untuk produksi, sebaiknya dienkripsi (Supabase Vault).</p></Card>
    </div>
  );
};
