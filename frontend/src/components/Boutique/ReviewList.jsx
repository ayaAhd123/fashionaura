import React from 'react';

const ReviewList = ({ reviews }) => {
    return (
        <div className="review-list" style={{ marginTop: '20px' }}>
            <h3>Avis Clients</h3>
            {reviews ? reviews.map(review => (
                <div key={review.id} className="review-item" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <p><strong>{review.user?.name || 'Anonyme'}</strong> - {review.rating}/5</p>
                    <p>{review.comment}</p>
                </div>
            )) : <p>Aucun avis pour le moment.</p>}
        </div>
    );
};

export default ReviewList;
