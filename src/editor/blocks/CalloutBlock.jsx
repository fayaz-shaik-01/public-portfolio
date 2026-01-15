import React, { useState } from 'react';
import './BlockStyles.css';

const CALLOUT_COLORS = [
    { value: 'blue', label: 'Info', icon: 'ℹ️' },
    { value: 'yellow', label: 'Warning', icon: '⚠️' },
    { value: 'red', label: 'Error', icon: '❌' },
    { value: 'green', label: 'Success', icon: '✅' },
];

const CalloutBlock = ({ block, onUpdate }) => {
    const [text, setText] = useState(block.content.text || '');
    const [color, setColor] = useState(block.content.color || 'blue');
    const [icon, setIcon] = useState(block.content.icon || '💡');

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleBlur = () => {
        if (text !== block.content.text || color !== block.content.color || icon !== block.content.icon) {
            onUpdate({ text, color, icon });
        }
    };

    const handleColorChange = (newColor, newIcon) => {
        setColor(newColor);
        setIcon(newIcon);
        onUpdate({ text, color: newColor, icon: newIcon });
    };

    return (
        <div className={`callout-block ${color}`}>
            <div className="callout-icon">{icon}</div>
            <div className="callout-content">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {CALLOUT_COLORS.map(c => (
                        <button
                            key={c.value}
                            onClick={() => handleColorChange(c.value, c.icon)}
                            style={{
                                background: color === c.value ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                color: '#fff',
                            }}
                        >
                            {c.icon} {c.label}
                        </button>
                    ))}
                </div>
                <textarea
                    value={text}
                    onChange={handleTextChange}
                    onBlur={handleBlur}
                    placeholder="Add a callout message..."
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        resize: 'none',
                        minHeight: '60px',
                        fontFamily: 'var(--font-main)',
                    }}
                />
            </div>
        </div>
    );
};

export default CalloutBlock;
