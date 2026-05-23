import React, { useState } from 'react';

const SizeSelector = ({ sizes, onSelect }) => {
    const [selected, setSelected] = useState(sizes?.[0]);

    return (
        <div className="size-selector" style={{ display: 'flex', gap: '10px' }}>
            {sizes ? sizes.map(size => (
                <button
                    key={size}
                    onClick={() => { setSelected(size); onSelect && onSelect(size); }}
                    style={{ border: selected === size ? '2px solid var(--primary-color)' : '1px solid #ccc' }}
                >
                    {size}
                </button>
            )) : <span>Taille unique</span>}
        </div>
    );
};

export default SizeSelector;
