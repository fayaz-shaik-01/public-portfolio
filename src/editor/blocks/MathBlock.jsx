import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import './BlockStyles.css';

const COMMON_SYMBOLS = [
    { label: 'α', latex: '\\alpha' },
    { label: 'β', latex: '\\beta' },
    { label: 'γ', latex: '\\gamma' },
    { label: 'Δ', latex: '\\Delta' },
    { label: '∑', latex: '\\sum' },
    { label: '∫', latex: '\\int' },
    { label: '∞', latex: '\\infty' },
    { label: '≈', latex: '\\approx' },
    { label: '≠', latex: '\\neq' },
    { label: '≤', latex: '\\leq' },
    { label: '≥', latex: '\\geq' },
    { label: '√', latex: '\\sqrt{}' },
    { label: 'x²', latex: 'x^2' },
    { label: 'xₙ', latex: 'x_n' },
    { label: '∂', latex: '\\partial' },
    { label: '∇', latex: '\\nabla' },
];

const MathBlock = ({ block, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [latex, setLatex] = useState(block.content.latex || '');
    const [error, setError] = useState(null);

    const handleLatexChange = (e) => {
        setLatex(e.target.value);
        setError(null);
    };

    const handleBlur = () => {
        if (latex !== block.content.latex) {
            onUpdate({
                ...block.content,
                latex,
            });
        }
        setEditing(false);
    };

    const insertSymbol = (symbol) => {
        setLatex(latex + symbol);
    };

    const renderMath = () => {
        try {
            if (block.content.display === 'inline') {
                return <InlineMath math={latex} />;
            }
            return <BlockMath math={latex} />;
        } catch (err) {
            setError(err.message);
            return <div style={{ color: '#ef4444' }}>Error: {err.message}</div>;
        }
    };

    return (
        <div className="math-block" onClick={() => !editing && setEditing(true)}>
            {editing ? (
                <div className="math-editor">
                    <textarea
                        value={latex}
                        onChange={handleLatexChange}
                        onBlur={handleBlur}
                        placeholder="Enter LaTeX equation (e.g., E = mc^2)..."
                        autoFocus
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {COMMON_SYMBOLS.map(symbol => (
                            <button
                                key={symbol.latex}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    insertSymbol(symbol.latex);
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                }}
                                title={symbol.latex}
                            >
                                {symbol.label}
                            </button>
                        ))}
                    </div>
                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="math-preview">
                    {latex ? renderMath() : (
                        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            Click to add equation
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MathBlock;
