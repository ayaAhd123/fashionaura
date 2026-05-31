import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Send, X } from 'lucide-react';
import { getEcho } from '../../lib/echo';
import { getAuthUser } from '../../lib/authStorage';
import { getOrderConversation, getConversationMessages, sendConversationMessage } from '../../services/api';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function mapIncomingMessage(payload, currentUserId) {
  return {
    id: payload.id,
    body: payload.body,
    user_id: payload.user_id,
    sender_name: payload.sender_name,
    sender_role: payload.sender_role,
    is_mine: currentUserId ? Number(payload.user_id) === Number(currentUserId) : false,
    created_at: payload.created_at,
  };
}

export default function OrderChatModal({
  open,
  onClose,
  orderId,
  orderLabel,
  counterpartName,
}) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const bodyRef = useRef(null);
  const currentUserId = Number(getAuthUser()?.id || 0);

  const loadConversation = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { data: conv } = await getOrderConversation(orderId);
      setConversationId(conv.id);
      setCanSend(true);

      const { data: res } = await getConversationMessages(conv.id);
      setMessages(res?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || 'Impossible de charger la conversation');
      setCanSend(false);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!open || !orderId) {
      setConversationId(null);
      setMessages([]);
      return undefined;
    }

    loadConversation();
  }, [open, orderId, loadConversation]);

  useEffect(() => {
    if (!open || !conversationId) return undefined;

    const echo = getEcho();
    if (!echo) return undefined;

    const channel = echo.private(`conversation.${conversationId}`);
    channel.listen('.MessageSent', (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, mapIncomingMessage(payload, currentUserId)];
      });
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [open, conversationId, currentUserId]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !conversationId || !canSend) return;

    setSending(true);
    setInput('');
    try {
      const { data } = await sendConversationMessage(conversationId, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Envoi impossible');
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 420,
          maxWidth: '95vw',
          height: 520,
          maxHeight: '90vh',
          background: '#fff',
          borderRadius: 18,
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#1B3A35',
            color: '#fff',
          }}
        >
          <div>
            <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={18} />
              {orderLabel || `Commande #${orderId}`}
            </p>
            <p style={{ margin: '4px 0 0', fontFamily: 'Inter, sans-serif', fontSize: 12, opacity: 0.75 }}>
              Avec {counterpartName || 'votre interlocuteur'}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div
          ref={bodyRef}
          style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>Chargement…</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF', fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 40 }}>
              Aucun message. Écrivez pour contacter {counterpartName || 'votre interlocuteur'}.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.is_mine ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.is_mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: msg.is_mine ? '#1B3A35' : '#fff',
                  color: msg.is_mine ? '#fff' : '#111827',
                  border: msg.is_mine ? 'none' : '1px solid #E5E7EB',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {!msg.is_mine && (
                  <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 600, color: '#69807E', fontFamily: 'Inter, sans-serif' }}>
                    {msg.sender_name}
                  </p>
                )}
                <p style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                  {msg.body}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 10, opacity: 0.65, fontFamily: 'Inter, sans-serif', textAlign: 'right' }}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleSend}
          style={{ padding: 12, borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8, background: '#fff' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={canSend ? 'Votre message…' : 'Messagerie indisponible'}
            maxLength={2000}
            disabled={!canSend}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1.5px solid #E5E7EB',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              outline: 'none',
              opacity: canSend ? 1 : 0.6,
            }}
          />
          <button
            type="submit"
            disabled={sending || !input.trim() || !canSend}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: 'none',
              background: '#1B3A35',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending || !input.trim() || !canSend ? 0.5 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
