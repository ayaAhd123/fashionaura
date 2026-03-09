import React from 'react';

const AIAdvisorPage = () => {
    return (
        <div>
            <h2>Conseiller IA</h2>
            <p>Demandez des suggestions basées sur les tendances actuelles.</p>
            <textarea placeholder="Posez votre question à l'IA..." rows="4" style={{ width: '100%' }}></textarea>
            <button className="btn-primary" style={{ marginTop: '1rem' }}>Demander</button>
        </div>
    );
};

export default AIAdvisorPage;
