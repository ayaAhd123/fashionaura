import React from 'react';
import '../styles/city.css';

const CityPage = () => {
    return (
        <div className="city-page">
            <h1>Découvrir les Boutiques</h1>
            <div className="filter-bar">
                <input type="text" placeholder="Rechercher une boutique..." />
                <button className="btn-primary">Filtrer</button>
            </div>
            <div className="map-container">
                <p>Carte Interactive (Google Maps ou Mapbox)</p>
            </div>
            <div className="boutique-list">
                {/* Liste des boutiques ici */}
            </div>
        </div>
    );
};

export default CityPage;
