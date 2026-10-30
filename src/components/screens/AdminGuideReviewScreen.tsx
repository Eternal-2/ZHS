import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink, LogOut, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import {
  DOC_LABEL, fetchApplicationsForAdmin, finalizeGuide, reviewDocument, signedUrls
} from '../../services/guideApplicationService';
import type { AdminApplication, ApplicationDoc } from '../../services/guideApplicationService';

const isImage = (path: string) => /\.(jpe?g|png|webp)$/i.test(path);

const StatusPill: React.FC<{ status: ApplicationDoc['status'] }> = ({ status }) =>
  status === 'approved' ? (
    <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-4 h-4" /> Disetujui</span>
  ) : status === 'rejected' ? (
    <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><XCircle className="w-4 h-4" /> Ditolak</span>
  ) : (
    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold"><Clock className="w-4 h-4" /> Menunggu</span>
  );

/** Panel admin: meninjau dokumen pengajuan pemandu. Akses sebenarnya dijaga di server (fungsi admin_* memeriksa role). */
export const AdminGuideReviewScreen: React.FC<{ adminName: string; onLogout: () => void }> = ({ adminName, onLogout }) => {
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setApps(await fetchApplicationsForAdmin());
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat pengajuan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (app: AdminApplication) => {
    if (open === app.id) { setOpen(null); return; }
    setOpen(app.id);
    try {
      const fresh = await signedUrls(app.docs.map((d) => d.storagePath));
      setUrls((prev) => ({ ...prev, ...fresh }));
    } catch (e: any) {
      setError(e?.message ?? 'Gagal membuat tautan dokumen');
    }
  };

  const run = async (action: () => Promise<unknown>, okMessage?: string) => {
    setBusy(true);
    setError('');
    try {
      await action();
      if (okMessage) setNotice(okMessage);
      await load();
    } catch (e: any) {
      setError(e?.message ?? 'Tindakan gagal');
    } finally {
      setBusy(false);
    }
  };

  const approveDoc = (doc: ApplicationDoc) => run(() => reviewDocument(doc.id, true));
  const rejectDoc = (doc: ApplicationDoc) =>
    run(async () => {
      await reviewDocument(doc.id, false, reason);
      setRejecting(null);
      setReason('');
    });
  const finalize = (app: AdminApplication) =>
    run(async () => {
      const result = await finalizeGuide(app.id);
      setNotice(
        result === 'approved'
          ? `${app.name} disetujui dan kini berstatus pemandu.`
          : `${app.name} dikembalikan untuk perbaikan dokumen.`
      );
    });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Panel Admin · Verifikasi Pemandu</h1>
            <p className="text-xs text-slate-500">{adminName} · {apps.length} pengajuan perlu perhatian</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void load()} disabled={loading} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Muat ulang">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onLogout} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Keluar">
              <LogOut className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {notice && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl p-3 flex items-start justify-between gap-2">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} className="font-bold">×</button>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded-2xl p-3 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {!loading && apps.length === 0 && !error && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-sm text-slate-500">
            Tidak ada pengajuan yang menunggu peninjauan.
          </div>
        )}

        {apps.map((app) => {
          const pendingCount = app.docs.filter((d) => d.status === 'pending').length;
          const expanded = open === app.id;
          return (
            <div key={app.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <button onClick={() => void toggle(app)} className="w-full p-5 flex items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-[#19324d]">{app.name}</p>
                  <p className="text-xs text-slate-500">
                    {app.phone} · {app.specialties.join(', ') || 'Spesialisasi belum diisi'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {app.docs.length} dokumen · {pendingCount} menunggu ·{' '}
                    {app.verification === 'rejected' ? 'sebelumnya ditolak' : 'baru'}
                  </p>
                </div>
                {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {expanded && (
                <div className="border-t border-slate-200 p-5 space-y-4 bg-slate-50/60">
                  <div className="text-xs text-slate-600 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                    <p><strong>Alamat:</strong> {app.address}</p>
                    <p><strong>Bahasa:</strong> {app.languages.join(', ') || '-'}</p>
                    <p><strong>Tarif/hari:</strong> Rp {app.pricePerDay.toLocaleString('id-ID')}</p>
                    <p><strong>Jam kerja:</strong> {app.workHours}</p>
                  </div>

                  {app.docs.map((doc) => {
                    const url = urls[doc.storagePath];
                    return (
                      <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-800">{DOC_LABEL[doc.type]}</span>
                          <StatusPill status={doc.status} />
                        </div>

                        {url && isImage(doc.storagePath) && (
                          <img src={url} alt={DOC_LABEL[doc.type]} className="max-h-64 rounded-xl border border-slate-200 object-contain bg-slate-100" />
                        )}
                        {url ? (
                          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-700 font-semibold underline">
                            <ExternalLink className="w-3.5 h-3.5" /> Buka file
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Memuat tautan…</span>
                        )}

                        {doc.status === 'rejected' && doc.adminNote && (
                          <p className="text-xs text-red-700 bg-red-50 rounded-xl p-2">Alasan: {doc.adminNote}</p>
                        )}

                        {rejecting === doc.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              rows={2}
                              placeholder="Tulis alasan penolakan (akan dilihat pemandu)"
                              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 outline-none focus:border-[#19324d]"
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={busy || !reason.trim()}
                                onClick={() => void rejectDoc(doc)}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl"
                              >
                                Kirim Penolakan
                              </button>
                              <button onClick={() => { setRejecting(null); setReason(''); }} className="px-3 py-2 text-xs text-slate-500 underline">
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              disabled={busy || doc.status === 'approved'}
                              onClick={() => void approveDoc(doc)}
                              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl"
                            >
                              Setujui
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => { setRejecting(doc.id); setReason(''); }}
                              className="px-3 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    disabled={busy || pendingCount > 0}
                    onClick={() => void finalize(app)}
                    className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl"
                  >
                    {pendingCount > 0 ? `Tinjau ${pendingCount} dokumen lagi` : 'Putuskan Verifikasi'}
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Jika semua dokumen disetujui, akun menjadi pemandu. Jika ada yang ditolak, pemandu diminta memperbaikinya.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
