import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { BLOCK_TYPES } from '../editor/utils/blockFactory';
import './CommandPalette.css';

const COMMANDS = [
    { id: BLOCK_TYPES.PARAGRAPH, label: 'Text', icon: '📝', keywords: ['text', 'paragraph', 'p'] },
    { id: BLOCK_TYPES.HEADING1, label: 'Heading 1', icon: 'H1', keywords: ['h1', 'heading1', 'title'] },
    { id: BLOCK_TYPES.HEADING2, label: 'Heading 2', icon: 'H2', keywords: ['h2', 'heading2'] },
    { id: BLOCK_TYPES.HEADING3, label: 'Heading 3', icon: 'H3', keywords: ['h3', 'heading3'] },
    { id: BLOCK_TYPES.CODE, label: 'Code Block', icon: '💻', keywords: ['code', 'snippet', 'programming'] },
    { id: BLOCK_TYPES.MATH, label: 'Equation', icon: '∑', keywords: ['math', 'latex', 'formula', 'equation'] },
    { id: BLOCK_TYPES.CALLOUT, label: 'Callout', icon: '💡', keywords: ['callout', 'note', 'info'] },
    { id: BLOCK_TYPES.DIVIDER, label: 'Divider', icon: '—', keywords: ['divider', 'separator', 'line'] },
    { id: BLOCK_TYPES.QUOTE, label: 'Quote', icon: '"', keywords: ['quote', 'blockquote'] },
];

const CommandPalette = ({ isOpen, onSelect, onClose, position }) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filtered = COMMANDS.filter(cmd =>
        cmd.keywords.some(kw => kw.includes(query.toLowerCase())) ||
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % filtered.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    onSelect(filtered[selectedIndex].id, position);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filtered, onSelect, onClose, position]);

    if (!isOpen) return null;

    return (
        <div className="command-palette-overlay" onClick={onClose}>
            <div className="command-palette" onClick={(e) => e.stopPropagation()}>
                <div className="command-palette-header">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search blocks..."
                        autoFocus
                        className="command-palette-input"
                    />
                </div>
                <div className="command-palette-list">
                    {filtered.length === 0 ? (
                        <div className="command-palette-empty">No blocks found</div>
                    ) : (
                        filtered.map((cmd, index) => (
                            <div
                                key={cmd.id}
                                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                                onClick={() => onSelect(cmd.id, position)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className="command-icon">{cmd.icon}</span>
                                <span className="command-label">{cmd.label}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="command-palette-footer">
                    <span>↑↓ Navigate</span>
                    <span>↵ Select</span>
                    <span>Esc Close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
