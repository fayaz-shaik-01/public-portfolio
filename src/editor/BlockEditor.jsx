import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import BlockRenderer from './BlockRenderer';
import CommandPalette from './CommandPalette';
import { Plus, Save, Clock } from 'lucide-react';
import './BlockEditor.css';

const BlockEditor = ({ articleId }) => {
    const {
        blocks,
        loadBlocks,
        addBlock,
        updateBlock,
        deleteBlock,
        saveBlocks,
        isSaving,
        lastSaved,
        isDirty,
    } = useEditorStore();

    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [commandPosition, setCommandPosition] = useState(0);

    useEffect(() => {
        if (articleId) {
            loadBlocks(articleId);
        }
    }, [articleId, loadBlocks]);

    // Autosave every 5 seconds if dirty
    useEffect(() => {
        if (!isDirty) return;

        const timer = setTimeout(() => {
            saveBlocks();
        }, 5000);

        return () => clearTimeout(timer);
    }, [blocks, isDirty, saveBlocks]);

    const handleAddBlock = (type, position) => {
        addBlock(type, position);
        setShowCommandPalette(false);
    };

    const handleUpdateBlock = (blockId) => (content) => {
        updateBlock(blockId, content);
    };

    const handleDeleteBlock = (blockId) => () => {
        deleteBlock(blockId);
    };

    const handleOpenCommandPalette = (position) => {
        setCommandPosition(position);
        setShowCommandPalette(true);
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Never';
        const seconds = Math.floor((Date.now() - lastSaved) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="block-editor-container">
            {/* Editor Header */}
            <div className="block-editor-header">
                <div className="editor-status">
                    <Clock size={16} />
                    <span>
                        {isSaving ? 'Saving...' : isDirty ? 'Unsaved changes' : `Saved ${formatLastSaved()}`}
                    </span>
                </div>
                <button
                    onClick={saveBlocks}
                    disabled={isSaving || !isDirty}
                    className="save-button"
                >
                    <Save size={16} />
                    Save Now
                </button>
            </div>

            {/* Blocks */}
            <div className="block-editor">
                {blocks.length === 0 ? (
                    <div className="editor-empty-state">
                        <p>Start writing or press <kbd>/</kbd> for commands</p>
                        <button
                            onClick={() => handleOpenCommandPalette(0)}
                            className="add-first-block-btn"
                        >
                            <Plus size={20} />
                            Add Block
                        </button>
                    </div>
                ) : (
                    blocks.map((block) => (
                        <div key={block.id} className="block-wrapper">
                            <div className="block-actions">
                                <button
                                    className="block-action-btn delete-btn"
                                    onClick={handleDeleteBlock(block.id)}
                                    title="Delete block"
                                >
                                    ×
                                </button>
                            </div>
                            <BlockRenderer
                                block={block}
                                onUpdate={handleUpdateBlock(block.id)}
                                onDelete={handleDeleteBlock(block.id)}
                                onAddBlock={handleAddBlock}
                            />
                            <button
                                className="add-block-btn"
                                onClick={() => handleOpenCommandPalette(block.position + 1)}
                                title="Add block below"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Command Palette */}
            <CommandPalette
                isOpen={showCommandPalette}
                onSelect={handleAddBlock}
                onClose={() => setShowCommandPalette(false)}
                position={commandPosition}
            />
        </div>
    );
};

export default BlockEditor;
