import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Send, Package, Mail } from 'lucide-react';
import {
  getConversations,
  getBoutiqueConversation,
  getOrderConversation,
  getConversationMessages,
  sendConversationMessage,
} from '../../services/api';
import { getEcho } from '../../lib/echo';
import { getAuthUser } from '../../lib/authStorage';

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
    is_mine: currentUserId ? Number(payload.user_id) === Number(currentUserId) : false,
    created_at: payload.created_at,
  };
}

function ChatPanel({ conversation, onBack, onSent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);
  const currentUserId = Number(getAuthUser()?.id || 0);

  const loadMessages = useCallback(async () => {
    if (!conversation?.id) return;
    setLoading(true);
    try {
      const { data } = await getConversationMessages(conversation.id);
      setMessages(data?.data || []);
    } catch {
      toast.error('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [conversation?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!conversation?.id) return undefined;
    const echo = getEcho();
    if (!echo) return undefined;

    const channel = echo.private(`conversation.${conversation.id}`);
    channel.listen('.MessageSent', (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, mapIncomingMessage(payload, currentUserId)];
      });
    });

    return () => echo.leave(`conversation.${conversation.id}`);
  }, [conversation?.id, currentUserId]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || !conversation?.id) return;

    setSending(true);
    setInput('');
    try {
      const { data } = await sendConversationMessage(conversation.id, text);
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]));
      onSent?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Envoi impossible');
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="msg-inbox__empty-chat">
        <MessageCircle size={40} strokeWidth={1.2} />
        <p>Sélectionnez une conversation</p>
      </div>
    );
  }

  return (
    <div className="msg-inbox__chat">
      <div className="msg-inbox__chat-head">
        {onBack && (
          <button type="button" className="msg-inbox__back" onClick={onBack}>←</button>
        )}
        <div>
          <strong>{conversation.label || conversation.counterpart_name}</strong>
          <span>{conversation.counterpart_name}</span>
        </div>
      </div>

      <div ref={bodyRef} className="msg-inbox__chat-body">
        {loading ? (
          <p className="msg-inbox__hint">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="msg-inbox__hint">Aucun message. Écrivez pour démarrer.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`msg-bubble ${msg.is_mine ? 'msg-bubble--mine' : ''}`}>
              {!msg.is_mine && <small>{msg.sender_name}</small>}
              <p>{msg.body}</p>
              <time>{formatTime(msg.created_at)}</time>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="msg-inbox__chat-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre message…"
          maxLength={2000}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default function ConversationInbox({ mode = 'customer' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [mobileChat, setMobileChat] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getConversations();
      setConversations(data?.data || []);
    } catch {
      toast.error('Impossible de charger la messagerie');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    const boutiqueId = searchParams.get('boutique');
    const orderId = searchParams.get('order');
    if (!boutiqueId && !orderId) return;

    const openTarget = async () => {
      try {
        let conv;
        if (orderId) {
          const { data } = await getOrderConversation(orderId);
          conv = {
            id: data.id,
            label: `Commande #${orderId}`,
            counterpart_name: data.boutique_name || data.customer_name,
            type: data.type,
          };
        } else if (boutiqueId && mode === 'customer') {
          const { data } = await getBoutiqueConversation(boutiqueId);
          conv = {
            id: data.id,
            label: 'Message direct',
            counterpart_name: data.boutique_name,
            type: 'direct',
          };
        }
        if (conv) {
          setSelected(conv);
          setMobileChat(true);
          await loadList();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Conversation indisponible');
      } finally {
        setSearchParams({}, { replace: true });
      }
    };

    openTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('boutique'), searchParams.get('order'), mode]);

  const pick = (conv) => {
    setSelected(conv);
    setMobileChat(true);
  };

  return (
    <div className="msg-inbox">
      <header className="msg-inbox__header">
        <h2>Messagerie</h2>
        <p>
          {mode === 'customer'
            ? 'Contactez les boutiques (commandes ou messages directs).'
            : 'Échangez avec vos clients pour valider les commandes ou répondre aux messages.'}
        </p>
      </header>

      <div className="msg-inbox__layout">
        <aside className={`msg-inbox__list ${mobileChat ? 'msg-inbox__list--hidden-mobile' : ''}`}>
          {loading ? (
            <p className="msg-inbox__hint">Chargement…</p>
          ) : conversations.length === 0 ? (
            <p className="msg-inbox__hint">
              {mode === 'customer'
                ? 'Aucune conversation. Utilisez « Contacter » sur une boutique ou une commande.'
                : 'Aucun message pour le moment.'}
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`msg-inbox__item ${selected?.id === c.id ? 'is-active' : ''}`}
                onClick={() => pick(c)}
              >
                <span className="msg-inbox__item-icon">
                  {c.type === 'order' ? <Package size={16} /> : <Mail size={16} />}
                </span>
                <span className="msg-inbox__item-body">
                  <strong>{c.label}</strong>
                  <span>{c.counterpart_name}</span>
                  {c.last_message && <em>{c.last_message.body}</em>}
                </span>
              </button>
            ))
          )}
        </aside>

        <div className={`msg-inbox__panel ${!mobileChat ? 'msg-inbox__panel--hidden-mobile' : ''}`}>
          <ChatPanel
            conversation={selected}
            onBack={conversations.length ? () => setMobileChat(false) : null}
            onSent={loadList}
          />
        </div>
      </div>
    </div>
  );
}
