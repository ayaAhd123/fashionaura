import React, { useEffect, useState } from 'react';
import { getCities } from '../api/cityService';
import '../styles/landing.css';

const LandingPage = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCities()
            .then(data => {
                setCities(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="landing-page">
            <header className="landing-hero">
                <h1>Bienvenue sur FashionAura</h1>
                <p>Découvrez la mode locale et les meilleures boutiques autour de vous.</p>
                <button className="btn-primary">Explorer les villes</button>
            </header>

            <section className="cities-section">
                <h2>Nos Villes</h2>
                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <div className="cities-grid">
                        {cities.map(city => (
                            <div key={city.id} className="city-card">
                                <h3>{city.name}</h3>
                                <p>{city.region}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LandingPage;