import React from 'react';

const MessageBubble = ({ message }) => {
    const isAi = message.sender === 'ai';

    return (
        <div className={`message-container ${isAi ? 'ai' : 'user'}`}>
            <div className={`message-bubble ${isAi ? 'ai-bubble' : 'user-bubble'}`}>
                {message.image && (
                    <div className="message-image-container">
                        <img src={message.image} alt="User upload" className="message-image" />
                    </div>
                )}
                <div className="message-text">
                    {message.text}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
