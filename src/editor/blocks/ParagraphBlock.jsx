import React, { useState, useRef, useEffect } from 'react';
import './BlockStyles.css';

const ParagraphBlock = ({ block, onUpdate, onDelete, onAddBlock }) => {
    const [content, setContent] = useState(block.content.text || '');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setContent(block.content.text || '');
    }, [block.content.text]);

    const handleChange = (e) => {
        const value = e.target.value;
        setContent(value);

        // Show slash menu when "/" is typed
        if (value.endsWith('/')) {
            setShowSlashMenu(true);
        } else {
            setShowSlashMenu(false);
        }
    };

    const handleBlur = () => {
        if (content !== block.content.text) {
            onUpdate({ text: content, marks: [] });
        }
    };

    const handleKeyDown = (e) => {
        // Handle Enter key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAddBlock('paragraph', block.position + 1);
        }

        // Handle Backspace on empty block
        if (e.key === 'Backspace' && content === '' && block.position > 0) {
            e.preventDefault();
            onDelete();
        }
    };

    return (
        <div className="block paragraph-block">
            <textarea
                ref={inputRef}
                className="block-input"
                value={content}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Type '/' for commands..."
                rows={1}
                style={{
                    minHeight: '1.5em',
                    resize: 'none',
                    overflow: 'hidden',
                }}
                onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
            />
        </div>
    );
};

export default ParagraphBlock;
