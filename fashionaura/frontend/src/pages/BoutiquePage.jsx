import React from 'react';
import '../styles/boutique.css';

const BoutiquePage = () => {
    return (
        <div className="boutique-page">
            <img src="https://via.placeholder.com/1200x300" alt="Boutique banner" className="boutique-banner" />
            <div className="boutique-header">
                <h1>Nom de la Boutique</h1>
                <button className="btn-primary">S'abonner</button>
            </div>
            <p>Description de la boutique...</p>

            <div className="product-grid">
                {/* Produits ici */}
                <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>Produit 1</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>Produit 2</div>
                <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>Produit 3</div>
            </div>
        </div>
    );
};

export default BoutiquePage;
