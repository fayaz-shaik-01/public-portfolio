import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Custom Notion Block Renderer
 * Renders blocks from the official Notion API
 */

const NotionBlockRenderer = ({ blocks }) => {
    if (!blocks || blocks.length === 0) {
        return <p style={{ color: 'var(--text-secondary)' }}>No content</p>;
    }

    return (
        <div className="notion-blocks">
            {blocks.map((block) => (
                <BlockComponent key={block.id} block={block} />
            ))}
        </div>
    );
};

const BlockComponent = ({ block }) => {
    const { type } = block;

    switch (type) {
        case 'paragraph':
            return <ParagraphBlock block={block} />;
        case 'heading_1':
            return <Heading1Block block={block} />;
        case 'heading_2':
            return <Heading2Block block={block} />;
        case 'heading_3':
            return <Heading3Block block={block} />;
        case 'bulleted_list_item':
            return <BulletedListBlock block={block} />;
        case 'numbered_list_item':
            return <NumberedListBlock block={block} />;
        case 'code':
            return <CodeBlock block={block} />;
        case 'quote':
            return <QuoteBlock block={block} />;
        case 'callout':
            return <CalloutBlock block={block} />;
        case 'divider':
            return <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--glass-border)' }} />;
        case 'image':
            return <ImageBlock block={block} />;
        case 'equation':
            return <EquationBlock block={block} />;
        default:
            return <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                Unsupported block type: {type}
            </div>;
    }
};

const RichText = ({ richText }) => {
    if (!richText || richText.length === 0) return null;

    return richText.map((text, index) => {
        let content = text.plain_text;
        let style = {};

        if (text.annotations.bold) style.fontWeight = 'bold';
        if (text.annotations.italic) style.fontStyle = 'italic';
        if (text.annotations.strikethrough) style.textDecoration = 'line-through';
        if (text.annotations.underline) style.textDecoration = 'underline';
        if (text.annotations.code) {
            return <code key={index} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontFamily: 'monospace' }}>{content}</code>;
        }

        if (text.href) {
            return <a key={index} href={text.href} style={{ color: 'var(--accent-primary)', textDecoration: 'underline', ...style }}>{content}</a>;
        }

        return <span key={index} style={style}>{content}</span>;
    });
};

const ParagraphBlock = ({ block }) => (
    <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
        <RichText richText={block.paragraph.rich_text} />
    </p>
);

const Heading1Block = ({ block }) => (
    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>
        <RichText richText={block.heading_1.rich_text} />
    </h1>
);

const Heading2Block = ({ block }) => (
    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
        <RichText richText={block.heading_2.rich_text} />
    </h2>
);

const Heading3Block = ({ block }) => (
    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
        <RichText richText={block.heading_3.rich_text} />
    </h3>
);

const BulletedListBlock = ({ block }) => (
    <li style={{ marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        <RichText richText={block.bulleted_list_item.rich_text} />
    </li>
);

const NumberedListBlock = ({ block }) => (
    <li style={{ marginLeft: '1.5rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        <RichText richText={block.numbered_list_item.rich_text} />
    </li>
);

const CodeBlock = ({ block }) => (
    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', background: '#1e1e1e' }}>
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', color: '#888' }}>
            {block.code.language}
        </div>
        <pre style={{ margin: 0, padding: '1rem', overflow: 'auto' }}>
            <code style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#d4d4d4' }}>
                {block.code.rich_text.map(t => t.plain_text).join('')}
            </code>
        </pre>
    </div>
);

const QuoteBlock = ({ block }) => (
    <blockquote style={{ margin: '1.5rem 0', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent-primary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)' }}>
        <RichText richText={block.quote.rich_text} />
    </blockquote>
);

const CalloutBlock = ({ block }) => (
    <div style={{
        margin: '1.5rem 0',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderLeft: '4px solid var(--accent-primary)',
        borderRadius: '8px',
        display: 'flex',
        gap: '0.75rem'
    }}>
        {block.callout.icon && (
            <span style={{ fontSize: '1.5rem' }}>
                {block.callout.icon.emoji || '💡'}
            </span>
        )}
        <div style={{ flex: 1 }}>
            <RichText richText={block.callout.rich_text} />
        </div>
    </div>
);

const ImageBlock = ({ block }) => {
    const imageUrl = block.image.file?.url || block.image.external?.url;
    const caption = block.image.caption?.map(t => t.plain_text).join('') || '';

    return (
        <figure style={{ margin: '1.5rem 0' }}>
            <img
                src={imageUrl}
                alt={caption}
                style={{ width: '100%', borderRadius: '8px' }}
            />
            {caption && (
                <figcaption style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

const EquationBlock = ({ block }) => (
    <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
        <BlockMath math={block.equation.expression} />
    </div>
);

export default NotionBlockRenderer;
