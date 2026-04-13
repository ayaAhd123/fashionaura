import React, { useState, useRef, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Maximize2, Minimize2, X, Expand, Shrink, Send, ImagePlus, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { sendMessage } from '../../api/chatbotService';
import './ChatbotWindow.css';

const SUGGESTIONS = [
    'Tenue pour un mariage',
    'Idee cadeau',
    'Boutiques a Tanger',
    'Tendances actuelles',
];

const ChatbotWindow = () => {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [fullpage, setFullpage] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Salam ! Je suis FashionBot, ton styliste IA de FashionAura.\nComment puis-je t'aider aujourd'hui ?",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const bodyRef = useRef(null);
    const fileInputRef = useRef(null);
    const controls = useDragControls();

    // Classe dynamique selon le mode
    const windowClass = [
        'chatbot-window',
        expanded ? 'expanded' : '',
        fullpage ? 'fullpage' : '',
    ].filter(Boolean).join(' ');

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('openFashionBot', handleOpen);
        return () => window.removeEventListener('openFashionBot', handleOpen);
    }, []);

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
            text: msg || '📷 Photo envoyée',
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
            const reply = await sendMessage(msg, history, imageToSend);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, sender: 'ai', text: reply },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, sender: 'ai', text: 'Desole, une erreur est survenue.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Overlay sombre en fullpage */}
            {fullpage && open && (
                <div
                    className="chatbot-overlay visible"
                    onClick={() => setFullpage(false)}
                />
            )}

            {/* Bouton flottant — caché en fullpage */}
            {!fullpage && (
                <button className="fab-btn" onClick={() => setOpen(!open)}>
                    {open ? <X size={24} /> : <Sparkles size={24} />}
                </button>
            )}

            {/* Fenêtre chat */}
            {open && (
                <motion.div 
                    className={windowClass}
                    drag={!fullpage}
                    dragControls={controls}
                    dragListener={false}
                    dragMomentum={false}
                    animate={fullpage ? { x: 0, y: 0 } : {}}
                >

                    {/* Header */}
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
                            <span className="chat-name">FashionBot</span>
                            <span className="chat-status">
                                <span className="status-dot" />
                                Styliste IA · FashionAura
                            </span>
                        </div>

                        <div className="chat-header-actions">
                            {/* Agrandir / Réduire */}
                            <button
                                type="button"
                                className="chat-action-btn"
                                title={expanded ? 'Réduire' : 'Agrandir'}
                                onClick={() => { setExpanded(!expanded); setFullpage(false); }}
                            >
                                {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>

                            {/* Pleine page */}
                            <button
                                type="button"
                                className="chat-action-btn"
                                title={fullpage ? 'Quitter pleine page' : 'Pleine page'}
                                onClick={() => { setFullpage(!fullpage); setExpanded(false); }}
                            >
                                {fullpage ? <Shrink size={16} /> : <Expand size={16} />}
                            </button>

                            {/* Fermer */}
                            <button
                                type="button"
                                className="chat-action-btn"
                                onClick={() => { setOpen(false); setExpanded(false); setFullpage(false); }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Suggestions */}
                    <div className="chat-suggestions">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                className="suggestion-chip"
                                onClick={() => handleSend(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="chat-body" ref={bodyRef}>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                <span /><span /><span />
                            </div>
                        )}
                    </div>

                    {/* Preview image */}
                    {imagePreview && (
                        <div className="image-preview-bar">
                            <img src={imagePreview} alt="preview" className="image-preview-thumb" />
                            <button className="image-preview-clear" onClick={clearImage}>✕</button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="chat-footer">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleImageSelect}
                        />
                        <button
                            className="chat-upload-btn"
                            onClick={() => fileInputRef.current.click()}
                            title="Envoyer une photo"
                        >
                            <ImagePlus size={20} color="#666" />
                        </button>
                        <input
                            type="text"
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ecris ta question mode..."
                        />
                        <button className="chat-send" onClick={() => handleSend()}>
                            <Send size={16} />
                        </button>
                    </div>

                </motion.div>
            )}
        </>
    );
};

export default ChatbotWindow;