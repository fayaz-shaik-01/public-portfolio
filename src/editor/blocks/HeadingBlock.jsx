import React, { useState, useRef, useEffect } from 'react';
import './BlockStyles.css';

const HeadingBlock = ({ block, onUpdate, onDelete, onAddBlock, level = 1 }) => {
    const [content, setContent] = useState(block.content.text || '');
    const inputRef = useRef(null);

    useEffect(() => {
        setContent(block.content.text || '');
    }, [block.content.text]);

    const handleChange = (e) => {
        setContent(e.target.value);
    };

    const handleBlur = () => {
        if (content !== block.content.text) {
            const anchor = content
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            onUpdate({ text: content, anchor });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAddBlock('paragraph', block.position + 1);
        }

        if (e.key === 'Backspace' && content === '') {
            e.preventDefault();
            onDelete();
        }
    };

    const headingClass = `heading${level}`;

    return (
        <div className={`block heading-block ${headingClass}`}>
            <input
                ref={inputRef}
                type="text"
                className={`block-input ${headingClass}-input`}
                value={content}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={`Heading ${level}`}
            />
        </div>
    );
};

export default HeadingBlock;
