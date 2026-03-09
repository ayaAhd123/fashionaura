import React from 'react';

const RelatedOutfits = ({ products }) => {
    return (
        <div className="related-outfits" style={{ marginTop: '40px' }}>
            <h3>Vous aimerez aussi</h3>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {products ? products.map(product => (
                    <div key={product.id} style={{ minWidth: '200px', border: '1px solid #ddd', padding: '10px' }}>
                        <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%' }} />
                        <p>{product.name}</p>
                    </div>
                )) : <p>Suggestions indisponibles</p>}
            </div>
        </div>
    );
};

export default RelatedOutfits;
