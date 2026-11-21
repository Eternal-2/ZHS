import React, { useState } from 'react';
import { ImageIcon, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import {
  fetchDestinationsAdmin, fetchVouchers, saveDestination, saveVoucher, setDestinationActive,
  slugify, uploadDestinationImage, validateDestination, validateVoucher
} from '../../services/adminService';
import type { AdminDestination, AdminVoucher } from '../../services/adminService';
import { Btn, Card, Empty, ErrorBox, Field, Modal, PageTitle, Pill, Spinner, inputCls, rupiah, useLoad } from './ui';

const CATEGORY_HINTS = ['Wisata Alam', 'Cagar Budaya', 'Air Panas & Curug', 'Kuliner & UMKM'];

const blankDestination = (): AdminDestination => ({
  slug: '', title: '', category: '', location: '', image_url: '', description: '', highlights: [],
  base_price: 0, is_active: true, meetingPoints: [{ name: '', description: '' }]
});

// ===================== Form destinasi =====================
const DestinationForm: React.FC<{ initial: AdminDestination; onClose: () => void; onSaved: () => void }> = ({ initial, onClose, onSaved }) => {
  const editing = Boolean(initial.id);
  const [d, setD] = useState<AdminDestination>(initial);
  const [highlights, setHighlights] = useState(initial.highlights.join(', '));
  const [slugTouched, setSlugTouched] = useState(editing);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof AdminDestination>(k: K, v: AdminDestination[K]) => setD((p) => ({ ...p, [k]: v }));
  const final = (): AdminDestination => ({ ...d, highlights: highlights.split(',').map((h) => h.trim()).filter(Boolean) });

  const pickImage = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError('');
    try { set('image_url', await uploadDestinationImage(file)); }
    catch (e: any) { setError(e?.message ?? 'Gagal mengunggah gambar'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    const problem = validateDestination(final());
    if (problem) { setError(problem); return; }
    setSaving(true); setError('');
    try { await saveDestination(final()); onSaved(); }
    catch (e: any) { setError(e?.message ?? 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const updateMp = (i: number, patch: Partial<AdminDestination['meetingPoints'][number]>) =>
    set('meetingPoints', d.meetingPoints.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));

  return (
    <Modal title={editing ? 'Ubah Destinasi' : 'Destinasi Baru'} onClose={onClose}>
      <div className="space-y-4">
        <ErrorBox message={error} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nama destinasi *">
            <input value={d.title} className={inputCls} onChange={(e) => {
              set('title', e.target.value);
              if (!slugTouched) set('slug', slugify(e.target.value));
            }} />
          </Field>
          <Field label="Slug (alamat unik) *" hint={editing ? 'Tidak dapat diubah setelah dibuat' : 'Terisi otomatis dari nama'}>
            <input value={d.slug} disabled={editing} className={inputCls} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }} />
          </Field>
          <Field label="Kategori *">
            <input list="kategori-destinasi" value={d.category} className={inputCls} onChange={(e) => set('category', e.target.value)} />
            <datalist id="kategori-destinasi">{CATEGORY_HINTS.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Lokasi *">
            <input value={d.location} className={inputCls} placeholder="Kota, Provinsi" onChange={(e) => set('location', e.target.value)} />
          </Field>
          <Field label="Harga per orang (Rp) *">
            <input type="number" min={0} value={d.base_price} className={inputCls} onChange={(e) => set('base_price', Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <label className="flex items-center gap-2 text-sm py-2.5">
              <input type="checkbox" checked={d.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              Tampil di aplikasi
            </label>
          </Field>
        </div>

        <Field label="Gambar" hint="Tempel alamat gambar, atau unggah (otomatis diperkecil, maks 5 MB)">
          <div className="flex gap-2">
            <input value={d.image_url} placeholder="https://…" className={inputCls} onChange={(e) => set('image_url', e.target.value)} />
            <label className={`shrink-0 px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-4 h-4" /> {uploading ? 'Mengunggah…' : 'Unggah'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { void pickImage(e.target.files?.[0]); e.target.value = ''; }} />
            </label>
          </div>
          {d.image_url && <img src={d.image_url} alt="Pratinjau" className="mt-2 h-32 rounded-xl border border-slate-200 object-cover" />}
        </Field>

        <Field label="Deskripsi">
          <textarea value={d.description} rows={4} className={inputCls} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="Sorotan" hint="Pisahkan dengan koma, mis. Pemandangan matahari terbit, Spot foto">
          <input value={highlights} className={inputCls} onChange={(e) => setHighlights(e.target.value)} />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Titik kumpul</span>
            <Btn tone="ghost" onClick={() => set('meetingPoints', [...d.meetingPoints, { name: '', description: '' }])} className="inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Tambah
            </Btn>
          </div>
          {d.meetingPoints.map((m, i) => (
            <div key={m.id ?? `new-${i}`} className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-start">
              <input value={m.name} placeholder="Nama titik" className={inputCls} onChange={(e) => updateMp(i, { name: e.target.value })} />
              <input value={m.description} placeholder="Keterangan (opsional)" className={inputCls} onChange={(e) => updateMp(i, { description: e.target.value })} />
              <button onClick={() => set('meetingPoints', d.meetingPoints.filter((_, idx) => idx !== i))} className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-red-600" title="Hapus titik">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Btn tone="ghost" onClick={onClose}>Batal</Btn>
          <Btn disabled={saving || uploading} onClick={() => void save()}>{saving ? 'Menyimpan…' : 'Simpan'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

export const DestinationsTab: React.FC = () => {
  const { data, loading, error, reload } = useLoad(fetchDestinationsAdmin, []);
  const [editing, setEditing] = useState<AdminDestination | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const toggle = async (d: AdminDestination) => {
    setBusy(true); setActionError('');
    try { await setDestinationActive(d.id!, !d.is_active); await reload(); }
    catch (e: any) { setActionError(e?.message ?? 'Gagal mengubah status'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="Destinasi"
        subtitle="Katalog wisata. Perubahan tampil di aplikasi saat pengguna membukanya kembali."
        right={
          <div className="flex gap-2">
            <button onClick={reload} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Muat ulang">
              <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Btn onClick={() => setEditing(blankDestination())} className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Destinasi Baru</Btn>
          </div>
        }
      />
      <ErrorBox message={error || actionError} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Belum ada destinasi. Klik "Destinasi Baru".</Empty> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {(data ?? []).map((d) => (
            <div key={d.id} className={`bg-white border rounded-2xl overflow-hidden flex ${d.is_active ? 'border-slate-200' : 'border-slate-200 opacity-70'}`}>
              <div className="w-28 shrink-0 bg-slate-100 flex items-center justify-center">
                {d.image_url ? <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
              </div>
              <div className="p-3 min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-bold text-slate-800 truncate">{d.title}</p>
                  {!d.is_active && <Pill cls="bg-slate-200 text-slate-600">Nonaktif</Pill>}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{d.category} · {d.location}</p>
                <p className="text-xs font-bold text-[#19324d]">{rupiah(d.base_price)} <span className="font-normal text-slate-400">/ orang</span></p>
                <p className="text-[10px] text-slate-400">⭐ {(d.rating_avg ?? 0).toFixed(1)} · {d.reviews_count ?? 0} ulasan · {d.meetingPoints.length} titik kumpul</p>
                <div className="flex gap-1.5 pt-1">
                  <Btn tone="ghost" onClick={() => setEditing(d)}>Ubah</Btn>
                  <Btn tone={d.is_active ? 'danger' : 'success'} disabled={busy} onClick={() => void toggle(d)}>{d.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <DestinationForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void reload(); }} />}
    </div>
  );
};

// ===================== Voucher =====================
type DiscountKind = 'none' | 'amount' | 'percent';
const blankVoucher = (): AdminVoucher => ({ code: '', title: '', points_cost: 0, discount_amount: null, discount_percent: null, is_active: true, expires_at: null });

const VoucherForm: React.FC<{ initial: AdminVoucher; isNew: boolean; onClose: () => void; onSaved: () => void }> = ({ initial, isNew, onClose, onSaved }) => {
  const [v, setV] = useState<AdminVoucher>(initial);
  const [kind, setKind] = useState<DiscountKind>(initial.discount_amount != null ? 'amount' : initial.discount_percent != null ? 'percent' : 'none');
  const [value, setValue] = useState<number>(initial.discount_amount ?? initial.discount_percent ?? 0);
  const [expires, setExpires] = useState(initial.expires_at ? initial.expires_at.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const build = (): AdminVoucher => ({
    ...v, code: v.code.trim().toUpperCase(),
    discount_amount: kind === 'amount' ? value : null,
    discount_percent: kind === 'percent' ? value : null,
    expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null
  });

  const save = async () => {
    const final = build();
    const problem = validateVoucher(final);
    if (problem) { setError(problem); return; }
    setSaving(true); setError('');
    try { await saveVoucher(final); onSaved(); }
    catch (e: any) { setError(e?.message ?? 'Gagal menyimpan voucher'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={isNew ? 'Voucher Baru' : 'Ubah Voucher'} onClose={onClose}>
      <div className="space-y-4">
        <ErrorBox message={error} />
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Kode *" hint={isNew ? 'Huruf besar/angka, 3-30 karakter' : 'Kode tidak dapat diubah'}>
            <input value={v.code} disabled={!isNew} className={`${inputCls} font-mono`} onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Judul *"><input value={v.title} className={inputCls} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
          <Field label="Biaya poin" hint="0 = gratis / kode promo">
            <input type="number" min={0} value={v.points_cost} className={inputCls} onChange={(e) => setV({ ...v, points_cost: Number(e.target.value) })} />
          </Field>
          <Field label="Berlaku sampai" hint="Kosongkan jika tanpa batas">
            <input type="date" value={expires} className={inputCls} onChange={(e) => setExpires(e.target.value)} />
          </Field>
          <Field label="Jenis potongan">
            <select value={kind} className={inputCls} onChange={(e) => setKind(e.target.value as DiscountKind)}>
              <option value="none">Tanpa potongan harga (hadiah lain)</option>
              <option value="amount">Potongan Rupiah</option>
              <option value="percent">Diskon persen</option>
            </select>
          </Field>
          {kind !== 'none' && (
            <Field label={kind === 'amount' ? 'Nilai potongan (Rp)' : 'Persen diskon (0-100)'}>
              <input type="number" min={0} value={value} className={inputCls} onChange={(e) => setValue(Number(e.target.value))} />
            </Field>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.is_active} onChange={(e) => setV({ ...v, is_active: e.target.checked })} /> Aktif</label>
        <p className="text-[11px] text-slate-500">Kode berawalan <strong>POIN</strong> dipakai untuk hadiah di tab Poin dan tidak tampil di daftar voucher.</p>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <Btn tone="ghost" onClick={onClose}>Batal</Btn>
          <Btn disabled={saving} onClick={() => void save()}>{saving ? 'Menyimpan…' : 'Simpan'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

export const VouchersTab: React.FC = () => {
  const { data, loading, error, reload } = useLoad(fetchVouchers, []);
  const [editing, setEditing] = useState<{ v: AdminVoucher; isNew: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const toggle = async (v: AdminVoucher) => {
    setBusy(true); setActionError('');
    try { await saveVoucher({ ...v, is_active: !v.is_active }); await reload(); }
    catch (e: any) { setActionError(e?.message ?? 'Gagal mengubah status'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <PageTitle
        title="Voucher"
        subtitle="Voucher yang bisa ditukar dengan poin atau dipakai sebagai kode promo"
        right={<Btn onClick={() => setEditing({ v: blankVoucher(), isNew: true })} className="inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Voucher Baru</Btn>}
      />
      <ErrorBox message={error || actionError} />
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty>Belum ada voucher.</Empty> : (
        <div className="space-y-2">
          {(data ?? []).map((v) => {
            const expired = v.expires_at && new Date(v.expires_at) < new Date();
            return (
              <div key={v.code} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#19324d] bg-slate-100 px-2 py-0.5 rounded">{v.code}</span>
                    <Pill cls={v.is_active && !expired ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}>{expired ? 'Kedaluwarsa' : v.is_active ? 'Aktif' : 'Nonaktif'}</Pill>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-1">{v.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {v.points_cost > 0 ? `${v.points_cost.toLocaleString('id-ID')} poin` : 'Gratis'} ·{' '}
                    {v.discount_amount != null ? `potongan ${rupiah(v.discount_amount)}` : v.discount_percent != null ? `diskon ${v.discount_percent}%` : 'tanpa potongan harga'}
                    {v.expires_at ? ` · sampai ${new Date(v.expires_at).toLocaleDateString('id-ID')}` : ''}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Btn tone="ghost" onClick={() => setEditing({ v, isNew: false })}>Ubah</Btn>
                  <Btn tone={v.is_active ? 'danger' : 'success'} disabled={busy} onClick={() => void toggle(v)}>{v.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editing && <VoucherForm initial={editing.v} isNew={editing.isNew} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void reload(); }} />}
      <Card><p className="text-[11px] text-slate-500">Menonaktifkan voucher tidak memengaruhi voucher yang sudah ditukar pengguna sebelumnya.</p></Card>
    </div>
  );
};
