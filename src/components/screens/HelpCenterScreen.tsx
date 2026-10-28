import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ArrowLeft, Search, ChevronDown, ChevronUp, MessageSquare, 
  Mail, Phone, Clock, Send, Paperclip, CheckCircle2, ShieldCheck 
} from 'lucide-react';

export const HelpCenterScreen: React.FC = () => {
  const { activeScreen, setActiveScreen } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [adminMessages, setAdminMessages] = useState<{ sender: 'user' | 'admin'; text: string; time: string }[]>([
    {
      sender: 'admin',
      text: 'Halo! Selamat datang di layanan customer service Zamzam Hidden Spot. Ada yang bisa kami bantu?',
      time: '09:00 WIB'
    },
    {
      sender: 'user',
      text: 'Saya ingin menanyakan tentang status reservasi wisata dan kebijakan pengembalian dana.',
      time: '09:01 WIB'
    },
    {
      sender: 'admin',
      text: 'Baik, kami cek dulu ya. Tim kami sedang memvalidasi catatan transaksi rekening Escrow Anda.',
      time: '09:02 WIB'
    }
  ]);
  const [inputText, setInputText] = useState('');

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

  const handleSendAdminChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newMsg = {
      sender: 'user' as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };
    setAdminMessages((m) => [...m, newMsg]);
    setInputText('');

    setTimeout(() => {
      setAdminMessages((m) => [
        ...m,
        {
          sender: 'admin',
          text: 'Pesan Anda telah kami catat di Tiket Bantuan #HB-2041. Petugas operasional ZHS akan segera menghubungi Anda kembali.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        }
      ]);
    }, 800);
  };

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
                    <span>Layanan Bantuan Pelanggan Online</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded uppercase">
                  PRIORITAS
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">Tiket #HB-2041</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
              {adminMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#19324d] text-white rounded-tr-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
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
                placeholder="Tulis pesan ke admin..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#19324d]"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#19324d] text-white rounded-xl shadow hover:bg-[#122438]"
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
