import React from 'react';

const CityCard = ({ city }) => {
    return (
        <div className="city-card">
            <img src={city.image_url || 'https://via.placeholder.com/300x200'} alt={city.name} />
            <h3>{city.name}</h3>
            <p>{city.description}</p>
        </div>
    );
};

export default CityCard;
