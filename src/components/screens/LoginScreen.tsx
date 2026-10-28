import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LogoZH } from '../LogoZH';
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck, Info } from 'lucide-react';
import { signInWithProvider, sendPasswordReset } from '../../services/authService';

export const LoginScreen: React.FC = () => {
  const { signIn, setActiveScreen, redirectAfterLogin } = useAppStore();
  const [roleTab, setRoleTab] = useState<'Wisatawan' | 'Pemandu'>('Wisatawan');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleRoleChange = (role: 'Wisatawan' | 'Pemandu') => {
    setRoleTab(role);
    setHasError(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    setLoading(true);
    try {
      await signIn(username.trim(), password); // Supabase Auth; role diambil dari tabel profiles
    } catch (err: any) {
      setErrorMsg(err?.message === 'Invalid login credentials' ? 'Email atau password tidak valid. Silakan coba lagi.' : err?.message ?? 'Gagal masuk.');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
  try {
    await signInWithProvider(provider);
  } catch (err: any) {
    setErrorMsg(err?.message ?? 'Login dengan akun sosial gagal.');
    setHasError(true);
  }
};

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordReset(username.trim());
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Gagal mengirim email reset.');
      setHasError(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between p-6 sm:p-8 max-w-md mx-auto">
      
      {/* Top Brand Logo & Title */}
      <div className="flex flex-col items-center pt-4 sm:pt-6">
        <button
          onClick={() => setActiveScreen('welcome')}
          className="self-start text-xs font-semibold text-slate-500 hover:text-[#19324d] flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>

        <div className="mb-3">
          <LogoZH size={72} withContainer={false} />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#19324d] tracking-tight uppercase">
          ZAMZAM HIDDEN SPOT
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          #Guided by Knowledge & Insight
        </p>

        {/* Redirect Notice if user was redirected from booking */}
        {redirectAfterLogin && (
          <div className="w-full mt-4 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs animate-in fade-in">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="block font-bold">Wajib Login untuk Melanjutkan Booking</strong>
              <span>Silakan masuk ke akun Anda. Setelah berhasil masuk, Anda akan langsung diarahkan ke konfirmasi pemesanan.</span>
            </div>
          </div>
        )}

        {/* Wisatawan vs Pemandu Pill Selector */}
        <div className="w-full mt-5 bg-[#f1f5f9] border border-slate-300 rounded-full p-1 flex shadow-2xs">
          <button
            type="button"
            id="tab-role-wisatawan"
            onClick={() => handleRoleChange('Wisatawan')}
            className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'Wisatawan'
                ? 'bg-[#19324d] text-white shadow-md'
                : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-200'
            }`}
          >
            <span>Wisatawan</span>
          </button>
          <button
            type="button"
            id="tab-role-pemandu"
            onClick={() => handleRoleChange('Pemandu')}
            className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              roleTab === 'Pemandu'
                ? 'bg-[#19324d] text-white shadow-md'
                : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Pemandu (Guide)</span>
          </button>
        </div>

        {/* Role Helper Info Tag */}
        <div className="mt-2 text-center">
          {roleTab === 'Pemandu' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Portal Mitra Pemandu Terverifikasi BNSP</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium">
              Akses akun wisatawan untuk reservasi tur & proteksi escrow
            </span>
          )}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="my-auto py-5">
        {isResetMode ? (
          /* FORGOT PASSWORD FLOW */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-xs sm:text-sm text-center text-slate-600 mb-4">
              Masukkan email atau ID {roleTab} Anda untuk mereset kata sandi
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                EMAIL / USERNAME
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan email atau username"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#19324d] focus:ring-1 focus:ring-[#19324d]"
              />
            </div>

            {resetSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instruksi reset kata sandi telah dikirim ke email Anda.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all"
            >
              KIRIM TINDAKAN RESET
            </button>

            <button
              type="button"
              onClick={() => { setIsResetMode(false); setResetSent(false); }}
              className="w-full text-center text-xs text-slate-600 hover:text-slate-900 underline mt-2 block"
            >
              Kembali ke halaman login
            </button>
          </form>
        ) : (
          /* STANDARD LOGIN FLOW */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                EMAIL
              </label>
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#19324d] focus:ring-1 focus:ring-[#19324d]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#19324d] focus:ring-1 focus:ring-[#19324d]"
              />
            </div>

            {/* Error Message Alert */}
            {hasError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2 text-xs text-red-800 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg || 'Kredensial atau password tidak valid. Silakan coba lagi.'}</span>
              </div>
            )}

            <button
              type="submit"
              id="btn-submit-login"
              disabled={loading}
              className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md active:scale-98 transition-all"
            >
              {loading ? 'MEMPROSES…' : `MASUK SEBAGAI ${roleTab.toUpperCase()}`}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsResetMode(true)}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                Lupa password? Klik di sini
              </button>
            </div>
          </form>
        )}

        {/* Social Login Options (for tourists) */}
        {roleTab === 'Wisatawan' && !isResetMode && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-slate-300 w-full" />
              <span className="bg-[#f8fafc] px-3 text-[11px] text-slate-500 uppercase tracking-wider absolute">
                ATAU MASUK DENGAN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void handleOAuth('google')}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-sm transition-all"
              >
                <span className="font-bold text-red-500 text-sm">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => void handleOAuth('facebook')}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 shadow-sm transition-all"
              >
                <span className="font-bold text-blue-600 text-sm">f</span>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-2">
        <p className="text-xs text-slate-600">
          Belum punya akun?{' '}
          <button
            type="button"
            onClick={() => setActiveScreen('register')}
            className="font-bold text-slate-900 underline ml-1 hover:text-[#19324d]"
          >
            Daftar Akun Baru
          </button>
        </p>
      </div>

    </div>
  );
};
