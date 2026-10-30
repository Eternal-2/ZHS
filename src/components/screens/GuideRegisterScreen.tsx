import React, { useState, useRef, useEffect } from 'react';
import { useCamera } from '../../lib/useCamera';
import {
  dataUrlToBlob, fetchMyApplication, submitApplication, uploadDocuments
} from '../../services/guideApplicationService';
import type { UploadItem } from '../../services/guideApplicationService';
import { useAppStore } from '../../store/useAppStore';
import {
  ArrowLeft, ArrowRight, User, Mail, Phone, MapPin,
  Briefcase, Globe, DollarSign, Clock, FileText, Upload,
  Camera, ShieldCheck, CheckCircle2, AlertCircle,
  Eye, Scan, Lock, Image, X
} from 'lucide-react';

type Step = 1 | 2 | 3 | 4 | 5;

interface PersonalData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ProfessionalData {
  specialization: string;
  languages: string;
  pricePerDay: string;
  operationalHours: string;
  cancellationPolicy: string;
}

interface DocState {
  cv: File | null;
  cert: File | null;
  cvProgress: number;
  certProgress: number;
  ktpCaptured: boolean;
  portfolioFiles: File[];
  portfolioProgress: number;
}

export const GuideRegisterScreen: React.FC = () => {
  const { setActiveScreen, currentUser, setRedirectAfterLogin } = useAppStore();

  const [step, setStep] = useState<Step>(1);
  const [personal, setPersonal] = useState<PersonalData>({
    name: '', email: '', phone: '', address: ''
  });
  const [professional, setProfessional] = useState<ProfessionalData>({
    specialization: '', languages: '', pricePerDay: '', operationalHours: '', cancellationPolicy: ''
  });
  const [docs, setDocs] = useState<DocState>({
    cv: null, cert: null,
    cvProgress: 0, certProgress: 0,
    ktpCaptured: false,
    portfolioFiles: [], portfolioProgress: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showKtpCamera, setShowKtpCamera] = useState(false);
  const [ktpImage, setKtpImage] = useState<string | null>(null);
  const [ktpDraft, setKtpDraft] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const ktpCam = useCamera('environment'); // kamera belakang untuk dokumen
  const faceCam = useCamera('user');       // kamera depan untuk selfie
  const [ktpEncrypted, setKtpEncrypted] = useState(false);

  // Isi data diri dari akun yang sedang login
  useEffect(() => {
    if (!currentUser) return;
    setPersonal(prev => ({
      name: prev.name || currentUser.name || '',
      email: prev.email || currentUser.email || '',
      phone: prev.phone || currentUser.phone || '',
      address: prev.address || currentUser.address || ''
    }));
  }, [currentUser]);

  // Jika sudah pernah mengajukan, langsung ke layar status (bukan mengisi formulir lagi)
  useEffect(() => {
    if (!currentUser) { setCheckingExisting(false); return; }
    let cancelled = false;
    fetchMyApplication()
      .then((a) => {
        if (cancelled) return;
        if (a?.verification === 'approved') setActiveScreen('guide-verification-approved');
        else if (a?.verification === 'rejected') setActiveScreen('guide-verification-status');
        else if (a?.verification === 'pending') setActiveScreen('guide-pending-review');
        else setCheckingExisting(false);
      })
      .catch(() => { if (!cancelled) setCheckingExisting(false); });
    return () => { cancelled = true; };
  }, [currentUser, setActiveScreen]);

  // Kamera KTP menyala saat modal dibuka, mati saat ditutup
  useEffect(() => {
    if (showKtpCamera) void ktpCam.start();
    else ktpCam.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showKtpCamera]);

  // Kamera wajah mati otomatis saat meninggalkan langkah 4
  useEffect(() => {
    if (step !== 4) faceCam.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const cvRef = useRef<HTMLInputElement>(null);
  const certRef = useRef<HTMLInputElement>(null);
  const portfolioRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    { num: 1, label: 'Data Diri' },
    { num: 2, label: 'Data Profesional' },
    { num: 3, label: 'Unggah Dokumen' },
    { num: 4, label: 'Verifikasi Wajah' },
    { num: 5, label: 'Selesai' }
  ];

  // ---- Validation ----
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!personal.name.trim()) e.name = 'Nama lengkap wajib diisi';
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(personal.email)) e.email = 'Format email tidak valid';
    if (!/^(\+62|08)\d{8,12}$/.test(personal.phone.replace(/\s/g, ''))) e.phone = 'Format nomor HP tidak valid';
    if (!personal.address.trim()) e.address = 'Alamat wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!professional.specialization.trim()) e.specialization = 'Spesialisasi wajib diisi';
    if (!professional.languages.trim()) e.languages = 'Bahasa yang dikuasai wajib diisi';
    if (!professional.pricePerDay.trim()) e.pricePerDay = 'Harga per hari wajib diisi';
    if (!professional.operationalHours.trim()) e.operationalHours = 'Jam operasional wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!docs.cv) e.cv = 'CV wajib diunggah';
    if (!docs.cert) e.cert = 'Sertifikat Kompetensi wajib diunggah';
    if (!docs.ktpCaptured) e.ktp = 'Foto KTP wajib diambil';
    if (docs.portfolioFiles.length === 0) e.portfolio = 'Minimal 1 foto portofolio wajib diunggah';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- File Upload Simulation ----
  const simulateUpload = (field: 'cvProgress' | 'certProgress' | 'portfolioProgress') => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setDocs(prev => ({ ...prev, [field]: Math.min(progress, 100) }));
      if (progress >= 100) clearInterval(interval);
    }, 200);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'cv' | 'cert'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isValid = ['application/pdf', 'image/jpeg', 'image/jpg'].includes(file.type);
    if (!isValid) {
      setErrors(prev => ({ ...prev, [field]: 'Format file harus PDF atau JPG' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [field]: 'Ukuran file maksimum 10MB' }));
      return;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    setDocs(prev => ({ ...prev, [field]: file, [`${field}Progress`]: 0 }));
    simulateUpload(field === 'cv' ? 'cvProgress' : 'certProgress');
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setErrors(prev => ({ ...prev, portfolio: '' }));
    setDocs(prev => ({
      ...prev,
      portfolioFiles: [...prev.portfolioFiles, ...files],
      portfolioProgress: 0
    }));
    simulateUpload('portfolioProgress');
  };

  const handleCaptureKtp = () => {
    setKtpDraft(null);
    setShowKtpCamera(true);
  };

  const handleKtpShoot = () => {
    const img = ktpCam.capture();
    if (img) setKtpDraft(img);
  };

  const handleKtpConfirm = () => {
    if (!ktpDraft) return;
    setKtpImage(ktpDraft);
    setDocs(prev => ({ ...prev, ktpCaptured: true }));
    setKtpEncrypted(false);
    setShowKtpCamera(false);
    setTimeout(() => setKtpEncrypted(true), 600);
    setErrors(prev => ({ ...prev, ktp: '' }));
  };

  const handleFaceCapture = () => {
    const img = faceCam.capture();
    if (!img) return;
    setFaceImage(img);
    faceCam.stop();
    setFaceVerified(true);
  };

  const handleFaceRetake = () => {
    setFaceImage(null);
    setFaceVerified(false);
    void faceCam.start();
  };

  const splitList = (value: string) => value.split(/[,;\n]/).map(v => v.trim()).filter(Boolean);

  const handleSubmitRegistration = async () => {
    if (!currentUser || submitting) return;
    if (!docs.cv || !docs.cert || !ktpImage || !faceImage || docs.portfolioFiles.length === 0) {
      setSubmitError('Dokumen belum lengkap. Kembali ke langkah sebelumnya dan lengkapi semuanya.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const items: UploadItem[] = [
        { type: 'cv', file: docs.cv },
        { type: 'certificate', file: docs.cert },
        { type: 'ktp', file: dataUrlToBlob(ktpImage) },
        { type: 'selfie', file: dataUrlToBlob(faceImage) },
        ...docs.portfolioFiles.map((file): UploadItem => ({ type: 'portfolio', file }))
      ];
      const uploaded = await uploadDocuments(currentUser.id, items);   // ke bucket privat
      await submitApplication({
        docs: uploaded,
        phone: personal.phone.trim() || undefined,
        address: personal.address.trim() || undefined,
        specialties: splitList(professional.specialization),
        languages: splitList(professional.languages),
        pricePerDay: parseInt(professional.pricePerDay.replace(/\D/g, ''), 10) || 0,
        workHours: professional.operationalHours.trim() || undefined,
        baseLocation: (currentUser.city || personal.address).trim().slice(0, 80) || undefined
      });
      setActiveScreen('guide-pending-review');
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Pengiriman gagal. Periksa koneksi lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(prev => (prev + 1) as Step);
  };

  const prevStep = () => setStep(prev => (prev - 1) as Step);

  const inputClass = (field: string) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#19324d]'
    }`;

  if (checkingExisting && currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#19324d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-[#19324d]">Masuk Dulu untuk Menjadi Pemandu</h2>
            <p className="text-sm text-slate-500">
              Pendaftaran pemandu memakai akun ZHS Anda. Buat akun atau masuk, lalu Anda akan kembali ke formulir ini.
            </p>
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => { setRedirectAfterLogin('guide-register'); setActiveScreen('register'); }}
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl"
            >
              Buat Akun
            </button>
            <button
              onClick={() => { setRedirectAfterLogin('guide-register'); setActiveScreen('login'); }}
              className="w-full py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl"
            >
              Saya Sudah Punya Akun
            </button>
            <button onClick={() => setActiveScreen('welcome')} className="text-xs text-slate-500 underline">
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => step === 1 ? setActiveScreen('welcome') : prevStep()}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#19324d]">Daftar sebagai Pemandu</h1>
            <p className="text-xs text-slate-500">Langkah {step} dari 4</p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-slate-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 mx-8">
              <div
                className="h-full bg-[#19324d] transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
            {STEPS.slice(0, 4).map(s => (
              <div key={s.num} className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  step > s.num
                    ? 'bg-[#19324d] border-[#19324d] text-white'
                    : step === s.num
                    ? 'bg-white border-[#19324d] text-[#19324d]'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${
                  step >= s.num ? 'text-[#19324d]' : 'text-slate-400'
                }`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* ===== STEP 1: DATA DIRI ===== */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#19324d]">Langkah 1: Data Diri</h2>
                <p className="text-xs text-slate-500 mt-0.5">Informasi identitas Anda sebagai calon pemandu ZHS</p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 inline mr-1" /> Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    placeholder="Sesuai KTP"
                    value={personal.name}
                    onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))}
                    className={inputClass('name')}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 inline mr-1" /> Email *
                  </label>
                  <input
                    type="email"
                    placeholder="email@contoh.com"
                    value={personal.email}
                    onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 inline mr-1" /> Nomor HP *
                  </label>
                  <input
                    type="tel"
                    placeholder="08xx-xxxx-xxxx"
                    value={personal.phone}
                    onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" /> Alamat Lengkap *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jl. contoh No. 1, Kecamatan, Kota"
                    value={personal.address}
                    onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))}
                    className={inputClass('address')}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Data Profesional</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===== STEP 2: DATA PROFESIONAL ===== */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-black text-[#19324d]">Langkah 2: Data Profesional</h2>
                <p className="text-xs text-slate-500 mt-0.5">Informasi keahlian dan tarif layanan Anda sebagai pemandu wisata</p>
              </div>

              <div className="space-y-4">
                {/* Specialization */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 inline mr-1" /> Spesialisasi *
                  </label>
                  <select
                    value={professional.specialization}
                    onChange={e => setProfessional(p => ({ ...p, specialization: e.target.value }))}
                    className={inputClass('specialization')}
                  >
                    <option value="">Pilih Spesialisasi</option>
                    <option>Wisata Alam & Hidden Spot</option>
                    <option>Cagar Budaya & Sejarah</option>
                    <option>Wisata Kuliner Lokal</option>
                    <option>Ekowisata & Petualangan</option>
                    <option>Wisata Religi</option>
                  </select>
                  {errors.specialization && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.specialization}</p>}
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 inline mr-1" /> Bahasa yang Dikuasai *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Indonesia, Sunda, English"
                    value={professional.languages}
                    onChange={e => setProfessional(p => ({ ...p, languages: e.target.value }))}
                    className={inputClass('languages')}
                  />
                  {errors.languages && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.languages}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1" /> Harga per Hari (Rp) *
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 350000"
                    value={professional.pricePerDay}
                    onChange={e => setProfessional(p => ({ ...p, pricePerDay: e.target.value }))}
                    className={inputClass('pricePerDay')}
                  />
                  {errors.pricePerDay && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pricePerDay}</p>}
                </div>

                {/* Operational Hours */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 inline mr-1" /> Jam Operasional *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 07:00 - 18:00 WIB (Senin - Sabtu)"
                    value={professional.operationalHours}
                    onChange={e => setProfessional(p => ({ ...p, operationalHours: e.target.value }))}
                    className={inputClass('operationalHours')}
                  />
                  {errors.operationalHours && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.operationalHours}</p>}
                </div>

                {/* Cancellation Policy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Kebijakan Pembatalan
                  </label>
                  <select
                    value={professional.cancellationPolicy}
                    onChange={e => setProfessional(p => ({ ...p, cancellationPolicy: e.target.value }))}
                    className={inputClass('cancellationPolicy')}
                  >
                    <option value="">Pilih Kebijakan</option>
                    <option>Fleksibel (Refund 100% H-3)</option>
                    <option>Moderat (Refund 50% H-1)</option>
                    <option>Ketat (No Refund H-0)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Unggah Dokumen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===== STEP 3: UNGGAH DOKUMEN ===== */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-[#19324d]">Langkah 3: Unggah Dokumen</h2>
                <p className="text-xs text-slate-500 mt-0.5">Semua dokumen diperlukan untuk verifikasi kelayakan Anda</p>
              </div>

              {/* CV Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5 inline mr-1" /> CV / Daftar Riwayat Hidup *
                </label>
                <div
                  onClick={() => cvRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all text-center ${
                    docs.cv ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
                  }`}
                >
                  {docs.cv ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-bold">{docs.cv.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Klik untuk unggah CV</p>
                      <p className="text-[11px] text-slate-400">Format PDF/JPG, maks 10MB</p>
                    </div>
                  )}
                </div>
                {docs.cvProgress > 0 && docs.cvProgress < 100 && (
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-[#19324d] h-1.5 rounded-full transition-all duration-300" style={{ width: `${docs.cvProgress}%` }} />
                  </div>
                )}
                <input ref={cvRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, 'cv')} />
                {errors.cv && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cv}</p>}
              </div>

              {/* Certificate Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> Sertifikat Kompetensi (BNSP/HPI) *
                </label>
                <div
                  onClick={() => certRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all text-center ${
                    docs.cert ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
                  }`}
                >
                  {docs.cert ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-bold">{docs.cert.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Klik untuk unggah Sertifikat</p>
                      <p className="text-[11px] text-slate-400">Format PDF/JPG, maks 10MB</p>
                    </div>
                  )}
                </div>
                {docs.certProgress > 0 && docs.certProgress < 100 && (
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-[#19324d] h-1.5 rounded-full transition-all duration-300" style={{ width: `${docs.certProgress}%` }} />
                  </div>
                )}
                <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg" className="hidden" onChange={e => handleFileChange(e, 'cert')} />
                {errors.cert && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cert}</p>}
              </div>

              {/* KTP Camera Verification */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Camera className="w-3.5 h-3.5 inline mr-1" /> Verifikasi Identitas KTP *
                </label>
                {!docs.ktpCaptured ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center space-y-3">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Ambil foto KTP menggunakan kamera</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Posisikan KTP dalam bingkai panduan yang tersedia</p>
                    </div>
                    <button
                      onClick={handleCaptureKtp}
                      className="px-5 py-2.5 bg-[#19324d] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#122438] transition-all flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      Buka Kamera KTP
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold">Foto KTP Berhasil Diambil</span>
                    </div>
                    {ktpEncrypted && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-100 rounded-xl px-3 py-2">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="font-bold">DATA DIENKRIPSI & AMAN — Disimpan dengan enkripsi AES-256</span>
                      </div>
                    )}
                    {ktpImage && (
                      <img src={ktpImage} alt="Foto KTP" className="w-full rounded-xl border border-emerald-200" />
                    )}
                    <button
                      onClick={() => setDocs(prev => ({ ...prev, ktpCaptured: false }))}
                      className="text-xs text-emerald-700 underline"
                    >
                      Ambil ulang foto
                    </button>
                  </div>
                )}
                {errors.ktp && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.ktp}</p>}
              </div>

              {/* Portfolio Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Image className="w-3.5 h-3.5 inline mr-1" /> Foto Portofolio Tur *
                </label>
                <div
                  onClick={() => portfolioRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 cursor-pointer transition-all text-center ${
                    docs.portfolioFiles.length > 0 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-[#19324d] hover:bg-slate-50'
                  }`}
                >
                  {docs.portfolioFiles.length > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-bold">{docs.portfolioFiles.length} foto dipilih</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Image className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Unggah foto portofolio tur</p>
                      <p className="text-[11px] text-slate-400">Format JPG/PNG, maks 5MB per foto</p>
                    </div>
                  )}
                </div>
                {docs.portfolioProgress > 0 && docs.portfolioProgress < 100 && (
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${docs.portfolioProgress}%` }} />
                  </div>
                )}
                <input ref={portfolioRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioChange} />
                {errors.portfolio && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.portfolio}</p>}
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Lanjutkan ke Verifikasi Wajah</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===== STEP 4: VERIFIKASI WAJAH ===== */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-center">
              <div>
                <h2 className="text-lg font-black text-[#19324d]">Verifikasi Biometrik Wajah</h2>
                <p className="text-xs text-slate-500 mt-0.5">Tahap terakhir sebelum profil Anda dikirim ke tim admin</p>
              </div>

              {/* Face scan area */}
              <div className="relative w-52 h-52 mx-auto">
                <div className={`relative w-52 h-52 rounded-full border-4 overflow-hidden bg-slate-100 transition-all ${
                  faceVerified ? 'border-emerald-500' : faceCam.status === 'ready' ? 'border-[#19324d]' : 'border-slate-300'
                }`}>
                  {/* video selalu ada di DOM supaya siap saat kamera dinyalakan */}
                  <video
                    ref={faceCam.videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${faceCam.status === 'ready' ? '' : 'hidden'}`}
                  />
                  {faceVerified && faceImage && (
                    <img src={faceImage} alt="Foto wajah" className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                  )}
                  {!faceVerified && faceCam.status !== 'ready' && (
                    <div className="absolute inset-0 flex items-center justify-center text-center">
                      {faceCam.status === 'starting' ? (
                        <div className="space-y-2">
                          <Scan className="w-14 h-14 text-[#19324d] mx-auto animate-pulse" />
                          <p className="text-xs font-bold text-[#19324d]">Menyalakan kamera...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <User className="w-14 h-14 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-500">Kamera belum aktif</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {faceVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                )}
                {/* Corner guides */}
                {!faceVerified && (
                  <>
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#19324d] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#19324d] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#19324d] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#19324d] rounded-br-lg" />
                  </>
                )}
              </div>

              {faceCam.error && (
                <p className="text-xs text-red-500 flex items-start gap-1 text-left max-w-xs mx-auto">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {faceCam.error}
                </p>
              )}

              {!faceVerified && (
                <div className="space-y-2 text-xs text-slate-500 max-w-xs mx-auto">
                  <p>📋 Panduan:</p>
                  <ul className="text-left space-y-1">
                    <li>• Pastikan wajah berada di tengah bingkai</li>
                    <li>• Pencahayaan cukup, tidak terlalu gelap</li>
                    <li>• Lepas kacamata atau aksesori yang menutupi wajah</li>
                    <li>• Tatap lurus ke kamera</li>
                  </ul>
                </div>
              )}

              {!faceVerified ? (
                faceCam.status === 'ready' ? (
                  <button
                    onClick={handleFaceCapture}
                    className="w-full py-4 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Ambil Foto Wajah
                  </button>
                ) : (
                  <button
                    onClick={() => void faceCam.start()}
                    disabled={faceCam.status === 'starting'}
                    className="w-full py-4 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    {faceCam.status === 'starting' ? 'Menyalakan Kamera...' : 'Aktifkan Kamera'}
                  </button>
                )
              ) : (
                <button onClick={handleFaceRetake} className="text-xs text-slate-500 underline">
                  Ambil ulang foto
                </button>
              )}
            </div>

            {faceVerified && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Foto wajah berhasil direkam!</p>
                  <p>Wajah akan dicocokkan dengan foto KTP oleh tim admin ZHS. Seluruh dokumen akan ditinjau di sana.</p>
                  <p>Estimasi waktu peninjauan: <strong>1-2 hari kerja</strong></p>
                </div>

                {submitError && (
                  <p className="text-xs text-red-600 flex items-start gap-1.5 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
                  </p>
                )}
                <button
                  onClick={() => void handleSubmitRegistration()}
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{submitting ? 'Mengunggah dokumen…' : 'Kirim ke Admin & Selesai'}</span>
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* KTP Camera Modal */}
      {showKtpCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="w-full max-w-sm px-4 space-y-4">
            {/* Camera viewfinder */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden border-2 border-white/20">
              <video
                ref={ktpCam.videoRef}
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover ${ktpDraft ? 'hidden' : ''}`}
              />
              {ktpDraft && (
                <img src={ktpDraft} alt="Pratinjau KTP" className="absolute inset-0 w-full h-full object-contain bg-black" />
              )}
              {!ktpDraft && ktpCam.status === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4/5 h-3/5 border-2 border-white/80 rounded-xl relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br" />
                  </div>
                </div>
              )}
              {!ktpDraft && ktpCam.status !== 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center p-5 text-center text-white/80 text-xs">
                  {ktpCam.status === 'error' ? ktpCam.error : 'Menyalakan kamera…'}
                </div>
              )}
            </div>

            <p className="text-white/80 text-xs text-center">
              {ktpDraft
                ? 'Periksa hasil foto. Pastikan seluruh KTP terbaca jelas.'
                : 'Posisikan KTP dalam bingkai. Pastikan tidak buram dan tidak silau.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowKtpCamera(false)}
                className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Batal
              </button>
              {ktpDraft ? (
                <>
                  <button
                    onClick={() => setKtpDraft(null)}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-2xl transition-all"
                  >
                    Ulangi
                  </button>
                  <button
                    onClick={handleKtpConfirm}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Gunakan
                  </button>
                </>
              ) : (
                <button
                  onClick={handleKtpShoot}
                  disabled={ktpCam.status !== 'ready'}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Ambil Foto
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
