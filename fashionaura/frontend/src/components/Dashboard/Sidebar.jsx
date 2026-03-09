import React from 'react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="logo">FashionAura</div>
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
