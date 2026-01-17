import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BlockMath } from 'react-katex';
import RichText from './RichText';
import MermaidBlock from './MermaidBlock';
import 'katex/dist/katex.min.css';

/**
 * Main Notion Block Renderer
 * Supports all essential Notion block types with pixel-perfect styling
 */

const NotionRenderer = ({ blocks }) => {
    if (!blocks || blocks.length === 0) {
        return <p style={{ color: 'var(--text-secondary)' }}>No content</p>;
    }

    // Group blocks to handle tables and nested structures
    const groupedBlocks = groupBlocks(blocks);

    return (
        <div className="notion-content">
            {groupedBlocks.map((item, index) => {
                if (item.type === 'table_group') {
                    return <TableGroup key={index} rows={item.rows} />;
                }
                return <Block key={item.block.id || index} block={item.block} />;
            })}
        </div>
    );
};

// Helper function to group table rows together
function groupBlocks(blocks) {
    const grouped = [];
    let i = 0;

    while (i < blocks.length) {
        const block = blocks[i];

        // Group table rows
        if (block.type === 'table') {
            const tableRows = [];
            i++; // Move past the table block

            // Collect all consecutive table_row blocks
            while (i < blocks.length && blocks[i].type === 'table_row') {
                tableRows.push(blocks[i]);
                i++;
            }

            grouped.push({
                type: 'table_group',
                rows: tableRows
            });
        } else {
            grouped.push({ block });
            i++;
        }
    }

    return grouped;
}

const Block = ({ block }) => {
    const { type } = block;

    // Skip table and table_row blocks - they're handled by TableGroup
    if (type === 'table' || type === 'table_row') {
        return null;
    }

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
        case 'to_do':
            return <TodoBlock block={block} />;
        case 'toggle':
            return <ToggleBlock block={block} />;
        case 'code':
            return <CodeBlock block={block} />;
        case 'quote':
            return <QuoteBlock block={block} />;
        case 'callout':
            return <CalloutBlock block={block} />;
        case 'divider':
            return <DividerBlock />;
        case 'image':
            return <ImageBlock block={block} />;
        case 'video':
            return <VideoBlock block={block} />;
        case 'file':
            return <FileBlock block={block} />;
        case 'equation':
            return <EquationBlock block={block} />;
        case 'bookmark':
            return <BookmarkBlock block={block} />;
        case 'embed':
            return <EmbedBlock block={block} />;
        case 'link_preview':
            return <LinkPreviewBlock block={block} />;
        case 'column_list':
            return <ColumnListBlock block={block} />;
        case 'column':
            return <ColumnBlock block={block} />;
        default:
            return <UnsupportedBlock block={block} />;
    }
};

// ==================== TEXT BLOCKS ====================

const ParagraphBlock = ({ block }) => {
    const text = block.paragraph?.rich_text || [];
    if (text.length === 0) return <p style={{ minHeight: '1.5em' }}>&nbsp;</p>;

    return (
        <p style={{
            marginBottom: '0.5em',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)'
        }}>
            <RichText richText={text} />
        </p>
    );
};

const Heading1Block = ({ block }) => (
    <h1 style={{
        fontSize: '1.875em',
        fontWeight: '700',
        lineHeight: '1.3',
        marginTop: '2em',
        marginBottom: '0.25em',
        color: 'rgba(255, 255, 255, 0.95)'
    }}>
        <RichText richText={block.heading_1?.rich_text || []} />
    </h1>
);

const Heading2Block = ({ block }) => (
    <h2 style={{
        fontSize: '1.5em',
        fontWeight: '600',
        lineHeight: '1.3',
        marginTop: '1.4em',
        marginBottom: '0.25em',
        color: 'rgba(255, 255, 255, 0.95)'
    }}>
        <RichText richText={block.heading_2?.rich_text || []} />
    </h2>
);

const Heading3Block = ({ block }) => (
    <h3 style={{
        fontSize: '1.25em',
        fontWeight: '600',
        lineHeight: '1.3',
        marginTop: '1em',
        marginBottom: '0.25em',
        color: 'rgba(255, 255, 255, 0.95)'
    }}>
        <RichText richText={block.heading_3?.rich_text || []} />
    </h3>
);

const BulletedListBlock = ({ block }) => (
    <ul style={{
        paddingLeft: '1.5em',
        marginBottom: '0.25em',
        listStyleType: 'disc'
    }}>
        <li style={{
            paddingLeft: '0.375em',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)'
        }}>
            <RichText richText={block.bulleted_list_item?.rich_text || []} />
        </li>
    </ul>
);

const NumberedListBlock = ({ block }) => (
    <ol style={{
        paddingLeft: '1.5em',
        marginBottom: '0.25em',
        listStyleType: 'decimal'
    }}>
        <li style={{
            paddingLeft: '0.375em',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)'
        }}>
            <RichText richText={block.numbered_list_item?.rich_text || []} />
        </li>
    </ol>
);

const TodoBlock = ({ block }) => {
    const checked = block.to_do?.checked || false;

    return (
        <div style={{
            display: 'flex',
            gap: '0.5em',
            marginBottom: '0.25em',
            alignItems: 'flex-start'
        }}>
            <input
                type="checkbox"
                checked={checked}
                readOnly
                style={{
                    marginTop: '0.3em',
                    cursor: 'not-allowed',
                    accentColor: '#2eaadc'
                }}
            />
            <div style={{
                flex: 1,
                lineHeight: '1.6',
                textDecoration: checked ? 'line-through' : 'none',
                opacity: checked ? 0.5 : 1,
                color: 'rgba(255, 255, 255, 0.9)'
            }}>
                <RichText richText={block.to_do?.rich_text || []} />
            </div>
        </div>
    );
};

const ToggleBlock = ({ block }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <details
            open={isOpen}
            onToggle={(e) => setIsOpen(e.target.open)}
            style={{
                margin: '0.25em 0',
                padding: '0.5em 0'
            }}
        >
            <summary style={{
                cursor: 'pointer',
                listStyle: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6'
            }}>
                <span style={{
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    display: 'inline-block'
                }}>
                    ▸
                </span>
                <RichText richText={block.toggle?.rich_text || []} />
            </summary>
            {block.toggle?.children && (
                <div style={{ paddingLeft: '1.5em', marginTop: '0.5em' }}>
                    <NotionRenderer blocks={block.toggle.children} />
                </div>
            )}
        </details>
    );
};

const QuoteBlock = ({ block }) => (
    <blockquote style={{
        margin: '0.5em 0',
        padding: '0.5em 1em',
        borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.8)',
        background: 'rgba(255, 255, 255, 0.02)'
    }}>
        <RichText richText={block.quote?.rich_text || []} />
    </blockquote>
);

const CalloutBlock = ({ block }) => {
    const icon = block.callout?.icon?.emoji || '💡';
    const color = block.callout?.color || 'gray_background';

    const backgroundColors = {
        gray_background: 'rgba(241, 241, 239, 0.6)',
        brown_background: 'rgba(244, 238, 238, 0.6)',
        orange_background: 'rgba(251, 236, 221, 0.6)',
        yellow_background: 'rgba(251, 243, 219, 0.6)',
        green_background: 'rgba(237, 243, 236, 0.6)',
        blue_background: 'rgba(231, 243, 248, 0.6)',
        purple_background: 'rgba(244, 240, 247, 0.6)',
        pink_background: 'rgba(249, 238, 243, 0.6)',
        red_background: 'rgba(253, 235, 236, 0.6)',
    };

    return (
        <div style={{
            display: 'flex',
            gap: '0.75em',
            padding: '1em',
            margin: '0.5em 0',
            borderRadius: '4px',
            background: backgroundColors[color] || backgroundColors.gray_background,
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            <span style={{ fontSize: '1.5em', lineHeight: '1' }}>{icon}</span>
            <div style={{ flex: 1, lineHeight: '1.6', color: 'rgba(55, 53, 47, 0.9)' }}>
                <RichText richText={block.callout?.rich_text || []} />
            </div>
        </div>
    );
};

const DividerBlock = () => (
    <hr style={{
        margin: '1.5em 0',
        border: 'none',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }} />
);

// ==================== CODE & MATH ====================

const CodeBlock = ({ block }) => {
    const code = block.code?.rich_text?.map(t => t.plain_text).join('') || '';
    const language = block.code?.language || 'text';

    // Check if it's a Mermaid diagram
    if (language === 'mermaid') {
        return <MermaidBlock code={code} />;
    }

    return (
        <div style={{ margin: '1em 0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
                padding: '0.5em 1em',
                background: 'rgba(0, 0, 0, 0.3)',
                fontSize: '0.875em',
                color: 'rgba(255, 255, 255, 0.6)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {language}
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '1em',
                    fontSize: '0.875em',
                    background: '#1e1e1e'
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

const EquationBlock = ({ block }) => (
    <div style={{
        margin: '1em 0',
        padding: '1em',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '4px'
    }}>
        <BlockMath math={block.equation?.expression || ''} />
    </div>
);

// ==================== MEDIA BLOCKS ====================

const ImageBlock = ({ block }) => {
    const url = block.image?.file?.url || block.image?.external?.url;
    const caption = block.image?.caption?.map(t => t.plain_text).join('') || '';

    return (
        <figure style={{ margin: '1.5em 0' }}>
            <img
                src={url}
                alt={caption}
                style={{
                    width: '100%',
                    borderRadius: '4px',
                    display: 'block'
                }}
            />
            {caption && (
                <figcaption style={{
                    marginTop: '0.5em',
                    fontSize: '0.875em',
                    color: 'rgba(255, 255, 255, 0.6)',
                    textAlign: 'center'
                }}>
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};

const VideoBlock = ({ block }) => {
    const url = block.video?.file?.url || block.video?.external?.url;

    return (
        <div style={{ margin: '1.5em 0' }}>
            <video
                controls
                style={{
                    width: '100%',
                    borderRadius: '4px'
                }}
            >
                <source src={url} />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

const FileBlock = ({ block }) => {
    const url = block.file?.file?.url || block.file?.external?.url;
    const name = block.file?.name || 'Download file';

    return (
        <a
            href={url}
            download
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5em',
                padding: '0.75em 1em',
                margin: '0.5em 0',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                transition: 'background 0.2s'
            }}
        >
            📎 {name}
        </a>
    );
};

// ==================== TABLE ====================

const TableGroup = ({ rows }) => {
    if (!rows || rows.length === 0) return null;

    return (
        <div style={{ margin: '1em 0', overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.id || index}>
                            {(row.table_row?.cells || []).map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    style={{
                                        padding: '0.5em',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        minWidth: '100px'
                                    }}
                                >
                                    <RichText richText={cell} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Keep these for backwards compatibility but they won't be used
const TableBlock = ({ block }) => null;
const TableRowBlock = ({ block }) => null;

// ==================== EMBEDS ====================

const BookmarkBlock = ({ block }) => {
    const url = block.bookmark?.url || '';
    const caption = block.bookmark?.caption?.map(t => t.plain_text).join('') || url;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                padding: '1em',
                margin: '1em 0',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                transition: 'background 0.2s'
            }}
        >
            🔖 {caption}
        </a>
    );
};

const EmbedBlock = ({ block }) => {
    const url = block.embed?.url || '';

    return (
        <div style={{ margin: '1.5em 0' }}>
            <iframe
                src={url}
                style={{
                    width: '100%',
                    height: '400px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '4px'
                }}
                title="Embedded content"
            />
        </div>
    );
};

const LinkPreviewBlock = ({ block }) => {
    const url = block.link_preview?.url || '';

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'block',
                padding: '1em',
                margin: '1em 0',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: '#2eaadc',
                textDecoration: 'none'
            }}
        >
            {url}
        </a>
    );
};

// ==================== LAYOUT ====================

const ColumnListBlock = ({ block }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '1em',
            margin: '1em 0'
        }}>
            {block.column_list?.children?.map((column, index) => (
                <ColumnBlock key={index} block={column} />
            ))}
        </div>
    );
};

const ColumnBlock = ({ block }) => {
    return (
        <div style={{ flex: 1 }}>
            {block.column?.children && (
                <NotionRenderer blocks={block.column.children} />
            )}
        </div>
    );
};

// ==================== UNSUPPORTED ====================

const UnsupportedBlock = ({ block }) => (
    <details style={{
        margin: '1em 0',
        padding: '1em',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '4px'
    }}>
        <summary style={{
            cursor: 'pointer',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.875em'
        }}>
            ⚠️ Unsupported block type: <code>{block.type}</code>
        </summary>
        <pre style={{
            marginTop: '0.5em',
            fontSize: '0.75em',
            overflow: 'auto',
            color: 'rgba(255, 255, 255, 0.5)'
        }}>
            {JSON.stringify(block, null, 2)}
        </pre>
    </details>
);

export default NotionRenderer;
