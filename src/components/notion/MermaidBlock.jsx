import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

/**
 * Mermaid Diagram Component
 * Renders Mermaid diagrams from code blocks
 */
const MermaidBlock = ({ code }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            try {
                mermaid.initialize({
                    startOnLoad: true,
                    theme: 'dark',
                    securityLevel: 'loose',
                });
                mermaid.contentLoaded();
            } catch (error) {
                console.error('Mermaid rendering error:', error);
            }
        }
    }, [code]);

    return (
        <div
            ref={ref}
            className="mermaid-diagram"
            style={{
                margin: '1.5rem 0',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px',
                overflow: 'auto'
            }}
        >
            <div className="mermaid">
                {code}
            </div>
        </div>
    );
};

export default MermaidBlock;
