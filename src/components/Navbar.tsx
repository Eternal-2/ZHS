import React from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ScreenType } from '../store/useAppStore';
import { LogoZH } from './LogoZH';
import { 
  Home, Compass, Receipt, Gift, User, Bell, 
  MessageSquareText, LogOut, MessageSquare, 
  LogIn, LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeScreen, 
    setActiveScreen, 
    toggleAiDrawer, 
    logout 
  } = useAppStore();

  const isGuide = currentUser?.role === 'pemandu';
  const isGuest = !currentUser;

  const handleBrandClick = () => {
    if (isGuide) {
      setActiveScreen('guide-dashboard');
    } else if (currentUser) {
      setActiveScreen('home');
    } else {
      setActiveScreen('welcome');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-3 transition-all shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleBrandClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <LogoZH size={36} withContainer={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[#19324d] font-extrabold text-base tracking-tight group-hover:text-sky-700 transition-colors">
                Zamzam Hidden Spot
              </span>
              {isGuide ? (
                <span className="hidden sm:inline-block text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Portal Pemandu BNSP
                </span>
              ) : (
                <span className="hidden sm:inline-block text-[10px] bg-sky-50 text-[#19324d] border border-sky-200 px-2 py-0.5 rounded-full font-bold">
                  Platform Wisata & Escrow
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              #Guided by Knowledge & Insight
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {/* PEMANDU: KHUSUS OPERASIONAL (TIDAK ADA CARI WISATA, FOKUS TERIMA BOOKING) */}
          {isGuide ? (
            <>
              <button
                onClick={() => setActiveScreen('guide-dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeScreen === 'guide-dashboard'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard Operasional & Booking</span>
              </button>

              <button
                onClick={() => setActiveScreen('direct-chat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeScreen === 'direct-chat'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Wisatawan</span>
              </button>
            </>
          ) : (
            /* WISATAWAN & GUEST: LENGKAP DENGAN BERANDA, JELAJAHI, RIWAYAT BOOKING & VOUCHER */
            <>
              <button
                onClick={() => setActiveScreen(currentUser ? 'home' : 'welcome')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'home' || activeScreen === 'welcome'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                Beranda
              </button>

              <button
                onClick={() => setActiveScreen('explore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'explore'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                Jelajahi
              </button>

              <button
                onClick={() => setActiveScreen('booking-detail')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'booking-detail'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                Riwayat Booking
              </button>

              <button
                onClick={() => setActiveScreen('voucher')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScreen === 'voucher'
                    ? 'text-[#19324d] bg-slate-100 shadow-2xs'
                    : 'text-slate-600 hover:text-[#19324d] hover:bg-slate-50'
                }`}
              >
                Voucher
              </button>
            </>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          
          {/* AI Trigger */}
          <button
            id="nav-ai-btn"
            onClick={() => toggleAiDrawer()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 transition-all text-xs font-bold shadow-2xs"
          >
            <MessageSquareText className="w-4 h-4 text-cyan-600 animate-pulse" />
            <span className="hidden sm:inline">Tanya AI</span>
          </button>

          {/* GUEST: LOGIN & REGISTER BUTTONS */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveScreen('register')}
                className="text-xs font-bold text-[#19324d] px-3.5 py-1.5 rounded-full border border-slate-300 hover:bg-slate-100 transition-colors hidden sm:block"
              >
                Daftar
              </button>
              <button
                id="btn-nav-login-right"
                onClick={() => setActiveScreen('login')}
                className="text-xs font-bold text-white px-4 py-1.5 rounded-full bg-[#19324d] hover:bg-[#122438] shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            </div>
          ) : (
            /* AUTHENTICATED USER (TOURIST OR GUIDE) */
            <>
              {/* Notifikasi Bell */}
              <button
                onClick={() => setActiveScreen('notifications')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
              </button>

              {/* Profile Avatar */}
              <div 
                onClick={() => setActiveScreen(isGuide ? 'guide-dashboard' : 'profile')}
                className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-all"
                title={isGuide ? 'Buka Dashboard Pemandu' : 'Buka Profil'}
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt="Avatar"
                  className={`w-8 h-8 rounded-full object-cover border-2 ${
                    isGuide ? 'border-amber-400' : 'border-slate-300'
                  }`}
                />
                <span className="hidden lg:inline text-xs font-bold text-[#19324d]">
                  {currentUser?.name?.split(' ')[0]}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hidden sm:block"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const { currentUser, activeScreen, setActiveScreen } = useAppStore();

  const isGuide = currentUser?.role === 'pemandu';

  // For Guide: ONLY operational tools (NO search tours / catalog)
  if (isGuide) {
    const guideItems = [
      { label: 'Dashboard', screen: 'guide-dashboard' as ScreenType, icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Chat Wisatawan', screen: 'direct-chat' as ScreenType, icon: <MessageSquare className="w-5 h-5" /> },
      { label: 'Profil Pemandu', screen: 'profile' as ScreenType, icon: <User className="w-5 h-5" /> }
    ];

    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          {guideItems.map((item) => {
            const isActive = activeScreen === item.screen;
            return (
              <button
                key={item.label}
                onClick={() => setActiveScreen(item.screen)}
                className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-colors ${
                  isActive
                    ? 'text-[#19324d] font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // For Tourists & Guests: Standard flow with Beranda, Jelajahi, Riwayat, Voucher, Profil
  const items = [
    { label: 'Beranda', screen: (currentUser ? 'home' : 'welcome') as ScreenType, icon: <Home className="w-5 h-5" /> },
    { label: 'Jelajahi', screen: 'explore' as ScreenType, icon: <Compass className="w-5 h-5" /> },
    { label: 'Riwayat', screen: 'booking-detail' as ScreenType, icon: <Receipt className="w-5 h-5" /> },
    { label: 'Voucher', screen: 'voucher' as ScreenType, icon: <Gift className="w-5 h-5" /> },
    { label: currentUser ? 'Profil' : 'Masuk', screen: (currentUser ? 'profile' : 'login') as ScreenType, icon: currentUser ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.label}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? 'text-[#19324d] font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopFooter: React.FC = () => {
  return (
    <footer className="hidden md:block bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <strong className="text-[#19324d]">© 2026 Zamzam Hidden Spot Booking.</strong>
          <span className="ml-1">Platform SCM Wisata Cagar Budaya & Escrow Dana Aman Terjaga.</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-semibold text-slate-600">
          <a href="#" className="hover:underline">Syarat & Ketentuan</a>
          <a href="#" className="hover:underline">Kebijakan Privasi</a>
          <a href="#" className="hover:underline">Pusat Bantuan</a>
          <a href="#" className="hover:underline">Sertifikasi BNSP</a>
        </div>
      </div>
    </footer>
  );
};
