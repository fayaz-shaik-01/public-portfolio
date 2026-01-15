import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../lib/supabaseClient';
import { createBlock, serializeBlocks, deserializeBlocks } from '../editor/utils/blockFactory';

export const useEditorStore = create(
    immer((set, get) => ({
        // State
        articleId: null,
        blocks: [],
        selectedBlockId: null,
        isLoading: false,
        isSaving: false,
        lastSaved: null,
        isDirty: false,

        // Actions
        setArticleId: (id) => set({ articleId: id }),

        loadBlocks: async (articleId) => {
            set({ isLoading: true });
            try {
                const { data, error } = await supabase
                    .from('blocks')
                    .select('*')
                    .eq('article_id', articleId)
                    .order('position');

                if (error) throw error;

                set({
                    blocks: deserializeBlocks(data || []),
                    articleId,
                    isLoading: false,
                    isDirty: false,
                });
            } catch (error) {
                console.error('Error loading blocks:', error);
                set({ isLoading: false });
            }
        },

        addBlock: (type, position) => set((state) => {
            const newBlock = createBlock(type, {}, position);

            // Shift positions of blocks after insertion point
            state.blocks.forEach(block => {
                if (block.position >= position) {
                    block.position += 1;
                }
            });

            state.blocks.push(newBlock);
            state.blocks.sort((a, b) => a.position - b.position);
            state.isDirty = true;
        }),

        updateBlock: (blockId, content) => set((state) => {
            const block = state.blocks.find(b => b.id === blockId);
            if (block) {
                block.content = content;
                block.updated_at = new Date().toISOString();
                state.isDirty = true;
            }
        }),

        deleteBlock: (blockId) => set((state) => {
            const blockIndex = state.blocks.findIndex(b => b.id === blockId);
            if (blockIndex !== -1) {
                const deletedPosition = state.blocks[blockIndex].position;
                state.blocks.splice(blockIndex, 1);

                // Shift positions of blocks after deleted block
                state.blocks.forEach(block => {
                    if (block.position > deletedPosition) {
                        block.position -= 1;
                    }
                });

                state.isDirty = true;
            }
        }),

        reorderBlocks: (startIndex, endIndex) => set((state) => {
            const [removed] = state.blocks.splice(startIndex, 1);
            state.blocks.splice(endIndex, 0, removed);

            // Update positions
            state.blocks.forEach((block, index) => {
                block.position = index;
            });

            state.isDirty = true;
        }),

        saveBlocks: async () => {
            const { articleId, blocks } = get();
            if (!articleId) return;

            set({ isSaving: true });

            try {
                // Check auth status first
                const { data: { session } } = await supabase.auth.getSession();
                console.log('Auth session:', session?.user?.id);
                console.log('Article ID:', articleId);

                // First, delete all existing blocks for this article
                const { error: deleteError } = await supabase
                    .from('blocks')
                    .delete()
                    .eq('article_id', articleId);

                if (deleteError) {
                    console.error('Delete error:', deleteError);
                    throw deleteError;
                }

                // Then insert all current blocks
                if (blocks.length > 0) {
                    const serialized = serializeBlocks(blocks).map(block => ({
                        ...block,
                        article_id: articleId,
                    }));

                    console.log('Saving blocks:', serialized);

                    const { data, error } = await supabase
                        .from('blocks')
                        .insert(serialized)
                        .select();

                    if (error) {
                        console.error('Supabase error:', error);
                        console.error('Error details:', JSON.stringify(error, null, 2));
                        throw error;
                    }

                    console.log('Blocks saved successfully:', data);
                }

                set({
                    isSaving: false,
                    lastSaved: new Date(),
                    isDirty: false,
                });
            } catch (error) {
                console.error('Error saving blocks:', error);
                alert(`Failed to save: ${error.message}`);
                set({ isSaving: false });
            }
        },

        setSelectedBlock: (blockId) => set({ selectedBlockId: blockId }),

        clearEditor: () => set({
            articleId: null,
            blocks: [],
            selectedBlockId: null,
            isDirty: false,
        }),
    }))
);
