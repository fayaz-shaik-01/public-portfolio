import { Client } from '@notionhq/client';

/**
 * Vercel Serverless Function to sync a Notion page to Supabase
 * Uses ONLY the official Notion API
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { notionPageUrl } = req.body;

        if (!notionPageUrl) {
            return res.status(400).json({
                error: 'notionPageUrl is required',
                message: 'Please provide a Notion page URL'
            });
        }

        if (notionPageUrl.includes('?v=')) {
            return res.status(400).json({
                error: 'Database URL not supported',
                message: 'Please open an individual page from your database and copy that URL instead.'
            });
        }

        const pageId = extractPageId(notionPageUrl);

        if (!pageId) {
            return res.status(400).json({
                error: 'Invalid Notion URL',
                message: 'Could not extract page ID from URL.'
            });
        }

        const notion = new Client({
            auth: process.env.NOTION_API_TOKEN
        });

        console.log('Fetching Notion page:', pageId);

        const page = await notion.pages.retrieve({ page_id: pageId });
        const metadata = extractMetadata(page);
        const blocks = await fetchAllBlocks(notion, pageId);

        console.log(`Fetched ${blocks.length} blocks`);

        const slug = slugify(metadata.title || 'untitled');

        return res.status(200).json({
            success: true,
            data: {
                notion_page_id: pageId,
                title: metadata.title,
                slug: slug,
                excerpt: metadata.excerpt || '',
                cover_image: metadata.cover || null,
                tags: metadata.tags || [],
                published: metadata.published || false,
                notion_content: {
                    page: page,
                    blocks: blocks
                },
                last_synced_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error syncing Notion page:', error);
        return res.status(500).json({
            error: 'Failed to sync Notion page',
            message: error.message
        });
    }
}

function extractPageId(url) {
    try {
        const cleanUrl = url.split('?')[0].split('#')[0];
        const parts = cleanUrl.split('/');
        const lastPart = parts[parts.length - 1];
        const idMatch = lastPart.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);

        if (idMatch) {
            const rawId = idMatch[1].replace(/-/g, '');
            return `${rawId.slice(0, 8)}-${rawId.slice(8, 12)}-${rawId.slice(12, 16)}-${rawId.slice(16, 20)}-${rawId.slice(20)}`;
        }

        return null;
    } catch (error) {
        return null;
    }
}

function extractMetadata(page) {
    const metadata = {
        title: '',
        excerpt: '',
        cover: null,
        tags: [],
        published: false
    };

    if (page.properties?.title?.title?.[0]?.plain_text) {
        metadata.title = page.properties.title.title[0].plain_text;
    } else if (page.properties?.Name?.title?.[0]?.plain_text) {
        metadata.title = page.properties.Name.title[0].plain_text;
    }

    if (page.cover?.external?.url) {
        metadata.cover = page.cover.external.url;
    } else if (page.cover?.file?.url) {
        metadata.cover = page.cover.file.url;
    }

    if (page.properties?.Excerpt?.rich_text?.[0]?.plain_text) {
        metadata.excerpt = page.properties.Excerpt.rich_text[0].plain_text;
    }

    if (page.properties?.Tags?.multi_select) {
        metadata.tags = page.properties.Tags.multi_select.map(tag => tag.name);
    }

    if (page.properties?.Status?.select?.name) {
        const status = page.properties.Status.select.name.toLowerCase();
        metadata.published = (status === 'published');
    } else if (page.properties?.Status?.status?.name) {
        const status = page.properties.Status.status.name.toLowerCase();
        metadata.published = (status === 'published');
    }

    return metadata;
}

function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

async function fetchAllBlocks(notion, blockId) {
    const blocks = [];

    try {
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: blockId,
                start_cursor: startCursor,
                page_size: 100
            });

            blocks.push(...response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor;
        }

        // Recursively fetch children for blocks that have children
        for (const block of blocks) {
            if (block.has_children) {
                // Fetch children and attach to the block
                const children = await fetchAllBlocks(notion, block.id);

                // For tables, add children as separate blocks (table_row blocks)
                if (block.type === 'table') {
                    // Add table rows after the table block
                    blocks.push(...children);
                }
                // For other block types, attach children to the appropriate property
                else if (block.type === 'toggle') {
                    block.toggle.children = children;
                } else if (block.type === 'column') {
                    block.column.children = children;
                } else if (block.type === 'column_list') {
                    block.column_list.children = children;
                    // For other block types, add a generic children property
                    block.children = children;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching blocks:', error);
    }

    return blocks;
}
