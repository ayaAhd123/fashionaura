import React from 'react';
import FashionAuraLogo from '../common/FashionAuraLogo';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <FashionAuraLogo to="/dashboard/owner" size="sm" className="logo" />
            <nav>
                <ul>
                    <li>Tableau de bord</li>
                    <li>Produits</li>
                    <li>Commandes</li>
                    <li>Paramètres</li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
