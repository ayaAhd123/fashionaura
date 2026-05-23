import React from 'react';
import '../../styles/dashboard.css';
import FashionAuraLogo from '../../components/common/FashionAuraLogo';

const OwnerDashboard = () => {
    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <FashionAuraLogo to="/" size="sm" className="dashboard-logo" />
                <h2>Boutique Owner</h2>
                <ul>
                    <li>Vue d'ensemble</li>
                    <li>Produits</li>
                    <li>Commandes</li>
                    <li>IA Conseiller</li>
                </ul>
            </aside>
            <main className="dashboard-content">
                <h1>Tableau de bord</h1>
                <div className="stats-grid">
                    <div className="stat-card">Ventes du jour: 1500€</div>
                    <div className="stat-card">Commandes à traiter: 5</div>
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;
