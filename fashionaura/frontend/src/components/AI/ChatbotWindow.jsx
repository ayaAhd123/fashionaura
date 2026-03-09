import React, { useState } from 'react';
import MessageBubble from './MessageBubble';

const ChatbotWindow = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Bonjour ! Comment puis-je vous aider avec votre style aujourd\'hui ?' }
    ]);

    return (
        <div className="chatbot-window" style={{ position: 'fixed', bottom: '80px', right: '20px', width: '350px', height: '400px', border: '1px solid #ccc', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div className="chat-header" style={{ background: 'var(--primary-color)', color: 'white', padding: '10px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                Conseiller Mode IA
            </div>
            <div className="chat-body" style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
            </div>
            <div className="chat-footer" style={{ padding: '10px', borderTop: '1px solid #eee', display: 'flex' }}>
                <input type="text" placeholder="Écrire un message..." style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #ccc' }} />
                <button className="btn-primary" style={{ marginLeft: '10px', borderRadius: '50%' }}>Envoyer</button>
            </div>
        </div>
    );
};

export default ChatbotWindow;
