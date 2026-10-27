import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  ArrowLeft, Send, ShieldCheck, Phone, CheckCheck, 
  MapPin, Calendar, Clock, Ticket, AlertCircle 
} from 'lucide-react';

export const DirectChatScreen: React.FC = () => {
  const { 
    currentUser, 
    activeChatBookingId, 
    userBookings, 
    activeBooking, 
    directChatMessages, 
    sendDirectChatMessage, 
    setActiveScreen 
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Identify targeted booking
  const booking = userBookings.find(b => b.id === activeChatBookingId) || activeBooking;
  const isGuideUser = currentUser?.role === 'pemandu';

  // Info of the person on the other end
  const partnerName = isGuideUser 
    ? 'Niceguymo (Wisatawan)' 
    : (booking.guide?.name || 'Bambang Pamungkas (Pemandu)');

  const partnerAvatar = isGuideUser
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    : (booking.guide?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80');

  const partnerSubtitle = isGuideUser
    ? 'Wisatawan Terverifikasi • 3 Peserta'
    : 'Pemandu Resmi BNSP • Verified Badge';

  // Filter messages for this specific booking
  const currentMessages = directChatMessages.filter(
    m => m.bookingId === (booking.id || activeChatBookingId)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendDirectChatMessage(booking.id || activeChatBookingId, inputMessage.trim());
    setInputMessage('');
  };

  const handleQuickChip = (text: string) => {
    sendDirectChatMessage(booking.id || activeChatBookingId, text);
  };

  const touristQuickReplies = [
    'Halo kak, patokan titik kumpul di mana?',
    'Saya sudah tiba di lokasi meeting point.',
    'Apakah perlu bawa perlengkapan khusus?',
    'Bisa infokan estimasi waktu mulai tur?'
  ];

  const guideQuickReplies = [
    'Halo kak, saya sudah standby di titik kumpul ZHS.',
    'Semua tiket masuk & konsumsi UMKM sudah siap.',
    'Bisa infokan jika sudah mendekati lokasi ya.',
    'Silakan siapkan kode QR tiket untuk check-in.'
  ];

  const quickReplies = isGuideUser ? guideQuickReplies : touristQuickReplies;

  const handleBack = () => {
    if (isGuideUser) {
      setActiveScreen('guide-dashboard');
    } else {
      setActiveScreen('booking-detail');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between">
      
      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-[#19324d] hover:bg-slate-100 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-extrabold text-[#19324d]">
                  {partnerName}
                </h2>
                {!isGuideUser && (
                  <span title="Terverifikasi BNSP">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {partnerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`Menghubungkan panggilan darurat langsung ke ${partnerName} via Saluran Telepon ZHS.`)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#19324d] text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Panggilan Suara</span>
            </button>
          </div>

        </div>
      </header>

      {/* SUB-BANNER: BOOKING TRIP CONTEXT */}
      <div className="bg-[#19324d] text-white px-4 sm:px-8 py-2.5 text-xs shadow-inner">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-white/20 font-mono font-bold text-[11px]">
              {booking.id}
            </span>
            <span className="font-bold truncate max-w-xs sm:max-w-md">
              {booking.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-sky-200">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="truncate">{booking.meetingPoint || 'Meeting Point'}</span>
            </span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline text-emerald-300 font-semibold">
              🔒 Escrow Protected
            </span>
          </div>
        </div>
      </div>

      {/* CHAT FEED CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        
        {/* Security / Escrow Info Badge */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center max-w-md mx-auto space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-sky-900">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Kanal Chat Resmi Terproteksi ZHS</span>
          </div>
          <p className="text-[11px] text-sky-700 leading-relaxed">
            Percakapan ini dipantau untuk menjamin keamanan perjalanan dan kepastian titik kumpul tur. Jangan bagikan informasi perbankan rahasia.
          </p>
        </div>

        {/* Messages */}
        {currentMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <div className="text-3xl">💬</div>
            <p className="font-semibold text-slate-600">Belum ada percakapan untuk booking ini.</p>
            <p>Mulai sapa untuk koordinasi titik kumpul dan jadwal tur Anda.</p>
          </div>
        ) : (
          currentMessages.map((msg) => {
            const isMe = isGuideUser ? msg.senderRole === 'pemandu' : msg.senderRole === 'wisatawan';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={msg.senderAvatar || partnerAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1 border border-slate-200"
                  />
                )}

                <div className={`max-w-[80%] sm:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-[#19324d] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>

                  <div className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* QUICK CHIP SUGGESTIONS */}
      <div className="bg-white border-t border-slate-200/80 px-4 sm:px-8 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">
            Respon Cepat:
          </span>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(reply)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold whitespace-nowrap transition-colors border border-slate-200"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT INPUT FORM */}
      <footer className="sticky bottom-0 bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isGuideUser
                ? 'Kirim pesan petunjuk atau konfirmasi ke wisatawan...'
                : 'Tanyakan titik kumpul atau kebutuhan tur ke pemandu...'
            }
            className="flex-1 px-4 py-3 bg-[#f8fafc] border border-slate-300 rounded-full text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#19324d] focus:bg-white transition-all shadow-inner"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-3 bg-[#19324d] hover:bg-[#122438] disabled:bg-slate-300 text-white rounded-full shadow-md active:scale-95 transition-all shrink-0"
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>

    </div>
  );
};
