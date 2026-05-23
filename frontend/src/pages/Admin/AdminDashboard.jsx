import React from 'react';
import '../../styles/dashboard.css';
import FashionAuraLogo from '../../components/common/FashionAuraLogo';

const AdminDashboard = () => {
    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <FashionAuraLogo to="/" size="sm" className="dashboard-logo" />
                <h2>Super Admin</h2>
                <ul>
                    <li>Vue globale</li>
                    <li>Villes</li>
                    <li>Validation Boutiques</li>
                </ul>
            </aside>
            <main className="dashboard-content">
                <h1>Tableau de bord Administrateur</h1>
                <div className="stats-grid">
                    <div className="stat-card">Total Boutiques: 50</div>
                    <div className="stat-card">Boutiques en attente: 3</div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
