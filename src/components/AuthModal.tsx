import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { UserRole } from '../store/useAppStore';
import { LogoZH } from './LogoZH';
import { X, ShieldCheck, UserCheck, Store, Compass, ArrowRight, CheckCircle2, Mail, Key } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, authInitialTab, closeAuthModal, login } = useAppStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authInitialTab || 'login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('wisatawan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState(['5', '8', '2', '4']);

  if (!authModalOpen) return null;

  const handleQuickDemo = (role: UserRole) => {
    login(role, `${role}@zamzamhiddenspot.com`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register' && step === 'form') {
      setStep('otp');
      return;
    }
    login(selectedRole, email || `${selectedRole}@zamzamhiddenspot.com`);
  };

  const rolesConfig: { id: UserRole; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'wisatawan',
      label: 'Wisatawan',
      desc: 'Jelajahi spot tersembunyi & pesan pemandu',
      icon: <Compass className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/40 hover:border-sky-400 bg-sky-950/30'
    },
    {
      id: 'pemandu',
      label: 'Pemandu Wisata',
      desc: 'Kelola jadwal, terima lead tur & dana escrow',
      icon: <UserCheck className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/30'
    },
    {
      id: 'umkm',
      label: 'Mitra UMKM',
      desc: 'Kemitraan produk & bundling tur budaya',
      icon: <Store className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/30'
    },
    {
      id: 'admin',
      label: 'Admin ZHS',
      desc: 'Verifikasi pemandu, kalibrasi matching & dispute',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/30'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all">
      {/* Container: Bottom Sheet on Mobile, Centered Modal on Desktop */}
      <div 
        className="w-full sm:max-w-lg bg-[#152a42] border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-600/60 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <LogoZH size={42} />
            <div>
              <h3 className="font-semibold text-white text-base">Zamzam Hidden Spot</h3>
              <p className="text-xs text-slate-400">Portal Akses Ekosistem ZHS v2.0</p>
            </div>
          </div>
          <button 
            onClick={closeAuthModal} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setStep('form'); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setStep('form'); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 overflow-y-auto space-y-4 flex-1">
          {step === 'otp' ? (
            /* OTP Verification Screen (as mandated in PDF Flowchart Utama) */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Verifikasi OTP & Aktivasi Akun</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Sesuai alur sistem ZHS, kode OTP 4-digit telah dikirimkan ke email atau WhatsApp Anda.
                </p>
              </div>

              <div className="flex justify-center gap-3 py-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[idx] = e.target.value;
                      setOtp(newOtp);
                    }}
                    className="w-12 h-14 text-center text-xl font-bold bg-slate-900 border border-slate-600 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => login(selectedRole, email || `${selectedRole}@zamzamhiddenspot.com`)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>Aktivasi Akun & Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Kembali ke Formulir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Pilih Peran Pengguna (Sesuai Swimlane ZHS)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rolesConfig.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedRole === role.id
                          ? 'border-amber-400 bg-slate-800/90 shadow-sm ring-1 ring-amber-400'
                          : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-xs text-white">{role.label}</span>
                        {role.icon}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{role.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name if register */}
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="cth. Ahmad Fauzi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Akun</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={`${selectedRole}@zamzamhiddenspot.com`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Kata Sandi</label>
                  {activeTab === 'login' && (
                    <button type="button" className="text-[11px] text-sky-400 hover:underline">
                      Lupa sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-white hover:bg-slate-100 text-[#152a42] font-bold rounded-xl text-sm transition-all shadow-lg active:scale-[0.99]"
              >
                {activeTab === 'login' ? 'Masuk ke Sistem' : 'Lanjut ke Verifikasi OTP'}
              </button>

              {/* Quick 1-Click Sandbox Test */}
              <div className="pt-2 border-t border-slate-700/60">
                <p className="text-[11px] text-center text-slate-400 mb-2">
                  Atau Uji Coba Cepat (1-Click Role Sandbox):
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('wisatawan')}
                    className="py-1.5 px-1 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-600/40 rounded-lg text-[10px] text-sky-300 font-medium text-center transition-all"
                  >
                    Wisatawan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('pemandu')}
                    className="py-1.5 px-1 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 rounded-lg text-[10px] text-amber-300 font-medium text-center transition-all"
                  >
                    Pemandu
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('umkm')}
                    className="py-1.5 px-1 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 rounded-lg text-[10px] text-emerald-300 font-medium text-center transition-all"
                  >
                    UMKM
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="py-1.5 px-1 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-600/40 rounded-lg text-[10px] text-purple-300 font-medium text-center transition-all"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
