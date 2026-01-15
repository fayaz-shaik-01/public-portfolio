import React from 'react';
import ParagraphBlock from './blocks/ParagraphBlock';
import HeadingBlock from './blocks/HeadingBlock';
import CodeBlock from './blocks/CodeBlock';
import MathBlock from './blocks/MathBlock';
import CalloutBlock from './blocks/CalloutBlock';
import { BLOCK_TYPES } from './utils/blockFactory';

const BlockRenderer = ({ block, onUpdate, onDelete, onAddBlock }) => {
    const commonProps = {
        block,
        onUpdate,
        onDelete,
        onAddBlock,
    };

    switch (block.type) {
        case BLOCK_TYPES.PARAGRAPH:
            return <ParagraphBlock {...commonProps} />;

        case BLOCK_TYPES.HEADING1:
            return <HeadingBlock {...commonProps} level={1} />;

        case BLOCK_TYPES.HEADING2:
            return <HeadingBlock {...commonProps} level={2} />;

        case BLOCK_TYPES.HEADING3:
            return <HeadingBlock {...commonProps} level={3} />;

        case BLOCK_TYPES.HEADING4:
            return <HeadingBlock {...commonProps} level={4} />;

        case BLOCK_TYPES.CODE:
            return <CodeBlock {...commonProps} />;

        case BLOCK_TYPES.MATH:
            return <MathBlock {...commonProps} />;

        case BLOCK_TYPES.CALLOUT:
            return <CalloutBlock {...commonProps} />;

        case BLOCK_TYPES.DIVIDER:
            return <div className="divider-block" />;

        default:
            return (
                <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    Unsupported block type: {block.type}
                </div>
            );
    }
};

export default BlockRenderer;
