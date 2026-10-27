import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  X, Send, Bot, User, ShieldAlert, CheckCircle, 
  ArrowRight, PhoneCall 
} from 'lucide-react';

export const AIChatbotDrawer: React.FC = () => {
  const { isAiDrawerOpen, toggleAiDrawer, chatMessages, sendAiMessage, startBooking } = useAppStore();
  const [inputText, setInputText] = useState('');

  if (!isAiDrawerOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendAiMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    '✨ Cari pemandu terbaik untuk wisata alam',
    '🛡️ Bagaimana cara kerja Escrow (Dana Aman Terjaga)?',
    '📜 SOP verifikasi pemandu & kemitraan UMKM',
    '💰 Kebijakan refund & pembatalan tur'
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Drawer Container: Full screen width on mobile, 450px on desktop */}
      <div className="w-full sm:max-w-md bg-[#13253b] border-l border-slate-700/80 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#172d47] border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#172d47] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-sm">AI Chatbot ZHS</h3>
                <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.2 rounded font-semibold border border-cyan-400/30">
                  Anti-Halusinasi
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Terhubung ke Knowledge Base & Smart Match v2.0</p>
            </div>
          </div>

          <button
            onClick={() => toggleAiDrawer(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intent Badges Bar */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-[10px] text-slate-300 flex items-center justify-between overflow-x-auto">
          <span className="text-cyan-400 font-semibold whitespace-nowrap">4 Intent Sistem:</span>
          <div className="flex gap-1.5 pl-2">
            <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 whitespace-nowrap">A. Rekomendasi</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 whitespace-nowrap">B. Info Budaya</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300 whitespace-nowrap">C. Escrow</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 whitespace-nowrap">D. SOP Pemandu</span>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2 max-w-[88%]">
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* If AI has Top-N Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-700/60">
                      <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                        Top-N Rekomendasi Smart Match:
                      </p>
                      {msg.recommendations.map((guide: any) => (
                        <div
                          key={guide.id}
                          className="p-2 bg-slate-900/80 rounded-xl border border-slate-700 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={guide.avatar}
                              alt={guide.name}
                              className="w-8 h-8 rounded-full object-cover border border-amber-400/60"
                            />
                            <div>
                              <div className="font-bold text-white text-[11px] flex items-center gap-1">
                                {guide.name}
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ⭐ {guide.rating} · Rp {guide.pricePerDay.toLocaleString('id-ID')}/hari
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              toggleAiDrawer(false);
                              startBooking(guide);
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-lg transition-colors whitespace-nowrap"
                          >
                            Pesan
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.intent === 'out_of_scope' && (
                    <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] text-amber-200 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Pertanyaan di luar ekosistem ZHS diarahkan kembali secara sopan.</span>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Human Escalation Card (as mandated in PDF Flowchart Halaman 7) */}
          <div className="p-3 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 rounded-2xl">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Butuh Bantuan Khusus / Dispute Pembayaran?</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Bila ada sengketa tur atau pertanyaan mendalam, sistem siap eskalasi ke Tim Admin ZHS (Human Handoff).
            </p>
            <button
              onClick={() => {
                sendAiMessage('Saya memerlukan bantuan langsung dari Admin ZHS terkait transaksi/tur.');
              }}
              className="mt-2 text-[10px] font-bold text-purple-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
            >
              <span>Eskalasi ke Admin (Buat Tiket Bantuan)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(prompt.replace(/^[^\s]+\s/, ''));
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-[10px] font-medium whitespace-nowrap transition-colors border border-slate-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-[#172d47] border-t border-slate-700/80 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanyakan rekomendasi, status escrow, atau SOP..."
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            disabled={!inputText.trim()}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
