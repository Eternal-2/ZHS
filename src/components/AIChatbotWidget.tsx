import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  Bot, X, Minus, Send, Sparkles, ShieldCheck, 
  ArrowRight, Check, RefreshCw
} from 'lucide-react';

export const AIChatbotWidget: React.FC = () => {
  const { 
    isAiDrawerOpen, 
    toggleAiDrawer, 
    chatMessages, 
    sendAiMessage, 
    isAiLoading,
    setActiveScreen,
    activeScreen
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiDrawerOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [chatMessages, isAiLoading, isAiDrawerOpen, isMinimized]);

  // Hide AI chatbot completely on welcome/landing screen as requested by user
  if (activeScreen === 'welcome') {
    return null;
  }

  // Floating trigger button when closed — ikon bulat kompak
  if (!isAiDrawerOpen) {
    return (
      <button
        onClick={() => toggleAiDrawer(true)}
        className="fixed bottom-32 sm:bottom-8 right-3 z-40 w-9 h-9 bg-[#19324d] hover:bg-[#122438] text-white rounded-full shadow-lg flex items-center justify-center border border-cyan-400/40 hover:scale-110 active:scale-95 transition-all"
        title="Tanya AI ZHS"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
        </div>
      </button>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiLoading) return;
    sendAiMessage(inputText.trim());
    setInputText('');
  };

  const quickChips = [
    { label: 'Rekomendasi Wisata Alam', q: 'Rekomendasi wisata alam tersembunyi di sekitar Purwakarta untuk keluarga 3 orang?' },
    { label: 'Sejarah Situ Buleud', q: 'Ceritakan sejarah dan asal-usul danau Situ Buleud Purwakarta' },
    { label: 'Sistem Escrow ZHS', q: 'Bagaimana cara kerja sistem pembayaran Escrow Dana Aman Terjaga di ZHS?' },
    { label: 'Kebijakan Refund', q: 'Bagaimana aturan refund jika saya membatalkan pesanan H-3 vs H-1?' },
    { label: 'Kuliner Khas', q: 'Apa saja kuliner khas dan oleh-oleh UMKM terbaik yang wajib dicoba di Purwakarta?' }
  ];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col items-end animate-in slide-in-from-bottom-4 duration-200">
      
      {/* CHAT WINDOW */}
      <div className={`w-[85vw] sm:w-[400px] bg-white border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-[480px] sm:h-[560px] max-h-[70vh]'
      }`}>
        
        {/* Header Bar (Pages 74 & 75) */}
        <div className="p-3.5 bg-[#19324d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-bold text-xs relative">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-0 right-0" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-xs">Asisten AI ZHS</span>
                <span className="text-[9px] bg-cyan-400/30 text-cyan-200 px-1 py-0.2 rounded font-mono font-bold">
                  Gemini 3.5 Live
                </span>
              </div>
              <span className="text-[10px] text-cyan-200/80 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Online • Respon Real-time Google Gemini</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:text-white rounded"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleAiDrawer(false)}
              className="p-1 hover:text-white rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Disclaimer Bar */}
            <div className="px-3.5 py-1.5 bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1">
                <span>Didukung Google Gemini & Sistem Terpadu ZHS</span>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Respon Cerdas
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#f8fafc] text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#19324d] text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                    {/* TOP-N SMART MATCH CARDS (exact as Figma Page 76) */}
                    {msg.intent === 'rekomendasi' && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <strong className="text-slate-800 text-[11px]">Trip to Situ Buleud (Purwakarta)</strong>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              92% cocok
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Rp 35.000 /org</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setActiveScreen('detail-tour')}
                                className="px-2 py-0.5 bg-[#19324d] text-white rounded font-semibold"
                              >
                                Pesan
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <strong className="text-slate-800 text-[11px]">Gracia Spa Hot Spring (Subang)</strong>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                              88% cocok
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Rp 100.000 /org</span>
                            <button
                              onClick={() => setActiveScreen('explore')}
                              className="px-2 py-0.5 bg-[#19324d] text-white rounded font-semibold"
                            >
                              Pesan
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TIKET ESKALASI KE ADMIN (exact as Figma Page 79) */}
                    {msg.ticketId && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-700 text-[11px]">
                            Tiket Bantuan {msg.ticketId}
                          </span>
                          <span className="text-[9px] bg-red-200 text-red-800 font-bold px-1.5 py-0.2 rounded">
                            DITERIMA
                          </span>
                        </div>
                        <p className="text-[10px] leading-snug">
                          Ringkasan pertanyaan Anda sudah dikirim ke Admin. Jam operasional 08.00–21.00 WIB. Estimasi balasan &lt; 5 menit.
                        </p>
                        <button
                          onClick={() => setActiveScreen('admin-chat')}
                          className="w-full py-1.5 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-[10px] rounded-lg shadow-sm flex items-center justify-center gap-1"
                        >
                          <span>Lanjut Chat ke Admin</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {/* Typing / Loading indicator */}
              {isAiLoading && (
                <div className="flex flex-col items-start animate-in fade-in">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-600">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                    <span className="text-[11px] font-medium">Gemini AI sedang berpikir...</span>
                    <div className="flex gap-1 ml-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips (exact as Figma Page 75) */}
            <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {quickChips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendAiMessage(chip.q)}
                  disabled={isAiLoading}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-full text-[10px] font-semibold text-slate-700 whitespace-nowrap shadow-2xs transition-colors disabled:opacity-50 active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tanyakan apa saja seputar wisata, kuliner, tips perjalanan..."
                disabled={isAiLoading}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#19324d] disabled:opacity-60"
              />
              <button
                type="submit"
                className="p-2 bg-[#19324d] hover:bg-[#122438] text-white rounded-xl shadow active:scale-95 disabled:opacity-50 transition-all"
                disabled={!inputText.trim() || isAiLoading}
              >
                {isAiLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
