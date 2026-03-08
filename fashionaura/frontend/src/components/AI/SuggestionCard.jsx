import React from 'react';

const SuggestionCard = ({ suggestion }) => {
    return (
        <div className="suggestion-card" style={{ display: 'flex', border: '1px solid #eee', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
            <img src={suggestion.image_url || 'https://via.placeholder.com/80'} alt="Suggestion" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
            <div style={{ marginLeft: '10px' }}>
                <h5 style={{ margin: '0 0 5px 0' }}>{suggestion.title}</h5>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{suggestion.description}</p>
                <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', marginTop: '5px' }}>Voir le produit</button>
            </div>
        </div>
    );
};

export default SuggestionCard;
