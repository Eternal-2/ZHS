import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, Star, Clock, Ticket, Gift, Moon, 
  Bell, Globe, HelpCircle, UserCheck, LogOut, Check, ChevronRight, Camera 
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    logout, 
    setActiveScreen, 
    darkMode, 
    setDarkMode, 
    selectedLanguage, 
    setSelectedLanguage 
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [isGuideMode, setIsGuideMode] = useState(false);

  // Edit profile form state (exact as Figma Page 18)
  const [name, setName] = useState(currentUser?.name || 'Niceguymo');
  const [gender, setGender] = useState('Laki-laki');
  const [birthDate, setBirthDate] = useState('08/12/1995');
  const [phone, setPhone] = useState(currentUser?.phone || '+62 812 3456 7890');
  const [email, setEmail] = useState(currentUser?.email || 'bigmompruy@gmail.com');
  const [address, setAddress] = useState(currentUser?.address || 'Jl. Melati No. 45');
  const [city, setCity] = useState(currentUser?.city || 'Jakarta');
  const [country, setCountry] = useState(currentUser?.country || 'Indonesia');
  const [emergencyName, setEmergencyName] = useState(currentUser?.emergencyContact?.name || 'Windah Basudara');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyContact?.phone || '+62 811 2222 3333');

  const languages = ['Bahasa Indonesia', 'English', 'Arabic', 'Japanese', 'Korean', 'French'];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      email,
      address,
      city,
      country,
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone
      }
    });
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen pb-24 flex items-center justify-center ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
        <div className="max-w-md mx-auto px-6 py-12 text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-3xl">
            👤
          </div>
          <h2 className="text-xl font-black text-[#19324d] dark:text-white">
            Belum Masuk ke Akun
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Silakan masuk sebagai Wisatawan atau Pemandu untuk melihat profil, poin loyalitas, e-tiket dan voucher Anda.
          </p>
          <button
            onClick={() => setActiveScreen('login')}
            className="w-full py-3.5 bg-[#19324d] hover:bg-[#122438] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-md transition-all"
          >
            Masuk ke Akun
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header bar */}
        <div className={`flex items-center justify-between pb-2 border-b ${
          darkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <button
            onClick={() => isEditing ? setIsEditing(false) : setActiveScreen('home')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isEditing ? 'Batal' : 'Kembali ke Beranda'}</span>
          </button>

          <h1 className="text-base sm:text-lg font-black">
            {isEditing ? 'Edit Profil' : 'Profil Pengguna'}
          </h1>

          <div className="w-8" />
        </div>
        
        {/* EDIT PROFILE FORM (exact as Figma Page 18) */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in">
            {/* Avatar upload */}
            <div className="text-center space-y-2">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={currentUser?.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-amber-400 shadow-md"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#19324d] text-white shadow"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <button type="button" className="text-xs font-bold text-sky-600 hover:underline">
                Ubah Foto
              </button>
            </div>

            {/* Informasi Pribadi */}
            <div className={`p-5 rounded-3xl border space-y-3.5 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#19324d] dark:text-sky-400">
                Informasi Pribadi
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nomor HP</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Alamat</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Kota</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Negara</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Kontak Darurat (exact as Figma Page 18) */}
            <div className={`p-5 rounded-3xl border space-y-3 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
                🚨 Kontak Darurat
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Kontak Darurat</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nomor Kontak Darurat</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-200 text-slate-800 font-bold text-xs rounded-full"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#19324d] text-white font-bold text-xs rounded-full shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        ) : (
          /* PROFILE DASHBOARD (exact as Figma Page 14 & 15) */
          <>
            {/* User Header */}
            <div className="text-center space-y-3">
              <img
                src={currentUser?.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 mx-auto shadow-md"
              />
              <div>
                <h2 className="text-xl font-extrabold text-[#19324d] dark:text-white">
                  {currentUser?.name || 'Niceguymo'}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-4 py-1.5 bg-[#19324d] text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm hover:bg-[#122438]"
                >
                  Kelola Profil
                </button>
              </div>
            </div>

            {/* Points Bar (exact as Figma Page 14) */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500 fill-blue-500" />
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {currentUser?.points.toLocaleString('id-ID')} Poin
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="w-3/5 h-full bg-[#19324d] dark:bg-blue-500" />
              </div>
              <span className="text-[11px] text-slate-500 font-semibold block">
                {currentUser?.level || 'Level 5: Heritage Expert'}
              </span>
            </div>

            {/* Aktivitas Saya (exact as Figma Page 14) */}
            <div className={`p-4 rounded-3xl border space-y-1 shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                AKTIVITAS SAYA
              </span>

              <button
                onClick={() => setActiveScreen('booking-detail')}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Riwayat Booking</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('live-tour')}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">E-Tiket Saya</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveScreen('voucher')}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Voucher & Rewards</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Pengaturan (exact as Figma Page 14) */}
            <div className={`p-4 rounded-3xl border space-y-1 shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                PENGATURAN
              </span>

              {/* Mode Gelap Switch */}
              <div className="w-full p-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Mode Gelap</span>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-5 h-5 accent-[#19324d] cursor-pointer"
                />
              </div>

              {/* Notifikasi */}
              <button
                onClick={() => setActiveScreen('notifications')}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Notifikasi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Bahasa */}
              <button
                onClick={() => setLangModalOpen(true)}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Bahasa</span>
                </div>
                <span className="text-xs text-slate-400">{selectedLanguage}</span>
              </button>
            </div>

            {/* Bantuan */}
            <div className={`p-4 rounded-3xl border space-y-1 shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                BANTUAN
              </span>

              <button
                onClick={() => setActiveScreen('help-center')}
                className="w-full p-3 rounded-2xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold">Pusat Bantuan (FAQ)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Mode Pengguna / Switch Pemandu (exact as Figma Page 14 & 17) */}
            <div className={`p-5 rounded-3xl border space-y-2 shadow-sm ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                MODE PENGGUNA
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-xs block text-[#19324d] dark:text-white">Ganti Mode Pemandu</strong>
                  <span className="text-[11px] text-slate-500">
                    Belum punya akun pemandu? <button onClick={() => setActiveScreen('register')} className="underline font-bold text-[#19324d] dark:text-sky-400">Daftar Pemandu</button>
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isGuideMode}
                  onChange={(e) => {
                    setIsGuideMode(e.target.checked);
                    if (e.target.checked) setActiveScreen('guide-dashboard');
                  }}
                  className="w-5 h-5 accent-[#19324d] cursor-pointer"
                />
              </div>
            </div>

            {/* Logout (exact as Figma Page 14) */}
            <button
              onClick={logout}
              className="w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        )}

      </div>

      {/* MODAL PILIH BAHASA (exact as Figma Page 13) */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-[#19324d] dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Pilih Bahasa
            </h3>

            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setLangModalOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors ${
                    selectedLanguage === lang
                      ? 'bg-sky-50 dark:bg-slate-800 text-[#19324d] dark:text-sky-400 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{lang}</span>
                  {selectedLanguage === lang && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
