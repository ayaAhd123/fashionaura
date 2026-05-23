import React from 'react';

const BoutiqueBanner = ({ imageUrl }) => {
    return (
        <div className="boutique-banner-img">
            <img src={imageUrl || 'https://via.placeholder.com/1200x300'} alt="Boutique Banner" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
        </div>
    );
};

export default BoutiqueBanner;
