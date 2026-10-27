import { useAppStore } from '../store/useAppStore';
import type { ScreenType } from '../store/useAppStore';
import { Smartphone, Monitor, Tablet, Layers, Sparkles, Moon, Sun } from 'lucide-react';

interface DevicePreviewFrameProps {
  children: React.ReactNode;
}

export const DevicePreviewFrame: React.FC<DevicePreviewFrameProps> = ({ children }) => {
  const { 
    devicePreview, 
    setDevicePreview, 
    activeScreen, 
    setActiveScreen, 
    darkMode, 
    setDarkMode 
  } = useAppStore();

  const screenOptions: { id: ScreenType; label: string }[] = [
    { id: 'welcome', label: '1. Welcome Screen (Figma Hal 1)' },
    { id: 'login', label: '2. Login Pengguna (Figma Hal 2-3)' },
    { id: 'register', label: '3. Daftar & OTP 6-Digit (Figma Hal 8-11)' },
    { id: 'home', label: '4. Beranda / Home (Figma Hal 19)' },
    { id: 'explore', label: '5. Search Tour & Filter (Figma Hal 20-25)' },
    { id: 'detail-tour', label: '6. Detail Tour Situ Buleud (Figma Hal 30, 59)' },
    { id: 'detail-destinasi', label: '7. Detail Destinasi Air Mancur (Figma Hal 31)' },
    { id: 'booking-confirm', label: '8. Konfirmasi Booking (Figma Hal 33, 59, 60)' },
    { id: 'payment-qris', label: '9. Pembayaran QRIS (Figma Hal 42, 62)' },
    { id: 'payment-success', label: '10. Pembayaran Berhasil & Invoice (Figma Hal 46, 63)' },
    { id: 'booking-detail', label: '11. Status Booking & Tracker (Figma Hal 47, 70)' },
    { id: 'live-tour', label: '12. E-Tiket & Live Tour (Figma Hal 53, 54, 68)' },
    { id: 'review', label: '13. Beri Ulasan & Tip QRIS (Figma Hal 55, 72)' },
    { id: 'voucher', label: '14. Voucher & Saldo Poin (Figma Hal 27, 29, 58)' },
    { id: 'profile', label: '15. Profil & Edit Profil (Figma Hal 14, 18)' },
    { id: 'help-center', label: '16. Pusat Bantuan & FAQ (Figma Hal 5, 82)' },
    { id: 'contact-admin', label: '17. Hubungi Admin & Live Chat (Figma Hal 6, 80)' },
    { id: 'notifications', label: '18. Notifikasi (Figma Hal 12)' },
    { id: 'smart-match', label: '19. Smart Match Engine v2.0 (PDF Hal 6)' },
    { id: 'guide-dashboard', label: '20. Dashboard Pemandu (PDF Hal 4)' }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* FLOATING TOP RESPONSIVE PREVIEW CONTROLLER */}
      <aside 
        aria-label="Responsive Controller Toolbar" 
        className="sticky top-0 z-50 bg-[#14263c] border-b border-slate-700/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md text-white"
      >
        {/* Left: Quick Screen Jumper */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold hidden sm:inline text-white">Navigasi Halaman Figma:</span>
          <select
            value={activeScreen}
            onChange={(e) => setActiveScreen(e.target.value as ScreenType)}
            className="bg-[#0b1726] border border-slate-600 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {screenOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Device Viewport Switcher & Dark Mode */}
        <div className="flex items-center gap-2">
          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg bg-[#0b1726] border border-slate-600 text-slate-300 hover:text-white"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-300" />}
          </button>

          {/* Device Mockup Switcher */}
          <div className="flex items-center gap-1 bg-[#0b1726] p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setDevicePreview('responsive')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                devicePreview === 'responsive'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop Adaptive View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop Adaptif</span>
            </button>

            <button
              onClick={() => setDevicePreview('tablet-mockup')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                devicePreview === 'tablet-mockup'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDevicePreview('mobile-mockup')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                devicePreview === 'mobile-mockup'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Figma Mobile (1:1)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Figma Mobile (1:1)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* RENDER BODY ACCORDING TO SELECTED PREVIEW MODE */}
      <main className="flex-1 flex justify-center items-center w-full">
        {devicePreview === 'responsive' && (
          <div className="w-full min-h-screen">
            {children}
          </div>
        )}

        {devicePreview === 'mobile-mockup' && (
          <div className="py-8 px-4 flex justify-center items-center w-full bg-[#07111c] min-h-screen">
            {/* iPhone Mockup Frame */}
            <div className="w-[375px] h-[812px] bg-white dark:bg-slate-900 rounded-[50px] border-[12px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative ring-1 ring-white/10">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
              </div>

              {/* Mobile Viewport Screen */}
              <div className="flex-1 overflow-y-auto no-scrollbar pt-6 relative flex flex-col justify-between">
                {children}
              </div>

              {/* iOS Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/40 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        )}

        {devicePreview === 'tablet-mockup' && (
          <div className="py-8 px-4 flex justify-center items-center w-full bg-[#07111c] min-h-screen">
            {/* iPad Mockup Frame */}
            <div className="w-[768px] h-[960px] bg-white dark:bg-slate-900 rounded-[36px] border-[14px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative ring-1 ring-white/10">
              <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col justify-between">
                {children}
              </div>
              <div className="w-32 h-1 bg-slate-400/40 rounded-full mx-auto my-2 shrink-0 pointer-events-none" />
            </div>
          </div>
        )}
      </main>

    </div>
  );
};
