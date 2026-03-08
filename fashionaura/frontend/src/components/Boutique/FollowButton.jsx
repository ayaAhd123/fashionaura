import React, { useState } from 'react';

const FollowButton = ({ boutiqueId, initialFollowed = false }) => {
    const [isFollowed, setIsFollowed] = useState(initialFollowed);

    const toggleFollow = () => {
        // Logique API pour suivre/désabonner
        setIsFollowed(!isFollowed);
    };

    return (
        <button
            className={`btn-primary ${isFollowed ? 'followed' : ''}`}
            onClick={toggleFollow}
            style={{ backgroundColor: isFollowed ? '#9ca3af' : 'var(--primary-color)' }}
        >
            {isFollowed ? 'Abonné' : 'S\'abonner'}
        </button>
    );
};

export default FollowButton;
