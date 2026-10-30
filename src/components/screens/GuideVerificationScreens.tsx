import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ScreenType } from '../../store/useAppStore';
import {
  Clock, CheckCircle2, XCircle, AlertCircle, Upload,
  ArrowLeft, RefreshCw, FileText, Camera, Image, ShieldCheck, User
} from 'lucide-react';
import {
  DOC_LABEL, fetchMyApplication, summarizeDocs, uploadDocuments, submitApplication
} from '../../services/guideApplicationService';
import type { DocStatus, DocType, GuideApplication } from '../../services/guideApplicationService';

const DOC_ICON: Record<DocType, React.ReactNode> = {
  cv: <FileText className="w-4 h-4" />,
  certificate: <ShieldCheck className="w-4 h-4" />,
  ktp: <Camera className="w-4 h-4" />,
  portfolio: <Image className="w-4 h-4" />,
  selfie: <User className="w-4 h-4" />
};

/** Memuat status pengajuan pemandu dari database. */
const useApplication = () => {
  const [app, setApp] = useState<GuideApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const a = await fetchMyApplication();
      setApp(a);
      return a;
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat status verifikasi');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { app, loading, error, load };
};

const routeFor = (a: GuideApplication | null): ScreenType =>
  a?.verification === 'approved' ? 'guide-verification-approved'
  : a?.verification === 'rejected' ? 'guide-verification-status'
  : 'guide-pending-review';

const FullPageMessage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
    <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
      {children}
    </div>
  </div>
);

const NotApplied: React.FC = () => {
  const { setActiveScreen } = useAppStore();
  return (
    <FullPageMessage>
      <h2 className="text-xl font-black text-[#19324d]">Belum Ada Pengajuan</h2>
      <p className="text-sm text-slate-500">Anda belum mengajukan diri sebagai pemandu.</p>
      <button
        onClick={() => setActiveScreen('guide-register')}
        className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-sm rounded-2xl"
      >
        Daftar Sebagai Pemandu
      </button>
    </FullPageMessage>
  );
};

const LoadingView: React.FC<{ error?: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <FullPageMessage>
    {error ? (
      <>
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm text-red-600">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-[#19324d] text-white text-xs font-bold rounded-xl">
            Coba Lagi
          </button>
        )}
      </>
    ) : (
      <>
        <div className="w-10 h-10 border-4 border-[#19324d] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Memuat status verifikasi…</p>
      </>
    )}
  </FullPageMessage>
);

const statusBadge = (status: DocStatus) => {
  switch (status) {
    case 'approved': return (
      <span className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
        <CheckCircle2 className="w-4 h-4" /> Lolos
      </span>
    );
    case 'rejected': return (
      <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
        <XCircle className="w-4 h-4" /> Ditolak
      </span>
    );
    default: return (
      <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
        <Clock className="w-4 h-4" /> Menunggu
      </span>
    );
  }
};

// ============================================================
// PENDING REVIEW SCREEN
// ============================================================
export const GuidePendingReviewScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();
  const { app, loading, error, load } = useApplication();
  const [stillPending, setStillPending] = useState(false);

  // Jika admin sudah memutuskan, langsung arahkan ke layar yang sesuai
  useEffect(() => {
    if (app && app.verification !== 'pending') setActiveScreen(routeFor(app));
  }, [app, setActiveScreen]);

  if (loading && !app) return <LoadingView error={error} onRetry={() => void load()} />;
  if (!app) return <NotApplied />;

  const handleCheck = async () => {
    setStillPending(false);
    const fresh = await load();
    if (fresh && fresh.verification !== 'pending') setActiveScreen(routeFor(fresh));
    else setStillPending(true);
  };

  const items = summarizeDocs(app.docs);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-12 text-slate-800">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
          <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Pending Review
          </div>
          <h1 className="text-2xl font-black text-[#19324d]">Profil Sedang Ditinjau</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Seluruh dokumen Anda telah dikirim ke tim admin ZHS. Tim kami akan meninjau dan memverifikasi kelayakan Anda.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3 text-xs">
          <p className="font-bold text-slate-700 uppercase tracking-wider">Status Pengajuan</p>
          {items.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <span className="text-slate-600">{DOC_LABEL[item.type]}{item.count > 1 ? ` (${item.count} file)` : ''}</span>
              {statusBadge(item.status)}
            </div>
          ))}
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-800 text-left space-y-1">
          <p className="font-bold">ℹ️ Informasi Penting:</p>
          <ul className="space-y-1">
            <li>• Estimasi waktu tinjauan: <strong>1-2 hari kerja</strong></li>
            <li>• Buka halaman ini lagi untuk melihat keputusan admin</li>
            <li>• Anda belum dapat menerima booking hingga verifikasi disetujui</li>
          </ul>
        </div>

        {stillPending && (
          <p className="text-xs text-amber-700 font-semibold">Belum ada keputusan dari admin. Status masih menunggu.</p>
        )}

        <button
          onClick={() => void handleCheck()}
          disabled={loading}
          className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all"
        >
          {loading ? 'Memeriksa…' : 'Cek Status Verifikasi'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// VERIFICATION STATUS SCREEN
// ============================================================
export const GuideVerificationStatusScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();
  const { app, loading, error, load } = useApplication();

  if (loading && !app) return <LoadingView error={error} onRetry={() => void load()} />;
  if (!app) return <NotApplied />;
  if (app.verification === 'approved') return <GuideVerificationApprovedScreen />;

  const docs = summarizeDocs(app.docs);
  const rejectedCount = docs.filter((d) => d.status === 'rejected').length;
  const isRejected = app.verification === 'rejected';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-pending-review')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Status Verifikasi</h1>
            <p className="text-xs text-slate-500">Detail tinjauan dokumen Anda</p>
          </div>
        </div>

        {isRejected ? (
          <div className="bg-red-50 border border-red-300 rounded-3xl p-5 text-center space-y-2">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-black text-red-700">Pengajuan Verifikasi Ditolak</h2>
            <p className="text-xs text-red-600">
              {rejectedCount > 0
                ? `${rejectedCount} dokumen perlu diperbaiki sebelum Anda dapat mengajukan ulang.`
                : app.note ?? 'Lengkapi dokumen Anda lalu ajukan ulang.'}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 text-center space-y-2">
            <Clock className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
            <h2 className="text-lg font-black text-amber-800">Sedang Ditinjau</h2>
            <p className="text-xs text-amber-700">Admin sedang meninjau dokumen Anda. Harap tunggu 1-2 hari kerja.</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Status per Dokumen</h3>
          {docs.map((doc) => (
            <div
              key={doc.type}
              className={`p-3.5 rounded-2xl border transition-all ${
                doc.status === 'approved' ? 'bg-emerald-50 border-emerald-200'
                : doc.status === 'rejected' ? 'bg-red-50 border-red-200'
                : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                  {DOC_ICON[doc.type]}
                  <span>{DOC_LABEL[doc.type]}</span>
                </div>
                {statusBadge(doc.status)}
              </div>
              {doc.reason && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-red-700 bg-red-100 rounded-xl p-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{doc.reason}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {isRejected && (
          <button
            onClick={() => setActiveScreen('guide-fix-documents')}
            className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Perbaiki Dokumen Sekarang
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================
// VERIFICATION APPROVED SCREEN
// ============================================================
export const GuideVerificationApprovedScreen: React.FC = () => {
  const { hydrateUser } = useAppStore();
  const [redirecting, setRedirecting] = useState(false);

  const handleGoToDashboard = () => {
    setRedirecting(true);
    // role 'pemandu' sudah diberikan server saat admin menyetujui; hydrateUser memuat ulang profil
    void hydrateUser({ navigate: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
        {redirecting ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 border-4 border-[#19324d] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#19324d]">Membuka Dashboard Pemandu...</p>
          </div>
        ) : (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </div>
              <h1 className="text-2xl font-black text-[#19324d]">Verifikasi Berhasil! 🎉</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Selamat! Profil Anda telah disetujui oleh tim admin ZHS. Akun Anda kini aktif dan siap menerima booking.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 text-left space-y-2">
              <p className="font-bold">✅ Yang sudah tersedia:</p>
              <ul className="space-y-1">
                <li>• Profil Anda tampil di sistem Smart Match</li>
                <li>• Anda dapat menerima permintaan booking baru</li>
                <li>• Akses penuh ke Dashboard Pemandu ZHS</li>
              </ul>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all"
            >
              Buka Dashboard Pemandu
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================
// FIX DOCUMENTS SCREEN
// ============================================================
export const GuideFixDocumentsScreen: React.FC = () => {
  const { setActiveScreen, currentUser } = useAppStore();
  const { app, loading, error, load } = useApplication();
  const [files, setFiles] = useState<Partial<Record<DocType, File[]>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputs = useRef<Partial<Record<DocType, HTMLInputElement | null>>>({});

  if (loading && !app) return <LoadingView error={error} onRetry={() => void load()} />;
  if (!app) return <NotApplied />;

  const summary = summarizeDocs(app.docs);
  const rejected = summary.filter((d) => d.status === 'rejected');
  const approved = summary.filter((d) => d.status === 'approved');
  const allUploaded = rejected.length > 0 && rejected.every((d) => (files[d.type]?.length ?? 0) >= 1);

  const onPick = (type: DocType, list: FileList | null) => {
    const picked = Array.from(list ?? []);
    if (picked.length === 0) return;
    setFiles((prev) => ({ ...prev, [type]: type === 'portfolio' ? [...(prev[type] ?? []), ...picked] : [picked[0]] }));
  };

  const handleSubmit = async () => {
    if (!currentUser || !allUploaded) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const items = rejected.flatMap((d) => (files[d.type] ?? []).map((file) => ({ type: d.type, file })));
      const docs = await uploadDocuments(currentUser.id, items);
      await submitApplication({ docs });
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Gagal mengajukan ulang. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <FullPageMessage>
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
          <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-[#19324d]">Verifikasi Ulang Diajukan</h2>
        <p className="text-sm text-slate-500">
          Dokumen yang diperbaiki telah dikirim ke tim admin. Status kembali ke <strong>Pending Review</strong>.
        </p>
        <button
          onClick={() => setActiveScreen('guide-pending-review')}
          className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-sm rounded-2xl"
        >
          Lihat Status Verifikasi
        </button>
      </FullPageMessage>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-verification-status')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Perbaiki Dokumen</h1>
            <p className="text-xs text-slate-500">Unggah ulang dokumen yang perlu diperbaiki</p>
          </div>
        </div>

        {approved.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Dokumen yang Lolos ✓</h3>
            {approved.map((d) => (
              <div key={d.type} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">{DOC_LABEL[d.type]}</span>
                <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Disetujui
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Dokumen yang Perlu Diperbaiki</h3>
          {rejected.length === 0 && <p className="text-xs text-slate-500">Tidak ada dokumen yang ditolak.</p>}

          {rejected.map((doc) => {
            const uploaded = (files[doc.type]?.length ?? 0) >= 1;
            const isPhoto = doc.type === 'ktp' || doc.type === 'selfie';
            return (
              <div key={doc.type} className="space-y-3">
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{DOC_LABEL[doc.type]}</span>
                    {uploaded ? (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Diunggah
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Perlu diperbaiki
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-1.5 mt-2 text-xs text-red-700">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{doc.reason ?? 'Dokumen perlu diperbaiki.'}</span>
                  </div>
                </div>

                <div
                  onClick={() => inputs.current[doc.type]?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-all ${
                    uploaded ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
                  }`}
                >
                  {uploaded ? (
                    <span className="text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> {files[doc.type]!.length} file baru dipilih
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> {isPhoto ? 'Ambil / pilih foto baru' : 'Klik untuk unggah dokumen baru'}
                    </span>
                  )}
                </div>
                <input
                  ref={(el) => { inputs.current[doc.type] = el; }}
                  type="file"
                  accept={isPhoto || doc.type === 'portfolio' ? 'image/*' : '.pdf,.jpg,.jpeg,.png,image/*'}
                  capture={doc.type === 'selfie' ? 'user' : doc.type === 'ktp' ? 'environment' : undefined}
                  multiple={doc.type === 'portfolio'}
                  className="hidden"
                  onChange={(e) => { onPick(doc.type, e.target.files); e.target.value = ''; }}
                />
              </div>
            );
          })}
        </div>

        {submitError && (
          <p className="text-xs text-red-600 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
          </p>
        )}

        <button
          onClick={() => void handleSubmit()}
          disabled={!allUploaded || submitting}
          className="w-full py-4 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
          {submitting ? 'Mengirim…' : 'Ajukan Verifikasi Ulang'}
        </button>

        {!allUploaded && rejected.length > 0 && (
          <p className="text-center text-xs text-slate-500">Unggah semua dokumen yang perlu diperbaiki terlebih dahulu</p>
        )}
      </div>
    </div>
  );
};
