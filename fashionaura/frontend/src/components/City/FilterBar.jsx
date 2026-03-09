import React from 'react';

const FilterBar = () => {
    return (
        <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Catégorie..." />
            <select>
                <option>Filtrer par...</option>
                <option>Avis</option>
                <option>Nouveauté</option>
            </select>
        </div>
    );
};

export default FilterBar;
