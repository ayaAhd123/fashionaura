import React from 'react';

const ProductGrid = ({ products }) => {
    return (
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products ? products.map(product => (
                <div key={product.id} className="product-card" style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <img src={product.image_url || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%' }} />
                    <h4>{product.name}</h4>
                    <p>{product.price} €</p>
                </div>
            )) : <p>Aucun produit disponible.</p>}
        </div>
    );
};

export default ProductGrid;
