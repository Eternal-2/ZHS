import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const rupiah = (n: number) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
export const dateId = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
export const dateTimeId = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Memuat data async dengan status loading/error dan fungsi muat ulang. */
export function useLoad<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const seq = useRef(0);

  const reload = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const result = await fnRef.current();
      if (mine === seq.current) setData(result);
    } catch (e: any) {
      if (mine === seq.current) setError(e?.message ?? 'Gagal memuat data');
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, reload };
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export const BOOKING_STATUS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Menunggu bayar', cls: 'bg-amber-100 text-amber-800' },
  escrow_locked: { label: 'Dana di escrow', cls: 'bg-sky-100 text-sky-800' },
  confirmed_by_guide: { label: 'Dikonfirmasi', cls: 'bg-indigo-100 text-indigo-800' },
  in_tour: { label: 'Berlangsung', cls: 'bg-violet-100 text-violet-800' },
  completed: { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
  expired: { label: 'Kedaluwarsa', cls: 'bg-slate-200 text-slate-600' },
  disputed: { label: 'Sengketa', cls: 'bg-red-100 text-red-700' }
};

export const Pill: React.FC<{ cls?: string; children: React.ReactNode }> = ({ cls = 'bg-slate-100 text-slate-700', children }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cls}`}>{children}</span>
);

export const Card: React.FC<{ title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  title, right, children, className = ''
}) => (
  <section className={`bg-white border border-slate-200 rounded-3xl shadow-sm ${className}`}>
    {(title || right) && (
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <h3 className="text-sm font-extrabold text-[#19324d]">{title}</h3>
        {right}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

export const PageTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3 flex-wrap">
    <div>
      <h1 className="text-xl font-black text-[#19324d]">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const ErrorBox: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) =>
  !message ? null : (
    <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded-2xl p-3 flex items-start gap-1.5">
      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="font-bold">×</button>}
    </div>
  );

export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center text-sm text-slate-500">{children}</div>
);

export const Spinner: React.FC = () => (
  <div className="flex justify-center py-10">
    <div className="w-8 h-8 border-4 border-[#19324d] border-t-transparent rounded-full animate-spin" />
  </div>
);

export const inputCls =
  'w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:border-[#19324d] disabled:bg-slate-100 disabled:text-slate-500';

export const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1">
    <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400">{hint}</span>}
  </label>
);

export const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'ghost' | 'danger' | 'success' }> = ({
  tone = 'primary', className = '', ...props
}) => {
  const tones = {
    primary: 'bg-[#19324d] hover:bg-[#122438] text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    danger: 'bg-white border border-red-300 text-red-600 hover:bg-red-50',
    ghost: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
  } as const;
  return (
    <button
      {...props}
      className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${tones[tone]} ${className}`}
    />
  );
};

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-3 overflow-y-auto" onClick={onClose}>
    <div className="bg-white rounded-3xl w-full max-w-2xl my-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-black text-[#19324d]">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const FilterTabs: React.FC<{ value: string; onChange: (v: string) => void; options: { id: string; label: string; count?: number }[] }> = ({
  value, onChange, options
}) => (
  <div className="flex gap-2 flex-wrap">
    {options.map((o) => (
      <button
        key={o.id}
        onClick={() => onChange(o.id)}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
          value === o.id ? 'bg-[#19324d] text-white border-[#19324d]' : 'bg-white text-slate-600 border-slate-300 hover:border-[#19324d]'
        }`}
      >
        {o.label}{o.count !== undefined ? ` (${o.count})` : ''}
      </button>
    ))}
  </div>
);
