import React from 'react';

const MessageBubble = ({ message }) => {
    const isAi = message.sender === 'ai';

    return (
        <div style={{
            display: 'flex',
            justifyContent: isAi ? 'flex-start' : 'flex-end',
            marginBottom: '10px'
        }}>
            <div style={{
                background: isAi ? '#f3f4f6' : 'var(--primary-color)',
                color: isAi ? '#374151' : 'white',
                padding: '10px',
                borderRadius: '16px',
                borderBottomLeftRadius: isAi ? '4px' : '16px',
                borderBottomRightRadius: !isAi ? '4px' : '16px',
                maxWidth: '80%'
            }}>
                {message.text}
            </div>
        </div>
    );
};

export default MessageBubble;
