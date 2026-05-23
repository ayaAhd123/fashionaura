import React, { useState } from 'react';

const ColorSelector = ({ colors, onSelect }) => {
    const [selected, setSelected] = useState(colors?.[0]);

    return (
        <div className="color-selector" style={{ display: 'flex', gap: '10px' }}>
            {colors ? colors.map(color => (
                <button
                    key={color}
                    onClick={() => { setSelected(color); onSelect && onSelect(color); }}
                    style={{
                        backgroundColor: color.toLowerCase(),
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: selected === color ? '2px solid var(--primary-color)' : '1px solid #ccc'
                    }}
                    title={color}
                />
            )) : null}
        </div>
    );
};

export default ColorSelector;
