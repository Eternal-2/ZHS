import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LogoZH } from '../LogoZH';
import {
  ShieldCheck, ArrowRight, ArrowLeft, Delete, CheckCircle2,
  User, Mail, Phone, MapPin, Globe, Calendar, Heart, Users, Camera
} from 'lucide-react';

type FormStep = 'role-select' | 'step1' | 'step2' | 'otp' | 'success';

const TRAVEL_PREFS = ['Alam', 'Budaya', 'Petualangan', 'Kuliner'];
const LANGUAGES = ['Indonesia', 'Inggris', 'Mandarin', 'Arab', 'Sunda', 'Jawa'];

export const RegisterScreen: React.FC = () => {
  const { login, setActiveScreen } = useAppStore();
  const [roleTab, setRoleTab] = useState<'Wisatawan' | 'Pemandu'>('Wisatawan');
  const [step, setStep] = useState<FormStep>('role-select');

  // Step 1 fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');

  // Step 2 fields
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (step === 'otp' && secondsLeft > 0) {
      const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, secondsLeft]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePhone = (v: string) => /^(08|\+62)[0-9]{8,12}$/.test(v.replace(/\s/g, ''));

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Nama lengkap wajib diisi';
    if (!gender) errs.gender = 'Jenis kelamin wajib dipilih';
    if (!birthDate) errs.birthDate = 'Tanggal lahir wajib diisi';
    if (!phone) errs.phone = 'Nomor HP wajib diisi';
    else if (!validatePhone(phone)) errs.phone = 'Format nomor HP tidak valid (contoh: 081234567890)';
    if (!email) errs.email = 'Email wajib diisi';
    else if (!validateEmail(email)) errs.email = 'Format email tidak valid';
    if (!address.trim()) errs.address = 'Alamat wajib diisi';
    if (!nationality) errs.nationality = 'Kewarganegaraan wajib dipilih';
    if (!city.trim()) errs.city = 'Kota domisili wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (selectedLangs.length === 0) errs.langs = 'Pilih minimal 1 bahasa';
    if (selectedPrefs.length === 0) errs.prefs = 'Pilih minimal 1 preferensi wisata';
    if (!emergencyName.trim()) errs.emergencyName = 'Nama kontak darurat wajib diisi';
    if (!emergencyPhone) errs.emergencyPhone = 'Nomor kontak darurat wajib diisi';
    else if (!validatePhone(emergencyPhone)) errs.emergencyPhone = 'Format nomor tidak valid';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setStep('step2');
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep('otp');
      setSecondsLeft(300);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      const idx = otp.map((x) => !!x).lastIndexOf(true);
      if (idx !== -1) {
        const next = [...otp];
        next[idx] = '';
        setOtp(next);
      }
      return;
    }
    const firstEmpty = otp.findIndex((x) => x === '');
    if (firstEmpty !== -1) {
      const next = [...otp];
      next[firstEmpty] = val;
      setOtp(next);
      if (firstEmpty === 5) {
        setTimeout(() => setStep('success'), 400);
      }
    }
  };

  const toggleLang = (lang: string) =>
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );

  const togglePref = (pref: string) =>
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );

  const inputCls = (field: string) =>
    `w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-slate-800 focus:outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#19324d]'
    }`;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col p-5 sm:p-8 max-w-md mx-auto">

      {/* ─── ROLE SELECT ─── */}
      {step === 'role-select' && (
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex flex-col items-center pt-4 space-y-4">
            <LogoZH size={72} withContainer={false} />
            <h1 className="text-xl font-extrabold text-[#19324d] tracking-tight uppercase">
              ZAMZAM HIDDEN SPOT
            </h1>
            <p className="text-xs text-slate-500 text-center">
              Pilih peran Anda untuk memulai pendaftaran
            </p>

            <div className="w-full space-y-3 pt-4">
              <button
                onClick={() => { setRoleTab('Wisatawan'); setStep('step1'); }}
                className="w-full p-5 bg-white border-2 border-slate-200 hover:border-[#19324d] rounded-2xl flex items-center gap-4 text-left transition-all group shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200 group-hover:bg-sky-100 transition-colors">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#19324d]">Wisatawan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Temukan dan pesan tur tersembunyi</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-[#19324d]" />
              </button>

              <button
                onClick={() => { setRoleTab('Pemandu'); setActiveScreen('guide-register'); }}
                className="w-full p-5 bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl flex items-center gap-4 text-left transition-all group shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:bg-amber-100 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#19324d]">Pemandu Wisata</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daftarkan diri sebagai pemandu berlisensi</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-amber-600" />
              </button>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-xs text-slate-600">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setActiveScreen('login')}
                className="font-bold text-[#19324d] underline ml-1"
              >
                Masuk
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 1: DATA DIRI ─── */}
      {step === 'step1' && (
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setStep('role-select')} className="p-1 text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1">
                  <div className="w-6 h-1.5 rounded-full bg-[#19324d]" />
                  <div className="w-6 h-1.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Langkah 1 dari 2</span>
              </div>
              <h2 className="text-base font-extrabold text-[#19324d]">Data Diri Wisatawan</h2>
            </div>
          </div>

          <form onSubmit={handleStep1Next} className="space-y-3 flex-1">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                  placeholder="Masukkan nama lengkap Anda"
                  className={`${inputCls('name')} pl-9`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {['Laki-laki', 'Perempuan'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setGender(g); setErrors((p) => ({ ...p, gender: '' })); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      gender === g
                        ? 'bg-[#19324d] text-white border-[#19324d]'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {g === 'Laki-laki' ? '♂ Laki-laki' : '♀ Perempuan'}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-[10px] text-red-500 mt-0.5">{errors.gender}</p>}
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => { setBirthDate(e.target.value); setErrors((p) => ({ ...p, birthDate: '' })); }}
                  className={`${inputCls('birthDate')} pl-9`}
                />
              </div>
              {errors.birthDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.birthDate}</p>}
            </div>

            {/* Nomor HP & Email */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
                    placeholder="081234..."
                    className={`${inputCls('phone')} pl-8`}
                  />
                </div>
                {errors.phone && <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="email@..."
                    className={`${inputCls('email')} pl-8`}
                  />
                </div>
                {errors.email && <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{errors.email}</p>}
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Alamat <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: '' })); }}
                  placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan"
                  className={`${inputCls('address')} pl-9 resize-none`}
                />
              </div>
              {errors.address && <p className="text-[10px] text-red-500 mt-0.5">{errors.address}</p>}
            </div>

            {/* Kewarganegaraan & Kota */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Kewarganegaraan <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={nationality}
                    onChange={(e) => { setNationality(e.target.value); setErrors((p) => ({ ...p, nationality: '' })); }}
                    className={`${inputCls('nationality')} pl-8 appearance-none`}
                  >
                    <option value="">Pilih</option>
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                </div>
                {errors.nationality && <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{errors.nationality}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Kota Domisili <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: '' })); }}
                  placeholder="Jakarta, Bandung..."
                  className={inputCls('city')}
                />
                {errors.city && <p className="text-[9px] text-red-500 mt-0.5 leading-tight">{errors.city}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all mt-4 flex items-center justify-center gap-2"
            >
              <span>Lanjut ke Langkah 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-3">
            <p className="text-xs text-slate-600">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setActiveScreen('login')}
                className="font-bold text-[#19324d] underline ml-1"
              >
                Masuk
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 2: INFORMASI WISATAWAN ─── */}
      {step === 'step2' && (
        <div className="flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setStep('step1')} className="p-1 text-slate-500 hover:text-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1">
                  <div className="w-6 h-1.5 rounded-full bg-[#19324d]" />
                  <div className="w-6 h-1.5 rounded-full bg-[#19324d]" />
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Langkah 2 dari 2</span>
              </div>
              <h2 className="text-base font-extrabold text-[#19324d]">Informasi Wisatawan</h2>
            </div>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-4 flex-1">
            {/* Bahasa */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Bahasa yang Dikuasai <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => { toggleLang(lang); setErrors((p) => ({ ...p, langs: '' })); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      selectedLangs.includes(lang)
                        ? 'bg-[#19324d] text-white border-[#19324d]'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-[#19324d]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              {errors.langs && <p className="text-[10px] text-red-500 mt-1">{errors.langs}</p>}
            </div>

            {/* Preferensi Wisata */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Preferensi Wisata <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_PREFS.map((pref) => {
                  const icons: Record<string, string> = { Alam: '🌿', Budaya: '🏛️', Petualangan: '⛰️', Kuliner: '🍜' };
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => { togglePref(pref); setErrors((p) => ({ ...p, prefs: '' })); }}
                      className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                        selectedPrefs.includes(pref)
                          ? 'bg-[#19324d] text-white border-[#19324d]'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-[#19324d]'
                      }`}
                    >
                      <span>{icons[pref]}</span>
                      <span>{pref}</span>
                    </button>
                  );
                })}
              </div>
              {errors.prefs && <p className="text-[10px] text-red-500 mt-1">{errors.prefs}</p>}
            </div>

            {/* Kontak Darurat */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Kontak Darurat</span>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => { setEmergencyName(e.target.value); setErrors((p) => ({ ...p, emergencyName: '' })); }}
                  placeholder="Nama kontak darurat"
                  className={inputCls('emergencyName')}
                />
                {errors.emergencyName && <p className="text-[10px] text-red-500 mt-0.5">{errors.emergencyName}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => { setEmergencyPhone(e.target.value); setErrors((p) => ({ ...p, emergencyPhone: '' })); }}
                  placeholder="081234567890"
                  className={inputCls('emergencyPhone')}
                />
                {errors.emergencyPhone && <p className="text-[10px] text-red-500 mt-0.5">{errors.emergencyPhone}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Daftar & Verifikasi OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── OTP ─── */}
      {step === 'otp' && (
        <div className="flex flex-col justify-between flex-1 py-4 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 border-2 border-[#19324d]/30 rounded-2xl mx-auto flex items-center justify-center text-4xl bg-sky-50">
              📱
            </div>
            <h2 className="text-xl font-bold text-[#19324d]">Verifikasi OTP</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Kode OTP 6 digit telah dikirimkan ke nomor HP{' '}
              <strong className="text-slate-700">{phone}</strong>
            </p>

            {/* 6 Digit OTP Boxes */}
            <div className="flex justify-center gap-2 pt-4">
              {otp.map((digit, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-12 rounded-lg border-b-2 flex items-center justify-center text-xl font-bold transition-all ${
                    digit ? 'border-[#19324d] text-[#19324d]' : 'border-slate-300 text-transparent'
                  }`}
                >
                  {digit || '—'}
                </div>
              ))}
            </div>

            {/* Timer */}
            <div className="pt-2">
              <div className={`text-base font-bold ${secondsLeft < 60 ? 'text-red-500' : 'text-[#19324d]'}`}>
                {formatTimer(secondsLeft)}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Batas waktu verifikasi</p>
              {secondsLeft === 0 && (
                <button
                  type="button"
                  onClick={() => setSecondsLeft(300)}
                  className="text-xs text-[#19324d] font-bold underline mt-2"
                >
                  Kirim Ulang Kode
                </button>
              )}
            </div>
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-y-4 gap-x-6 px-6 max-w-xs mx-auto w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-14 text-2xl font-semibold text-slate-800 hover:bg-slate-200/60 rounded-2xl transition-colors active:scale-90"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="h-14 text-2xl font-semibold text-slate-800 hover:bg-slate-200/60 rounded-2xl transition-colors active:scale-90"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('backspace')}
              className="h-14 flex items-center justify-center text-slate-800 hover:bg-slate-200/60 rounded-2xl transition-colors active:scale-90"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ─── SUCCESS ─── */}
      {step === 'success' && (
        <div className="flex flex-col items-center justify-center flex-1 py-12 space-y-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/30">
              <ShieldCheck className="w-14 h-14" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="space-y-2 max-w-xs">
            <h2 className="text-2xl font-extrabold text-[#19324d]">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Akun Wisatawan Anda telah aktif. Selamat menjelajahi hidden spot nusantara bersama pemandu berlisensi ZHS!
            </p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-semibold">
              🎉 +100 Poin Selamat Datang Ditambahkan ke Akun Anda!
            </div>
            <button
              type="button"
              onClick={() => login(roleTab === 'Wisatawan' ? 'wisatawan' : 'pemandu', email || name)}
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Need Compass import
function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
