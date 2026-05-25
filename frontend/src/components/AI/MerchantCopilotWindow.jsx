import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Maximize2, Minimize2, X, Expand, Shrink, Send, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MessageBubble from './MessageBubble';
import { sendMerchantCopilotMessage } from '../../api/merchantCopilotService';
import './MerchantCopilotWindow.css';

const WELCOME_ID = 1;

export default function MerchantCopilotWindow() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullpage, setFullpage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bodyRef = useRef(null);
  const controls = useDragControls();

  const suggestions = useMemo(() => [
    t('merchant_copilot.chip_sales'),
    t('merchant_copilot.chip_stock'),
    t('merchant_copilot.chip_top'),
    t('merchant_copilot.chip_month'),
  ], [t]);

  const windowClass = [
    'merchant-copilot-window',
    expanded ? 'expanded' : '',
    fullpage ? 'fullpage' : '',
  ].filter(Boolean).join(' ');

  const locale = i18n.language?.split('-')[0] || 'fr';

  const openChat = useCallback(() => {
    setMessages([{
      id: WELCOME_ID,
      sender: 'ai',
      text: t('merchant_copilot.welcome'),
    }]);
    setInput('');
    setOpen(true);
  }, [t]);

  useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.id !== WELCOME_ID) return prev;
      return [{ ...prev[0], text: t('merchant_copilot.welcome') }];
    });
  }, [i18n.language, open, t]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMessage = { id: Date.now(), sender: 'user', text: msg };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages
      .filter((m) => m.id !== WELCOME_ID)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'bot',
        text: m.text,
      }));

    try {
      const { reply } = await sendMerchantCopilotMessage(msg, history, '30days', locale);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: t('merchant_copilot.error') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const closeChat = () => {
    setOpen(false);
    setExpanded(false);
    setFullpage(false);
    setMessages([]);
    setInput('');
  };

  const toggleChat = () => {
    if (open) closeChat();
    else openChat();
  };

  return (
    <>
      {fullpage && open && (
        <div
          className="chatbot-overlay visible"
          onClick={() => setFullpage(false)}
          aria-hidden
        />
      )}

      {!fullpage && (
        <button
          type="button"
          className="merchant-copilot-fab"
          onClick={toggleChat}
          aria-label={t('merchant_copilot.name')}
        >
          {open ? <X size={24} /> : <BarChart3 size={24} />}
        </button>
      )}

      {open && (
        <motion.div
          className={windowClass}
          drag={!fullpage}
          dragControls={controls}
          dragListener={false}
          dragMomentum={false}
        >
          <div
            className="mc-header"
            onPointerDown={(e) => {
              if (fullpage) return;
              const target = e.target;
              if (target instanceof Element && target.closest('button, .mc-header-actions')) return;
              controls.start(e);
            }}
            style={{ cursor: fullpage ? 'default' : 'grab' }}
          >
            <div className="mc-avatar">
              <BarChart3 size={22} color="#E3C8B5" />
            </div>
            <div className="mc-header-info">
              <span className="mc-name">{t('merchant_copilot.name')}</span>
              <span className="mc-status">
                <span className="mc-status-dot" />
                {t('merchant_copilot.status')}
              </span>
            </div>
            <div className="mc-header-actions">
              <button
                type="button"
                className="mc-action-btn"
                onClick={() => { setExpanded(!expanded); setFullpage(false); }}
                aria-label={expanded ? t('merchant_copilot.shrink') : t('merchant_copilot.expand')}
              >
                {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                type="button"
                className="mc-action-btn"
                onClick={() => { setFullpage(!fullpage); setExpanded(false); }}
                aria-label={fullpage ? t('merchant_copilot.exit_fullscreen') : t('merchant_copilot.fullscreen')}
              >
                {fullpage ? <Shrink size={18} /> : <Expand size={18} />}
              </button>
              <button type="button" className="mc-action-btn" onClick={closeChat} aria-label={t('merchant_copilot.close')}>
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="mc-suggestions">
            {suggestions.map((s) => (
              <button key={s} type="button" className="mc-chip" onClick={() => handleSend(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="mc-body" ref={bodyRef}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="mc-footer">
            <input
              type="text"
              className="mc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder={t('merchant_copilot.placeholder')}
            />
            <button type="button" className="mc-send" onClick={() => handleSend()} disabled={loading}>
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}