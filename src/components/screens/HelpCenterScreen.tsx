import React, { useEffect, useRef, useState } from 'react';
import {
  createTicket, fetchMyTickets, fetchTicketMessages, sendTicketMessage, subscribeTicketMessages, ticketCode
} from '../../services/tourismService';
import type { SupportMessage, SupportTicket } from '../../services/tourismService';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, Search, ChevronDown, ChevronUp, MessageSquare, 
  Mail, Phone, Clock, Send, Paperclip, CheckCircle2, ShieldCheck 
} from 'lucide-react';

export const HelpCenterScreen: React.FC = () => {
  const { activeScreen, setActiveScreen, currentUser, setRedirectAfterLogin } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chatError, setChatError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  // Muat tiket terbuka milik user + pesannya, lalu dengarkan balasan admin secara realtime
  const loadThread = async () => {
    const tickets = await fetchMyTickets();
    const current = tickets.find((t) => t.status !== 'closed') ?? null;
    setTicket(current);
    setMessages(current ? await fetchTicketMessages(current.id) : []);
    return current;
  };

  useEffect(() => {
    if (activeScreen !== 'admin-chat' || !currentUser) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    setChatError('');
    loadThread()
      .then((current) => {
        if (cancelled || !current) return;
        unsubscribe = subscribeTicketMessages(current.id, (m) =>
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
        );
      })
      .catch((e) => setChatError(e?.message ?? 'Gagal memuat percakapan'));
    return () => { cancelled = true; unsubscribe?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScreen, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const faqs = [
    {
      q: 'Bagaimana cara memesan tur?',
      a: 'Anda dapat memesan tur dengan memilih destinasi yang diinginkan dari beranda, menentukan tanggal keberangkatan, memilih jumlah peserta, dan menekan tombol Pesan Sekarang pada halaman detail paket.'
    },
    {
      q: 'Bagaimana cara membayar booking?',
      a: 'Kami mendukung pembayaran QRIS Nasional (semua e-wallet dan m-banking), Virtual Account BCA/Mandiri/BNI, serta GoPay dan OVO. Semua pembayaran diamankan melalui Rekening Bersama Escrow resmi ZHS.'
    },
    {
      q: 'Apakah saya bisa membatalkan tur?',
      a: 'Ya, pembatalan tur dilindungi kebijakan pengembalian dana: H-3 atau lebih mendapatkan 100% pengembalian, H-1 mendapatkan 50% pengembalian, dan H-0 (hari tur) dana hangus.'
    },
    {
      q: 'Bagaimana cara menggunakan E-Tiket?',
      a: 'Setelah pembayaran terverifikasi, buka menu E-Tiket di aplikasi dan tunjukkan QR Code tersebut kepada pemandu wisata resmi Anda di meeting point.'
    },
    {
      q: 'Bagaimana jika pemandu tidak merespons?',
      a: 'Pemandu memiliki batas waktu 24 jam untuk konfirmasi. Jika tidak ada respons, sistem Smart Match otomatis menawarkan Next-Best Match (pemandu pengganti) atau opsi refund 100% langsung ke rekening Anda.'
    }
  ];

  const handleSendAdminChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !currentUser || sending) return;
    setSending(true);
    setChatError('');
    setInputText('');
    try {
      if (!ticket) {
        await createTicket(text.slice(0, 80), text, 'help_center');   // pesan pertama membuka tiket baru
        const current = await loadThread();
        if (current) {
          subscribeTicketMessages(current.id, (m) =>
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
          );
        }
      } else {
        await sendTicketMessage(ticket.id, currentUser.id, text);
        setMessages(await fetchTicketMessages(ticket.id));
      }
    } catch (err: any) {
      setChatError(err?.message ?? 'Pesan gagal terkirim');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const statusLabel = ticket?.status === 'answered' ? 'Sudah dibalas' : 'Menunggu balasan';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            onClick={() => {
              if (activeScreen === 'admin-chat') setActiveScreen('contact-admin');
              else if (activeScreen === 'contact-admin') setActiveScreen('help-center');
              else setActiveScreen('home');
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#19324d] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <h1 className="text-base sm:text-lg font-black text-[#19324d]">
            {activeScreen === 'admin-chat' ? 'Live Chat Admin' : activeScreen === 'contact-admin' ? 'Hubungi Admin' : 'Pusat Bantuan'}
          </h1>

          <div className="w-8" />
        </div>
        
        {/* VIEW 1: LIVE CHAT ADMIN (exact as Figma Page 7 & 80) */}
        {activeScreen === 'admin-chat' ? (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[75vh]">
            
            {/* Top Chat Header with Ticket Priority */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#19324d] text-white flex items-center justify-center font-bold text-xs">
                  AD
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[#19324d]">Admin Zamzam Spot</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Tim bantuan membalas di sini</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  ticket?.status === 'answered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {ticket ? statusLabel : 'Tiket Baru'}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">{ticket ? ticketCode(ticket.id) : 'Belum ada tiket'}</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
              {!currentUser ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-xs text-slate-500">
                  <p>Masuk ke akun Anda untuk menghubungi Tim Bantuan.</p>
                  <button
                    onClick={() => { setRedirectAfterLogin('admin-chat'); setActiveScreen('login'); }}
                    className="px-4 py-2 bg-[#19324d] text-white font-bold rounded-xl"
                  >
                    Masuk
                  </button>
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="flex flex-col items-start">
                      <div className="p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm">
                        Halo! Tuliskan pertanyaan atau kendala Anda. Pesan pertama akan membuka tiket bantuan, dan tim ZHS akan membalas di sini.
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const mine = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed whitespace-pre-line ${
                            mine
                              ? 'bg-[#19324d] text-white rounded-tr-none shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                          }`}
                        >
                          {msg.body}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">{mine ? 'Anda' : 'Admin ZHS'} · {fmtTime(msg.createdAt)}</span>
                      </div>
                    );
                  })}
                  {chatError && <p className="text-xs text-red-600">{chatError}</p>}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendAdminChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!currentUser || sending}
                placeholder="Tulis pesan ke admin..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#19324d]"
              />
              <button
                type="submit"
                disabled={!currentUser || sending || !inputText.trim()}
                className="p-2.5 bg-[#19324d] text-white rounded-xl shadow hover:bg-[#122438] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        ) : activeScreen === 'contact-admin' ? (
          /* VIEW 2: HUBUNGI ADMIN CONTACT OPTIONS (exact as Figma Page 6) */
          <div className="space-y-6">
            
            {/* Header & Illustration */}
            <div className="text-center space-y-3">
              <div className="w-28 h-28 rounded-3xl bg-sky-100 mx-auto flex items-center justify-center text-5xl shadow-sm border border-sky-200">
                👩‍💼
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#19324d]">
                Ada yang bisa kami bantu?
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Tim kami siap membantu jika Anda mengalami kendala selama perjalanan Anda. Kami berupaya memberikan solusi terbaik secepat mungkin.
              </p>
            </div>

            {/* Chat Admin Card (exact as Figma Page 6) */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#19324d]">Chat Admin</h4>
                  <p className="text-[11px] text-slate-500">Respon cepat dari tim dukungan kami • Bantuan langsung</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveScreen('admin-chat')}
                className="w-full py-3 bg-[#19324d] hover:bg-[#122438] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all"
              >
                Mulai Chat
              </button>
            </div>

            {/* Metode Lainnya (exact as Figma Page 6) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                METODE LAINNYA
              </span>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:border-emerald-500 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#19324d]">Nomor WhatsApp</h5>
                    <span className="text-[11px] text-slate-500">+62 812-3456-7890</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">›</span>
              </a>

              <a
                href="mailto:support@travelapp.id"
                className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:border-sky-500 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#19324d]">Email Dukungan</h5>
                    <span className="text-[11px] text-slate-500">support@travelapp.id</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400">›</span>
              </a>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <strong className="block text-[#19324d]">Jam Operasional Dukungan</strong>
                  <span className="text-[11px] text-slate-500">Setiap Hari: 08:00 – 22:00 WIB</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* VIEW 3: FAQ ACCORDION PUSAT BANTUAN (exact as Figma Page 5 & 82) */
          <div className="space-y-6">
            
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#19324d]">
                Pertanyaan Sering Diajukan (FAQ)
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Temukan jawaban cepat untuk pertanyaan umum mengenai layanan tur kami untuk pengalaman perjalanan yang lancar.
              </p>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari bantuan, refund, atau panduan booking..."
                className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
              />
            </div>

            {/* Accordion List (exact as Figma Page 5) */}
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#19324d] hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 animate-in fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* MASIH BUTUH BANTUAN (exact as Figma Page 5 & 82) */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
              <div>
                <h4 className="font-extrabold text-sm text-[#19324d]">Masih butuh bantuan?</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tim kami siap membantu Anda 24/7</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveScreen('contact-admin')}
                  className="py-2.5 bg-[#19324d] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CHAT ADMIN</span>
                </button>

                <a
                  href="mailto:support@travelapp.id"
                  className="py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 hover:bg-slate-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>EMAIL</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
