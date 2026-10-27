import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Clock, CheckCircle2, XCircle, AlertCircle, Upload,
  ArrowLeft, RefreshCw, FileText, Camera, Image, ShieldCheck, User
} from 'lucide-react';

type DocStatus = 'approved' | 'rejected' | 'pending';

interface DocItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  status: DocStatus;
  reason?: string;
}

// ============================================================
// PENDING REVIEW SCREEN
// ============================================================
export const GuidePendingReviewScreen: React.FC = () => {
  const { setActiveScreen } = useAppStore();
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-4 py-12 text-slate-800">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-6">
        {/* Animated Icon */}
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
          {[
            { label: 'Data Diri', status: 'pending' },
            { label: 'Data Profesional', status: 'pending' },
            { label: 'CV & Sertifikat', status: 'pending' },
            { label: 'Foto KTP (Terenkripsi)', status: 'pending' },
            { label: 'Foto Portofolio Tur', status: 'pending' },
            { label: 'Verifikasi Wajah', status: 'pending' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-slate-600">{item.label}</span>
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Menunggu
              </span>
            </div>
          ))}
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-800 text-left space-y-1">
          <p className="font-bold">ℹ️ Informasi Penting:</p>
          <ul className="space-y-1">
            <li>• Estimasi waktu tinjauan: <strong>1-2 hari kerja</strong></li>
            <li>• Anda akan menerima notifikasi push setelah keputusan ditetapkan</li>
            <li>• Anda belum dapat menerima booking hingga verifikasi disetujui</li>
          </ul>
        </div>

        <button
          onClick={() => setActiveScreen('guide-verification-status')}
          className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all"
        >
          Cek Status Verifikasi
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
  // Simulate rejected scenario (some docs rejected)
  const [scenario] = useState<'pending' | 'approved' | 'rejected'>('rejected');

  const docs: DocItem[] = [
    { key: 'cv', label: 'CV / Daftar Riwayat Hidup', icon: <FileText className="w-4 h-4" />, status: 'approved' },
    { key: 'cert', label: 'Sertifikat Kompetensi', icon: <ShieldCheck className="w-4 h-4" />, status: 'rejected', reason: 'Sertifikat telah kedaluwarsa. Harap unggah sertifikat yang masih berlaku.' },
    { key: 'ktp', label: 'Foto KTP', icon: <Camera className="w-4 h-4" />, status: 'approved' },
    { key: 'portfolio', label: 'Foto Portofolio Tur', icon: <Image className="w-4 h-4" />, status: 'rejected', reason: 'Foto terlalu gelap dan resolusi rendah. Upload minimal 3 foto berkualitas tinggi.' },
    { key: 'face', label: 'Verifikasi Wajah', icon: <User className="w-4 h-4" />, status: 'approved' },
  ];

  const rejectedDocs = docs.filter(d => d.status === 'rejected');

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
      case 'pending': return (
        <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
          <Clock className="w-4 h-4" /> Menunggu
        </span>
      );
    }
  };

  if (scenario === 'rejected') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
        <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveScreen('guide-pending-review')} className="p-2 rounded-xl hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-[#19324d]">Status Verifikasi</h1>
              <p className="text-xs text-slate-500">Detail tinjauan dokumen Anda</p>
            </div>
          </div>

          {/* Overall status */}
          <div className="bg-red-50 border border-red-300 rounded-3xl p-5 text-center space-y-2">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-black text-red-700">Pengajuan Verifikasi Ditolak</h2>
            <p className="text-xs text-red-600">
              {rejectedDocs.length} dokumen perlu diperbaiki sebelum Anda dapat mengajukan ulang.
            </p>
          </div>

          {/* Doc status list */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Status per Dokumen</h3>
            {docs.map(doc => (
              <div key={doc.key} className={`p-3.5 rounded-2xl border transition-all ${
                doc.status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
                doc.status === 'rejected' ? 'bg-red-50 border-red-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                    {doc.icon}
                    <span>{doc.label}</span>
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

          <button
            onClick={() => setActiveScreen('guide-fix-documents')}
            className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Perbaiki Dokumen Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (scenario === 'approved') {
    return <GuideVerificationApprovedScreen />;
  }

  // Pending state
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
        <Clock className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-black text-[#19324d]">Sedang Ditinjau</h2>
        <p className="text-sm text-slate-500">Admin sedang meninjau dokumen Anda. Harap tunggu 1-2 hari kerja.</p>
      </div>
    </div>
  );
};

// ============================================================
// VERIFICATION APPROVED SCREEN
// ============================================================
export const GuideVerificationApprovedScreen: React.FC = () => {
  const { setActiveScreen, login } = useAppStore();
  const [redirecting, setRedirecting] = useState(false);

  const handleGoToDashboard = () => {
    setRedirecting(true);
    setTimeout(() => {
      login('pemandu');
    }, 1500);
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
                <li>• Notifikasi push 'Profil Anda telah terverifikasi' terkirim</li>
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
  const { setActiveScreen } = useAppStore();
  const [submitted, setSubmitted] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const certRef = React.useRef<HTMLInputElement>(null);
  const portfolioRef = React.useRef<HTMLInputElement>(null);

  const rejectedDocs = [
    {
      key: 'cert',
      label: 'Sertifikat Kompetensi',
      reason: 'Sertifikat telah kedaluwarsa. Harap unggah sertifikat yang masih berlaku.',
      uploaded: !!certFile,
      onUpload: () => certRef.current?.click(),
      ref: certRef,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setCertFile(e.target.files[0]);
      }
    },
    {
      key: 'portfolio',
      label: 'Foto Portofolio Tur',
      reason: 'Foto terlalu gelap dan resolusi rendah. Upload minimal 3 foto berkualitas tinggi.',
      uploaded: portfolioFiles.length >= 3,
      onUpload: () => portfolioRef.current?.click(),
      ref: portfolioRef,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setPortfolioFiles(prev => [...prev, ...files]);
      }
    }
  ];

  const allUploaded = rejectedDocs.every(d => d.uploaded);

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-[#19324d]">Verifikasi Ulang Diajukan</h2>
          <p className="text-sm text-slate-500">Dokumen yang diperbaiki telah dikirim ke tim admin. Status kembali ke <strong>Pending Review</strong>.</p>
          <button
            onClick={() => setActiveScreen('guide-pending-review')}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-sm rounded-2xl"
          >
            Lihat Status Verifikasi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveScreen('guide-verification-status')} className="p-2 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#19324d]">Perbaiki Dokumen</h1>
            <p className="text-xs text-slate-500">Unggah ulang dokumen yang perlu diperbaiki</p>
          </div>
        </div>

        {/* Approved docs (read-only) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Dokumen yang Lolos ✓</h3>
          {['CV / Daftar Riwayat Hidup', 'Foto KTP', 'Verifikasi Wajah'].map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-700">{doc}</span>
              <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" /> Disetujui
              </span>
            </div>
          ))}
        </div>

        {/* Rejected docs to fix */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#19324d] uppercase tracking-wider">Dokumen yang Perlu Diperbaiki</h3>

          {rejectedDocs.map(doc => (
            <div key={doc.key} className="space-y-3">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">{doc.label}</span>
                  {doc.uploaded ? (
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
                  <span>{doc.reason}</span>
                </div>
              </div>

              <div
                onClick={doc.onUpload}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-all ${
                  doc.uploaded
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
                }`}
              >
                {doc.uploaded ? (
                  <span className="text-emerald-700 text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> File baru berhasil dipilih
                  </span>
                ) : (
                  <span className="text-slate-500 text-xs flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Klik untuk unggah dokumen baru
                  </span>
                )}
              </div>
              <input ref={doc.ref} type="file" accept=".pdf,.jpg,.jpeg,image/*" multiple className="hidden" onChange={doc.onChange} />
            </div>
          ))}
        </div>

        <button
          onClick={() => allUploaded && setSubmitted(true)}
          disabled={!allUploaded}
          className="w-full py-4 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Ajukan Verifikasi Ulang
        </button>

        {!allUploaded && (
          <p className="text-center text-xs text-slate-500">
            Unggah semua dokumen yang perlu diperbaiki terlebih dahulu
          </p>
        )}
      </div>
    </div>
  );
};
