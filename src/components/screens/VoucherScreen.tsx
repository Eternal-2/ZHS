import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ArrowLeft, CheckCircle2, Copy, Check,
  Gift, Tag, Zap, Trophy, Star, ChevronRight, X
} from 'lucide-react';

type ActiveTab = 'voucher' | 'poin';
type PointsConfirmItem = { title: string; points: number; value: string } | null;

const POINT_CATALOG = [
  {
    id: 'p1',
    title: 'Diskon Rp 25.000',
    points: 250,
    value: 'Rp 25.000',
    desc: 'Potongan langsung untuk booking tur berikutnya',
    icon: '🎟️',
    color: 'sky'
  },
  {
    id: 'p2',
    title: 'Diskon Rp 50.000',
    points: 500,
    value: 'Rp 50.000',
    desc: 'Potongan lebih besar untuk perjalanan spesial Anda',
    icon: '✨',
    color: 'violet'
  },
  {
    id: 'p3',
    title: 'Gratis Kuliner Lokal',
    points: 300,
    value: 'Voucher Makan',
    desc: 'Nikmati kuliner otentik mitra UMKM ZHS gratis',
    icon: '🍜',
    color: 'amber'
  },
  {
    id: 'p4',
    title: 'Upgrade Layanan Pemandu',
    points: 800,
    value: 'Premium Guide',
    desc: 'Upgrade ke pemandu senior BNSP Level 2',
    icon: '⭐',
    color: 'emerald'
  }
];

const LEVEL_TIERS = [
  { name: 'Explorer', minPoints: 0, maxPoints: 999, color: 'sky', icon: '🧭' },
  { name: 'Adventurer', minPoints: 1000, maxPoints: 2999, color: 'violet', icon: '⛰️' },
  { name: 'Legend', minPoints: 3000, maxPoints: Infinity, color: 'amber', icon: '🏆' }
];

export const VoucherScreen: React.FC = () => {
  const { pointsBalance, redeemVoucher, activeScreen, setActiveScreen, appliedVoucherCode } = useAppStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('voucher');
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; title: string; cost: number; code: string } | null>(null);
  const [pointsConfirm, setPointsConfirm] = useState<PointsConfirmItem>(null);
  const [copied, setCopied] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState<string | null>(null);

  const currentLevel = LEVEL_TIERS.find(t => pointsBalance >= t.minPoints && pointsBalance <= t.maxPoints) || LEVEL_TIERS[0];
  const nextLevel = LEVEL_TIERS[LEVEL_TIERS.indexOf(currentLevel) + 1];
  const progressPct = nextLevel
    ? Math.min(100, ((pointsBalance - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const vouchers = [
    {
      id: 'v1',
      title: 'Diskon 10% Tur Berikutnya',
      points: 500,
      validUntil: '31 Des 2026',
      desc: 'Mendukung pelestarian tradisi lokal di Desa Wisata melalui program pemberdayaan masyarakat.',
      code: 'ZAMZAM10TUR',
      minTrx: 'Min. transaksi Rp 200.000'
    },
    {
      id: 'v2',
      title: 'Gratis Souvenir Kerajinan Tangan',
      points: 800,
      validUntil: 'Tersedia di lokasi pilihan',
      desc: 'Membantu pengrajin bambu lokal untuk terus berkarya dan menjaga warisan leluhur kita.',
      code: 'ZAMZAMSOUVENIR',
      minTrx: 'Berlaku di destinasi pilihan'
    },
    {
      id: 'v3',
      title: 'Potongan Harga Makan Siang',
      points: 300,
      validUntil: '30 Nov 2026',
      desc: 'Setiap potongan harga membantu UMKM kuliner lokal menyajikan cita rasa otentik nusantara.',
      code: 'ZAMZAMKULINER',
      minTrx: 'Min. transaksi Rp 100.000'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePointsRedeem = (item: typeof POINT_CATALOG[0]) => {
    if (pointsBalance < item.points) {
      alert(`Poin tidak cukup! Kekurangan: ${item.points - pointsBalance} poin`);
      return;
    }
    setPointsConfirm({ title: item.title, points: item.points, value: item.value });
  };

  const confirmPointsRedeem = () => {
    if (!pointsConfirm) return;
    redeemVoucher(pointsConfirm.points, `ZHS-POIN-${Date.now()}`);
    setPointsRedeemed(pointsConfirm.title);
    setPointsConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-5">

        {/* Page Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            Voucher &amp; Hadiah
          </h1>
          <div className="w-16" />
        </div>

        {/* SUCCESS REDEMPTION VIEW */}
        {activeScreen === 'voucher-success' ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-sm animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#19324d]">Penukaran Berhasil!</h2>
              <p className="text-xs text-slate-500 mt-1">Voucher Anda siap digunakan untuk tur berikutnya.</p>
            </div>
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl space-y-3 max-w-sm mx-auto">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">KODE VOUCHER</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-black text-[#19324d] font-mono">
                  {appliedVoucherCode || 'ZAMZAM50K'}
                </span>
                <button
                  onClick={() => handleCopy(appliedVoucherCode || 'ZAMZAM50K')}
                  className="p-1 text-slate-500 hover:text-[#19324d]"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-xs font-mono text-slate-400 pt-1 tracking-widest">||||| | |||| ||| |||| | ||</div>
            </div>
            <button
              onClick={() => setActiveScreen('home')}
              className="w-full max-w-sm py-3.5 bg-[#19324d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md mx-auto block"
            >
              Ke Beranda Sekarang
            </button>
          </div>
        ) : (
          <>
            {/* SALDO POIN CARD */}
            <div className="bg-gradient-to-br from-[#19324d] to-[#122438] rounded-3xl p-5 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-sky-200 block font-medium">Saldo Poin Anda</span>
                  <div className="text-3xl sm:text-4xl font-extrabold flex items-center gap-2 mt-1">
                    <span>{pointsBalance.toLocaleString('id-ID')}</span>
                    <span className="text-sm font-normal text-sky-200">Poin</span>
                  </div>
                  <div className="text-xs text-sky-200/90 pt-1 flex items-center gap-1.5">
                    <span>Setara dengan</span>
                    <strong className="text-white">Rp {(pointsBalance * 10).toLocaleString('id-ID')}</strong>
                  </div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl p-3 border border-white/20">
                  <span className="text-xl">{currentLevel.icon}</span>
                  <p className="text-[10px] font-bold text-sky-200 mt-1 uppercase tracking-wider">{currentLevel.name}</p>
                </div>
              </div>

              {/* Level Progress Bar */}
              {nextLevel && (
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-sky-200 mb-1">
                    <span>{currentLevel.name}</span>
                    <span>→ {nextLevel.name} ({nextLevel.minPoints - pointsBalance} poin lagi)</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TABS */}
            <div className="flex bg-slate-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('voucher')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'voucher'
                    ? 'bg-white text-[#19324d] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Voucher</span>
              </button>
              <button
                onClick={() => setActiveTab('poin')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'poin'
                    ? 'bg-white text-[#19324d] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Poin</span>
              </button>
            </div>

            {/* ─── TAB VOUCHER ─── */}
            {activeTab === 'voucher' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#19324d]">Voucher Tersedia</h3>
                  <button className="text-xs text-slate-500 hover:underline flex items-center gap-1">
                    <span>Riwayat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {vouchers.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Dashed separator line */}
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h4 className="font-extrabold text-sm text-[#19324d]">{v.title}</h4>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Berlaku s.d. {v.validUntil}
                            </span>
                          </div>
                          <div className="p-2 bg-sky-50 rounded-2xl text-center min-w-[58px] border border-sky-100">
                            <span className="text-sm font-black text-[#19324d] block">{v.points}</span>
                            <span className="text-[9px] text-slate-500 uppercase font-bold">Pts</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                          <span>⚠️</span>
                          <span className="font-semibold">{v.minTrx}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ open: true, title: v.title, cost: v.points, code: v.code })}
                          className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs rounded-full shadow-sm active:scale-98 transition-all"
                        >
                          Tukarkan Voucher
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB POIN ─── */}
            {activeTab === 'poin' && (
              <div className="space-y-4">
                {/* Level Tiers */}
                <div className="grid grid-cols-3 gap-2">
                  {LEVEL_TIERS.map((tier) => {
                    const isActive = tier.name === currentLevel.name;
                    return (
                      <div
                        key={tier.name}
                        className={`p-3 rounded-2xl text-center border-2 transition-all ${
                          isActive
                            ? 'border-[#19324d] bg-[#19324d]/5'
                            : 'border-slate-200 bg-white opacity-60'
                        }`}
                      >
                        <span className="text-xl">{tier.icon}</span>
                        <p className="text-[10px] font-black text-[#19324d] mt-1 uppercase">{tier.name}</p>
                        <p className="text-[9px] text-slate-400">
                          {tier.maxPoints === Infinity ? `${tier.minPoints}+` : `${tier.minPoints}-${tier.maxPoints}`}
                        </p>
                        {isActive && (
                          <span className="text-[8px] bg-[#19324d] text-white px-1.5 py-0.5 rounded-full font-bold mt-1 block">
                            LEVEL KAMU
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Redeem Success Banner */}
                {pointsRedeemed && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-800">Penukaran Poin Berhasil!</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">{pointsRedeemed} telah ditambahkan ke akun Anda</p>
                    </div>
                    <button onClick={() => setPointsRedeemed(null)} className="text-emerald-400 hover:text-emerald-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Katalog Penukaran */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[#19324d]">Katalog Penukaran</h3>
                    <button className="text-xs text-slate-500 hover:underline flex items-center gap-1">
                      <span>Riwayat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {POINT_CATALOG.map((item) => {
                      const canRedeem = pointsBalance >= item.points;
                      return (
                        <div
                          key={item.id}
                          className={`bg-white border rounded-2xl p-4 space-y-3 shadow-sm transition-all ${
                            canRedeem ? 'border-slate-200 hover:shadow-md hover:border-[#19324d]/30' : 'border-slate-200 opacity-70'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                              {item.icon}
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-[#19324d] block">{item.points}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-bold">Poin</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#19324d] leading-tight">{item.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePointsRedeem(item)}
                            disabled={!canRedeem}
                            className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all ${
                              canRedeem
                                ? 'bg-[#19324d] hover:bg-[#122438] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {canRedeem ? 'Tukarkan Poin' : `Kurang ${item.points - pointsBalance} Poin`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CONFIRM VOUCHER MODAL */}
      {confirmModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-xl">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#19324d]">{confirmModal.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Konfirmasi penukaran voucher</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Saldo Poin Anda</span>
                <span className="font-bold text-slate-900">{pointsBalance} 💎</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Harga Voucher</span>
                <span>- {confirmModal.cost} 💎</span>
              </div>
              <div className="flex justify-between text-[#19324d] font-extrabold pt-1 border-t border-slate-200">
                <span>Sisa Poin</span>
                <span>{Math.max(0, pointsBalance - confirmModal.cost)} 💎</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  redeemVoucher(confirmModal.cost, confirmModal.code);
                  setConfirmModal(null);
                }}
                className="w-full py-3 bg-[#19324d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md"
              >
                Konfirmasi Penukaran
              </button>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-full py-2 text-xs text-slate-500 font-semibold hover:underline"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM POINTS REDEMPTION MODAL */}
      {pointsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#19324d]">{pointsConfirm.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Senilai {pointsConfirm.value}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Saldo Poin</span>
                <span className="font-bold text-slate-900">{pointsBalance} 💎</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>Poin Ditukar</span>
                <span>- {pointsConfirm.points} 💎</span>
              </div>
              <div className="flex justify-between text-[#19324d] font-extrabold pt-1 border-t border-slate-200">
                <span>Sisa Poin</span>
                <span>{Math.max(0, pointsBalance - pointsConfirm.points)} 💎</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={confirmPointsRedeem}
                className="w-full py-3 bg-[#19324d] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md"
              >
                Konfirmasi Tukar Poin
              </button>
              <button
                type="button"
                onClick={() => setPointsConfirm(null)}
                className="w-full py-2 text-xs text-slate-500 font-semibold hover:underline"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
