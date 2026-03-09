import React from 'react';

const BoutiqueCard = ({ boutique }) => {
    return (
        <div className="boutique-card" style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <img src={boutique.logo_url || 'https://via.placeholder.com/150'} alt={boutique.name} style={{ width: '100%' }} />
            <h4>{boutique.name}</h4>
            <p>{boutique.address}</p>
        </div>
    );
};

export default BoutiqueCard;
