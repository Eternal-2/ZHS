import React, { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { fetchRules, saveRules } from '../../services/adminService';
import type { Rules } from '../../services/adminService';
import { Btn, Card, ErrorBox, Field, PageTitle, Spinner, inputCls, rupiah, useLoad } from './ui';

/** Susun kalimat kebijakan refund dari aturan (rentang tidak tumpang tindih, sama dengan logika database). */
export const describePolicies = (policies: Rules['policies']): string[] => {
  const rows = [...policies].sort((a, b) => b.min_days_before - a.min_days_before);
  return rows.map((p, i) => {
    const lower = p.min_days_before;
    const upper = i === 0 ? Infinity : rows[i - 1].min_days_before - 1;
    const when = upper === Infinity ? `${lower} hari atau lebih sebelum tur`
      : lower === upper ? (lower === 0 ? 'Pada hari-H tur' : `${lower} hari sebelum tur`)
      : `${lower}-${upper} hari sebelum tur`;
    return `${when}: refund ${p.refund_percent}%`;
  });
};

/** Pemeriksaan di klien agar pesan lebih cepat; server tetap memvalidasi ulang. */
export const validateRules = (r: Rules): string | null => {
  const s = r.settings;
  if (!(s.platform_fee_percent >= 0 && s.platform_fee_percent <= 50)) return 'Biaya platform harus 0-50 persen';
  if (!(s.extra_guide_fee >= 0)) return 'Biaya pemandu tambahan tidak valid';
  if (!(s.pax_per_guide >= 1 && s.pax_per_guide <= 100)) return 'Peserta per pemandu harus 1-100';
  if (!(s.guide_confirm_hours >= 1 && s.guide_confirm_hours <= 168)) return 'Batas konfirmasi pemandu harus 1-168 jam';
  if (r.tiers.length === 0 || !r.tiers.some((t) => t.min_pax === 1)) return 'Diskon rombongan harus memiliki tingkat untuk 1 peserta';
  if (new Set(r.tiers.map((t) => t.min_pax)).size !== r.tiers.length) return 'Ada tingkat diskon dengan jumlah peserta yang sama';
  if (r.tiers.some((t) => !t.label.trim() || t.discount_percent < 0 || t.discount_percent > 90)) return 'Isi label diskon, dan diskon harus 0-90 persen';
  if (r.policies.length === 0 || !r.policies.some((p) => p.min_days_before === 0)) return 'Kebijakan refund harus memiliki aturan untuk hari-H (0 hari)';
  if (new Set(r.policies.map((p) => p.min_days_before)).size !== r.policies.length) return 'Ada aturan refund dengan jumlah hari yang sama';
  if (r.policies.some((p) => p.refund_percent < 0 || p.refund_percent > 100)) return 'Refund harus 0-100 persen';
  return null;
};

const NumberInput: React.FC<{ value: number; onChange: (n: number) => void; min?: number; max?: number; suffix?: string }> = ({ value, onChange, min, max, suffix }) => (
  <div className="flex items-center gap-2">
    <input type="number" value={Number.isFinite(value) ? value : ''} min={min} max={max} className={inputCls} onChange={(e) => onChange(Number(e.target.value))} />
    {suffix && <span className="text-xs text-slate-500 shrink-0">{suffix}</span>}
  </div>
);

export const SettingsTab: React.FC = () => {
  const { data, loading, error, reload } = useLoad(fetchRules, []);
  const [rules, setRules] = useState<Rules | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { if (data) setRules(JSON.parse(JSON.stringify(data)) as Rules); }, [data]);

  if (loading && !rules) return <Spinner />;
  if (!rules) return <div className="space-y-4"><PageTitle title="Pengaturan" /><ErrorBox message={error || 'Gagal memuat pengaturan'} /></div>;

  const setS = <K extends keyof Rules['settings']>(k: K, v: Rules['settings'][K]) => setRules({ ...rules, settings: { ...rules.settings, [k]: v } });
  const problem = validateRules(rules);
  const dirty = JSON.stringify(rules) !== JSON.stringify(data);

  const save = async () => {
    if (problem) { setSaveError(problem); return; }
    if (rules.settings.payment_mode === 'demo' && !window.confirm('Mode pembayaran UJI aktif: siapa pun bisa "membayar" tanpa uang sungguhan. Lanjutkan?')) return;
    setSaving(true); setSaveError(''); setNotice('');
    try {
      await saveRules(rules);
      setNotice('Pengaturan tersimpan. Pemesanan baru langsung memakai aturan ini.');
      await reload();
    } catch (e: any) { setSaveError(e?.message ?? 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title="Pengaturan"
        subtitle="Aturan bisnis yang dipakai server saat menghitung harga, refund, dan escrow"
        right={<Btn disabled={saving || !dirty} onClick={() => void save()}>{saving ? 'Menyimpan…' : 'Simpan Perubahan'}</Btn>}
      />
      {notice && <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl p-3">{notice}</div>}
      <ErrorBox message={saveError} />
      {problem && dirty && <p className="text-xs text-amber-700">⚠ {problem}</p>}

      <Card title="Biaya & operasional">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Biaya platform" hint="Dipotong dari dana tur yang cair ke pemandu">
            <NumberInput value={rules.settings.platform_fee_percent} min={0} max={50} suffix="%" onChange={(n) => setS('platform_fee_percent', n)} />
          </Field>
          <Field label="Biaya pemandu tambahan" hint="Per pemandu tambahan saat peserta melebihi rasio">
            <NumberInput value={rules.settings.extra_guide_fee} min={0} suffix="Rp" onChange={(n) => setS('extra_guide_fee', n)} />
          </Field>
          <Field label="Peserta per pemandu" hint="Rasio: lebih dari ini butuh pemandu tambahan">
            <NumberInput value={rules.settings.pax_per_guide} min={1} max={100} suffix="orang" onChange={(n) => setS('pax_per_guide', n)} />
          </Field>
          <Field label="Batas konfirmasi pemandu" hint="Setelah itu booking kedaluwarsa dan dana dikembalikan">
            <NumberInput value={rules.settings.guide_confirm_hours} min={1} max={168} suffix="jam" onChange={(n) => setS('guide_confirm_hours', n)} />
          </Field>
        </div>
      </Card>

      <Card title="Mode pembayaran">
        <Field label="Mode">
          <select value={rules.settings.payment_mode} className={`${inputCls} sm:max-w-xs`} onChange={(e) => setS('payment_mode', e.target.value as Rules['settings']['payment_mode'])}>
            <option value="midtrans">Midtrans (produksi)</option>
            <option value="demo">Uji coba (tanpa payment gateway)</option>
          </select>
        </Field>
        {rules.settings.payment_mode === 'demo' && (
          <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-300 rounded-xl p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Mode uji: pembayaran hanya disimulasikan. Kembalikan ke Midtrans sebelum aplikasi dipakai publik.
          </p>
        )}
      </Card>

      <Card
        title="Diskon rombongan"
        right={<Btn tone="ghost" className="inline-flex items-center gap-1" onClick={() => setRules({ ...rules, tiers: [...rules.tiers, { min_pax: Math.max(0, ...rules.tiers.map((t) => t.min_pax)) + 5, discount_percent: 0, label: '' }] })}><Plus className="w-3.5 h-3.5" /> Tingkat</Btn>}
      >
        <div className="space-y-2">
          {[...rules.tiers].map((t, i) => ({ t, i })).sort((a, b) => a.t.min_pax - b.t.min_pax).map(({ t, i }) => (
            <div key={i} className="grid grid-cols-[90px_90px_1fr_auto] gap-2 items-center">
              <NumberInput value={t.min_pax} min={1} suffix="+ org" onChange={(n) => setRules({ ...rules, tiers: rules.tiers.map((x, idx) => (idx === i ? { ...x, min_pax: n } : x)) })} />
              <NumberInput value={t.discount_percent} min={0} max={90} suffix="%" onChange={(n) => setRules({ ...rules, tiers: rules.tiers.map((x, idx) => (idx === i ? { ...x, discount_percent: n } : x)) })} />
              <input value={t.label} placeholder="Label, mis. Grup Sedang (4-9 orang)" className={inputCls} onChange={(e) => setRules({ ...rules, tiers: rules.tiers.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)) })} />
              <button disabled={t.min_pax === 1} onClick={() => setRules({ ...rules, tiers: rules.tiers.filter((_, idx) => idx !== i) })} className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-red-600 disabled:opacity-30" title={t.min_pax === 1 ? 'Tingkat 1 peserta wajib ada' : 'Hapus'}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-500">Contoh: harga 35.000/orang dengan diskon 20% menjadi {rupiah(35000 * 0.8)}/orang.</p>
      </Card>

      <Card
        title="Kebijakan refund"
        right={<Btn tone="ghost" className="inline-flex items-center gap-1" onClick={() => setRules({ ...rules, policies: [...rules.policies, { min_days_before: 1, refund_percent: 50 }] })}><Plus className="w-3.5 h-3.5" /> Aturan</Btn>}
      >
        <div className="space-y-2">
          {[...rules.policies].map((p, i) => ({ p, i })).sort((a, b) => b.p.min_days_before - a.p.min_days_before).map(({ p, i }) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <NumberInput value={p.min_days_before} min={0} suffix="hari sebelum tur (min.)" onChange={(n) => setRules({ ...rules, policies: rules.policies.map((x, idx) => (idx === i ? { ...x, min_days_before: n } : x)) })} />
              <NumberInput value={p.refund_percent} min={0} max={100} suffix="% refund" onChange={(n) => setRules({ ...rules, policies: rules.policies.map((x, idx) => (idx === i ? { ...x, refund_percent: n } : x)) })} />
              <button disabled={p.min_days_before === 0} onClick={() => setRules({ ...rules, policies: rules.policies.filter((_, idx) => idx !== i) })} className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-red-600 disabled:opacity-30" title={p.min_days_before === 0 ? 'Aturan hari-H wajib ada' : 'Hapus'}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {!problem || !problem.includes('refund') ? (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Yang dilihat pengguna</p>
            <ul className="text-xs text-slate-700 space-y-0.5 list-disc pl-4">
              {describePolicies(rules.policies).map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ) : null}
        <p className="mt-3 text-[11px] text-slate-500">Pembatalan setelah pembayaran: refund dihitung dari aturan dengan jumlah hari terbesar yang masih terpenuhi. Sebelum dibayar tidak ada refund.</p>
      </Card>
    </div>
  );
};
