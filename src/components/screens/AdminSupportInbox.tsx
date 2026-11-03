import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Send, CheckCircle2, MessageSquare, ArrowLeft, AlertCircle } from 'lucide-react';
import {
  fetchAllTicketsForAdmin, fetchTicketMessages, sendTicketMessage, setTicketClosed,
  subscribeTicketMessages, ticketCode, timeAgo
} from '../../services/tourismService';
import type { AdminTicket, SupportMessage } from '../../services/tourismService';

type Filter = 'open' | 'answered' | 'closed';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'open', label: 'Perlu dibalas' },
  { id: 'answered', label: 'Sudah dibalas' },
  { id: 'closed', label: 'Selesai' }
];

/** Kotak masuk tiket bantuan untuk admin. Akses sebenarnya dijaga RLS di database (role admin). */
export const AdminSupportInbox: React.FC<{ adminId: string }> = ({ adminId }) => {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [selected, setSelected] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      setTickets(await fetchAllTicketsForAdmin());
      setError('');
    } catch (e: any) {
      setError(e?.message ?? 'Gagal memuat tiket');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
    const timer = setInterval(() => void loadList(), 30000); // segarkan berkala agar tiket baru muncul
    return () => clearInterval(timer);
  }, [loadList]);

  // buka satu tiket: muat pesan + langganan realtime
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    fetchTicketMessages(selected.id).then((m) => { if (!cancelled) setMessages(m); }).catch((e) => setError(e.message));
    const unsubscribe = subscribeTicketMessages(selected.id, (m) =>
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    );
    return () => { cancelled = true; unsubscribe(); };
  }, [selected?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !selected || busy) return;
    setBusy(true);
    setError('');
    try {
      await sendTicketMessage(selected.id, adminId, text);
      setReply('');
      setMessages(await fetchTicketMessages(selected.id));
      await loadList();
    } catch (err: any) {
      setError(err?.message ?? 'Balasan gagal terkirim');
    } finally {
      setBusy(false);
    }
  };

  const toggleClosed = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await setTicketClosed(selected.id, selected.status !== 'closed');
      setSelected(null);
      await loadList();
    } catch (err: any) {
      setError(err?.message ?? 'Gagal mengubah status tiket');
    } finally {
      setBusy(false);
    }
  };

  const visible = tickets.filter((t) => t.status === filter);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-16 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#19324d]">Pusat Bantuan</h1>
          <p className="text-xs text-slate-500">Tiket dari wisatawan dan pemandu</p>
        </div>
        <button onClick={() => void loadList()} className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50" title="Muat ulang">
          <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-xs rounded-2xl p-3 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!selected ? (
        <>
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const count = tickets.filter((t) => t.status === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filter === f.id ? 'bg-[#19324d] text-white border-[#19324d]' : 'bg-white text-slate-600 border-slate-300'
                  }`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-sm text-slate-500">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Tidak ada tiket pada kategori ini.
            </div>
          ) : (
            visible.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className="w-full text-left bg-white border border-slate-200 hover:border-[#19324d] rounded-2xl p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#19324d] truncate">{t.subject}</p>
                  <p className="text-xs text-slate-500">
                    {t.userName} · {ticketCode(t.id)} · {t.source === 'ai_handoff' ? 'dari chat AI' : 'Pusat Bantuan'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(t.updatedAt)}</span>
              </button>
            ))
          )}
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs font-semibold text-[#19324d]">
              <ArrowLeft className="w-4 h-4" /> Daftar tiket
            </button>
            <div className="text-right min-w-0">
              <p className="text-sm font-bold text-[#19324d] truncate">{selected.subject}</p>
              <p className="text-[11px] text-slate-500">{selected.userName} · {ticketCode(selected.id)}</p>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto bg-slate-50">
            {messages.map((m) => {
              const fromAdmin = m.senderId !== selected.userId;
              return (
                <div key={m.id} className={`flex flex-col ${fromAdmin ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed whitespace-pre-line ${
                    fromAdmin ? 'bg-[#19324d] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {m.body}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {fromAdmin ? 'Admin' : selected.userName} · {timeAgo(m.createdAt)}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-200 space-y-2">
            {selected.status !== 'closed' && (
              <form onSubmit={send} className="flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Tulis balasan…"
                  className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-[#19324d]"
                />
                <button
                  type="submit"
                  disabled={busy || !reply.trim()}
                  className="p-2.5 bg-[#19324d] text-white rounded-xl disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            <button
              onClick={() => void toggleClosed()}
              disabled={busy}
              className="w-full py-2.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {selected.status === 'closed' ? 'Buka kembali tiket' : 'Tandai selesai'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
