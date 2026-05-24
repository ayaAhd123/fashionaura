import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';
import { Maximize2, Minimize2, X, Expand, Shrink, Send, ImagePlus, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MessageBubble from './MessageBubble';
import SuggestionCard from './SuggestionCard';
import { sendMessage } from '../../api/chatbotService';
import { getCityFromPathname } from '../../utils/openFashionBot';
import './ChatbotWindow.css';

function resolveCityContext(t, slug, cityNameOverride) {
    if (!slug) {
        return { city: null, cityName: null };
    }
    const city = slug.toLowerCase();
    const cityName = cityNameOverride || t(`cities.${city}.name`, { defaultValue: city });
    return { city, cityName };
}

const ChatbotWindow = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [fullpage, setFullpage] = useState(false);
    const [contextCity, setContextCity] = useState(null);
    const [contextCityName, setContextCityName] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const bodyRef = useRef(null);
    const fileInputRef = useRef(null);
    const controls = useDragControls();

    const routeCitySlug = useMemo(
        () => getCityFromPathname(location.pathname),
        [location.pathname]
    );

    const chatContext = useMemo(
        () => (contextCity ? { city: contextCity, cityName: contextCityName } : {}),
        [contextCity, contextCityName]
    );

    const suggestions = useMemo(() => {
        if (contextCity && contextCityName) {
            return [
                t('chatbot.chip_advice_wedding'),
                t('chatbot.chip_advice_colors'),
                t('chatbot.chip_show_boutiques_city', { city: contextCityName }),
            ];
        }
        return [
            t('chatbot.chip_advice_wedding'),
            t('chatbot.chip_advice_evening'),
            t('chatbot.chip_advice_colors'),
            t('chatbot.chip_show_boutiques'),
        ];
    }, [contextCity, contextCityName, t]);

    const windowClass = [
        'chatbot-window',
        expanded ? 'expanded' : '',
        fullpage ? 'fullpage' : '',
    ].filter(Boolean).join(' ');

    const openChat = useCallback((detail = {}) => {
        const slug = detail.city || routeCitySlug;
        const { city, cityName } = resolveCityContext(t, slug, detail.cityName);

        setContextCity(city);
        setContextCityName(cityName);

        const welcome = cityName
            ? t('chatbot.welcome_city', { city: cityName })
            : t('chatbot.welcome');

        setMessages([{ id: 1, sender: 'ai', text: welcome }]);
        setInput(detail.prefill || '');
        setOpen(true);
    }, [routeCitySlug, t]);

    useEffect(() => {
        if (!open || messages.length > 1 || !routeCitySlug) return;

        const { city, cityName } = resolveCityContext(t, routeCitySlug);
        setContextCity(city);
        setContextCityName(cityName);
        setMessages([{
            id: 1,
            sender: 'ai',
            text: t('chatbot.welcome_city', { city: cityName }),
        }]);
        setInput('');
    }, [location.pathname, open, messages.length, routeCitySlug, t]);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        const handleOpen = (e) => openChat(e.detail || {});
        window.addEventListener('openFashionBot', handleOpen);
        return () => window.removeEventListener('openFashionBot', handleOpen);
    }, [openChat]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSelectedImage(ev.target.result);
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (text) => {
        const msg = text || input.trim();
        if (!msg && !selectedImage) return;
        setInput('');

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: msg || t('chatbot.photo_sent'),
            image: imagePreview || null,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setLoading(true);

        const history = newMessages.slice(1).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'bot',
            text: m.text,
        }));

        const imageToSend = selectedImage;
        clearImage();

        try {
            const { reply, suggestions: results } = await sendMessage(msg, history, imageToSend, chatContext);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, sender: 'ai', text: reply, suggestions: results },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, sender: 'ai', text: t('chatbot.error') },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const closeChat = () => {
        setOpen(false);
        setExpanded(false);
        setFullpage(false);
        setContextCity(null);
        setContextCityName(null);
        setInput('');
        setMessages([]);
    };

    const toggleChat = () => {
        if (open) {
            closeChat();
        } else {
            openChat({});
        }
    };

    return (
        <>
            {fullpage && open && (
                <div
                    className="chatbot-overlay visible"
                    onClick={() => setFullpage(false)}
                />
            )}

            {!fullpage && (
                <button type="button" className="fab-btn" onClick={toggleChat} aria-label={t('chatbot.name')}>
                    {open ? <X size={24} /> : <Sparkles size={24} />}
                </button>
            )}

            {open && (
                <motion.div
                    className={windowClass}
                    drag={!fullpage}
                    dragControls={controls}
                    dragListener={false}
                    dragMomentum={false}
                    animate={fullpage ? { x: 0, y: 0 } : {}}
                >
                    <div
                        className="chat-header"
                        onPointerDown={(e) => {
                            if (fullpage) return;
                            const target = e.target;
                            if (target instanceof Element) {
                                if (target.closest('button, .chat-header-actions')) return;
                            }
                            controls.start(e);
                        }}
                        style={{ cursor: fullpage ? 'default' : 'grab' }}
                    >
                        <div className="chat-avatar"><Sparkles size={20} color="#fff" /></div>
                        <div className="chat-header-info">
                            <span className="chat-name">{t('chatbot.name')}</span>
                            <span className="chat-status">
                                <span className="status-dot" />
                                {contextCityName
                                    ? t('chatbot.status_city', { city: contextCityName })
                                    : t('chatbot.status')}
                            </span>
                        </div>

                        <div className="chat-header-actions">
                            <button
                                type="button"
                                className="chat-action-btn"
                                title={expanded ? t('chatbot.shrink') : t('chatbot.expand')}
                                aria-label={expanded ? t('chatbot.shrink') : t('chatbot.expand')}
                                onClick={() => { setExpanded(!expanded); setFullpage(false); }}
                            >
                                {expanded ? (
                                    <Minimize2 size={18} strokeWidth={2.25} aria-hidden />
                                ) : (
                                    <Maximize2 size={18} strokeWidth={2.25} aria-hidden />
                                )}
                            </button>

                            <button
                                type="button"
                                className="chat-action-btn"
                                title={fullpage ? t('chatbot.exit_fullscreen') : t('chatbot.fullscreen')}
                                aria-label={fullpage ? t('chatbot.exit_fullscreen') : t('chatbot.fullscreen')}
                                onClick={() => { setFullpage(!fullpage); setExpanded(false); }}
                            >
                                {fullpage ? (
                                    <Shrink size={18} strokeWidth={2.25} aria-hidden />
                                ) : (
                                    <Expand size={18} strokeWidth={2.25} aria-hidden />
                                )}
                            </button>

                            <button
                                type="button"
                                className="chat-action-btn"
                                title={t('chatbot.close')}
                                aria-label={t('chatbot.close')}
                                onClick={closeChat}
                            >
                                <X size={20} strokeWidth={2.25} aria-hidden />
                            </button>
                        </div>
                    </div>

                    <div className="chat-suggestions">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="suggestion-chip"
                                onClick={() => handleSend(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <div className="chat-body" ref={bodyRef}>
                        {messages.map((msg) => (
                            <React.Fragment key={msg.id}>
                                <MessageBubble message={msg} />
                                {msg.sender === 'ai' && msg.suggestions?.length > 0 && (
                                    <div className="chat-results-grid">
                                        {msg.suggestions.map((suggestion, index) => (
                                            <SuggestionCard key={`${suggestion.slug}-${index}`} suggestion={suggestion} />
                                        ))}
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                <span /><span /><span />
                            </div>
                        )}
                    </div>

                    {imagePreview && (
                        <div className="image-preview-bar">
                            <img src={imagePreview} alt="preview" className="image-preview-thumb" />
                            <button type="button" className="image-preview-clear" onClick={clearImage}>✕</button>
                        </div>
                    )}

                    <div className="chat-footer">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        <button
                            type="button"
                            className="chat-upload-btn"
                            onClick={() => fileInputRef.current.click()}
                            title={t('chatbot.upload_title')}
                        >
                            <ImagePlus size={20} color="#fff" />
                        </button>
                        <input
                            type="text"
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('chatbot.placeholder')}
                        />
                        <button type="button" className="chat-send" onClick={() => handleSend()}>
                            <Send size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </>
    );
};

export default ChatbotWindow;
