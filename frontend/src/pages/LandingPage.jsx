import React from 'react';
import '../styles/landing.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="landing-hero">
                <h1>Bienvenue sur FashionAura</h1>
                <p>Découvrez la mode locale et les meilleures boutiques autour de vous.</p>
                <button className="btn-primary">Explorer les villes</button>
            </header>
        </div>
    );
};

export default LandingPage;
