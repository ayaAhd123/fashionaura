import React, { useState } from 'react';
import '../styles/boutique.css';

const BoutiquePage = () => {
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

export default BoutiquePage;
