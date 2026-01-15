// Block type definitions
export const BLOCK_TYPES = {
    PARAGRAPH: 'paragraph',
    HEADING1: 'heading1',
    HEADING2: 'heading2',
    HEADING3: 'heading3',
    HEADING4: 'heading4',
    BULLET_LIST: 'bulletList',
    NUMBERED_LIST: 'numberedList',
    TOGGLE: 'toggle',
    QUOTE: 'quote',
    CALLOUT: 'callout',
    DIVIDER: 'divider',
    CODE: 'code',
    MATH: 'math',
    IMAGE: 'image',
    MINDMAP: 'mindmap',
    TABLE: 'table',
};

// Block factory - creates new blocks
export const createBlock = (type, content = {}, position = 0) => {
    const baseBlock = {
        id: crypto.randomUUID(), // Generate proper UUID v4
        type,
        position,
        content: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    switch (type) {
        case BLOCK_TYPES.PARAGRAPH:
            return {
                ...baseBlock,
                content: {
                    text: content.text || '',
                    marks: content.marks || [],
                },
            };

        case BLOCK_TYPES.HEADING1:
        case BLOCK_TYPES.HEADING2:
        case BLOCK_TYPES.HEADING3:
        case BLOCK_TYPES.HEADING4:
            return {
                ...baseBlock,
                content: {
                    text: content.text || '',
                    anchor: content.anchor || generateAnchor(content.text || ''),
                },
            };

        case BLOCK_TYPES.CODE:
            return {
                ...baseBlock,
                content: {
                    language: content.language || 'javascript',
                    code: content.code || '',
                    filename: content.filename || '',
                    showLineNumbers: content.showLineNumbers !== false,
                    highlightLines: content.highlightLines || [],
                },
            };

        case BLOCK_TYPES.MATH:
            return {
                ...baseBlock,
                content: {
                    latex: content.latex || '',
                    display: content.display || 'block',
                    description: content.description || '',
                },
            };

        case BLOCK_TYPES.CALLOUT:
            return {
                ...baseBlock,
                content: {
                    icon: content.icon || '💡',
                    color: content.color || 'blue',
                    text: content.text || '',
                },
            };

        case BLOCK_TYPES.TOGGLE:
            return {
                ...baseBlock,
                content: {
                    summary: content.summary || 'Toggle',
                    isOpen: content.isOpen || false,
                },
            };

        case BLOCK_TYPES.QUOTE:
            return {
                ...baseBlock,
                content: {
                    text: content.text || '',
                    author: content.author || '',
                },
            };

        case BLOCK_TYPES.MINDMAP:
            return {
                ...baseBlock,
                content: {
                    mindmapId: content.mindmapId || null,
                    title: content.title || 'Mind Map',
                    thumbnail: content.thumbnail || null,
                },
            };

        case BLOCK_TYPES.IMAGE:
            return {
                ...baseBlock,
                content: {
                    url: content.url || '',
                    alt: content.alt || '',
                    caption: content.caption || '',
                    width: content.width || null,
                    height: content.height || null,
                },
            };

        case BLOCK_TYPES.DIVIDER:
            return {
                ...baseBlock,
                content: {},
            };

        default:
            return baseBlock;
    }
};

// Generate URL-friendly anchor from heading text
const generateAnchor = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// Validate block structure
export const validateBlock = (block) => {
    if (!block.id || !block.type || !block.content) {
        return false;
    }

    if (!Object.values(BLOCK_TYPES).includes(block.type)) {
        return false;
    }

    return true;
};

// Serialize blocks to JSON for storage
export const serializeBlocks = (blocks) => {
    return blocks.map(block => ({
        id: block.id,
        position: block.position,
        parent_id: block.parent_id || null,
        type: block.type,
        content: block.content,
    }));
};

// Deserialize blocks from database
export const deserializeBlocks = (dbBlocks) => {
    return dbBlocks.map(block => ({
        id: block.id,
        position: block.position,
        parent_id: block.parent_id,
        type: block.type,
        content: block.content,
        created_at: block.created_at,
        updated_at: block.updated_at,
    }));
};
