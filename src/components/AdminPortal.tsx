'use client';

import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminGuideReviewScreen } from './screens/AdminGuideReviewScreen';
import { AdminSupportInbox } from './screens/AdminSupportInbox';

type Phase = 'checking' | 'login' | 'panel';

// Pesan yang sama untuk semua kegagalan agar tidak membocorkan apakah sebuah email adalah akun admin.
const DENIED = 'Email atau password salah, atau akun ini tidak memiliki akses admin.';

/**
 * Pintu masuk admin yang terpisah dari aplikasi publik (alamat: /admin).
 * Catatan: menyembunyikan alamat bukan pengamanan. Pengamanan sebenarnya ada di server:
 * semua fungsi admin_* dan akses data memeriksa role 'admin' di database.
 */
export default function AdminPortal() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [tab, setTab] = useState<'verifikasi' | 'bantuan'>('verifikasi');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /** true jika sesi saat ini milik akun ber-role admin. */
  const loadAdmin = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.session.user.id)
      .maybeSingle();
    if (profile?.role !== 'admin') return false;
    setAdminName(profile.full_name);
    setAdminId(data.session.user.id);
    return true;
  };

  useEffect(() => {
    void loadAdmin().then((ok) => setPhase(ok ? 'panel' : 'login'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) { setError(DENIED); return; }
      if (!(await loadAdmin())) {
        await supabase.auth.signOut();   // akun biasa tidak boleh menyisakan sesi dari halaman ini
        setError(DENIED);
        return;
      }
      setPassword('');
      setPhase('panel');
    } catch {
      setError('Tidak dapat terhubung ke server. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPassword('');
    setPhase('login');
  };

  if (phase === 'checking') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#19324d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'panel') {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 flex gap-1">
            {([['verifikasi', 'Verifikasi Pemandu'], ['bantuan', 'Pusat Bantuan']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                  tab === id ? 'border-[#19324d] text-[#19324d]' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {tab === 'verifikasi' ? (
          <AdminGuideReviewScreen adminName={adminName} onLogout={() => void handleLogout()} />
        ) : (
          <>
            <div className="max-w-3xl mx-auto px-4 pt-4 flex justify-end">
              <button onClick={() => void handleLogout()} className="text-[11px] text-slate-500 underline">Keluar ({adminName})</button>
            </div>
            <AdminSupportInbox adminId={adminId} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#19324d] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-[#19324d]">Panel Admin ZHS</h1>
          <p className="text-xs text-slate-500">Khusus pengelola Zam Zam Hidden Spot</p>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Email</label>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#19324d]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-[#19324d]"
          />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          {busy ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
}
