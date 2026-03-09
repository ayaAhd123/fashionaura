import React from 'react';
import '../styles/product.css';

const ProductPage = () => {
    return (
        <div className="product-page">
            <div className="product-images">
                <img src="https://via.placeholder.com/500" alt="Product" />
            </div>
            <div className="product-details">
                <h1>Nom du Produit</h1>
                <p className="product-price">120.00 €</p>
                <p>Description courte du produit.</p>

                <div className="color-selector">
                    <span>Couleur:</span>
                    <button style={{ backgroundColor: 'red', width: '20px', height: '20px' }}></button>
                    <button style={{ backgroundColor: 'black', width: '20px', height: '20px' }}></button>
                </div>

                <div className="size-selector">
                    <span>Taille:</span>
                    <button>S</button>
                    <button>M</button>
                    <button>L</button>
                </div>

                <button className="btn-primary" style={{ marginTop: '2rem' }}>Ajouter au panier</button>
            </div>
        </div>
    );
};

export default ProductPage;
