import React, { useState } from 'react';
import '../styles/product.css';

const ProductPage = () => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);

    const handleSubmitComment = (event) => {
        event.preventDefault();
        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            return;
        }

        setComments((previousComments) => [trimmedComment, ...previousComments]);
        setComment('');
    };

    return (
        <div className="product-page">
            <div className="product-main">
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

            <section className="comment-section">
                <h2>Laisser un commentaire</h2>
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder="Ecrivez votre commentaire..."
                        className="comment-input"
                        rows={4}
                    />
                    <button type="submit" className="btn-primary">
                        Publier
                    </button>
                </form>

                <div className="comment-list">
                    {comments.length === 0 ? (
                        <p>Aucun commentaire pour le moment.</p>
                    ) : (
                        comments.map((item, index) => (
                            <p key={`${item}-${index}`} className="comment-item">
                                {item}
                            </p>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductPage;
