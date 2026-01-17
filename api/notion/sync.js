import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';

/**
 * Vercel Serverless Function to sync a Notion page to Supabase
 * 
 * POST /api/notion/sync
 * Body: { notionPageUrl: string }
 * 
 * This function:
 * 1. Extracts the page ID from the Notion URL
 * 2. Fetches the page content using notion-client (unofficial API for full content)
 * 3. Fetches metadata using official Notion API
 * 4. Returns the data to be saved by the frontend
 */

export default async function handler(req, res) {
    // Only allow POST requests
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

        // Check if it's a database URL (contains ?v= parameter)
        if (notionPageUrl.includes('?v=')) {
            return res.status(400).json({
                error: 'Database URL not supported',
                message: 'Please open an individual page from your database and copy that URL instead. Database/table view URLs are not supported.'
            });
        }

        // Extract page ID from URL
        const pageId = extractPageId(notionPageUrl);

        if (!pageId) {
            return res.status(400).json({
                error: 'Invalid Notion URL',
                message: 'Could not extract page ID from URL. Please make sure you\'re using a valid Notion page URL.'
            });
        }

        // Initialize Notion clients
        const notionAPI = new NotionAPI(); // Unofficial API for full content
        const officialNotion = new Client({
            auth: process.env.NOTION_API_TOKEN
        }); // Official API for metadata

        // Fetch full page content (for rendering)
        console.log('Fetching Notion page content:', pageId);
        const recordMap = await notionAPI.getPage(pageId);

        // Fetch page metadata (title, cover, etc.)
        let metadata = {};
        try {
            const page = await officialNotion.pages.retrieve({ page_id: pageId });
            metadata = extractMetadata(page);
        } catch (error) {
            console.warn('Could not fetch metadata from official API:', error.message);
            // Fallback to extracting from recordMap
            metadata = extractMetadataFromRecordMap(recordMap);
        }

        // Generate slug from title
        const slug = slugify(metadata.title || 'untitled');

        // Return data to frontend
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
                notion_content: recordMap,
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

/**
 * Extract page ID from various Notion URL formats
 */
function extractPageId(url) {
    try {
        // Remove query parameters and anchors
        const cleanUrl = url.split('?')[0].split('#')[0];

        // Extract the last part which contains the ID
        const parts = cleanUrl.split('/');
        const lastPart = parts[parts.length - 1];

        // Notion IDs are 32 characters (with or without hyphens)
        // Format: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx or xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        const idMatch = lastPart.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);

        if (idMatch) {
            // Remove hyphens for consistency
            return idMatch[1].replace(/-/g, '');
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Extract metadata from official Notion API response
 */
function extractMetadata(page) {
    const metadata = {
        title: '',
        excerpt: '',
        cover: null,
        tags: []
    };

    // Extract title
    if (page.properties?.title?.title?.[0]?.plain_text) {
        metadata.title = page.properties.title.title[0].plain_text;
    } else if (page.properties?.Name?.title?.[0]?.plain_text) {
        metadata.title = page.properties.Name.title[0].plain_text;
    }

    // Extract cover image
    if (page.cover?.external?.url) {
        metadata.cover = page.cover.external.url;
    } else if (page.cover?.file?.url) {
        metadata.cover = page.cover.file.url;
    }

    // Extract excerpt (if exists as a property)
    if (page.properties?.Excerpt?.rich_text?.[0]?.plain_text) {
        metadata.excerpt = page.properties.Excerpt.rich_text[0].plain_text;
    }

    // Extract tags (if exists as a multi-select property)
    if (page.properties?.Tags?.multi_select) {
        metadata.tags = page.properties.Tags.multi_select.map(tag => tag.name);
    }

    // Extract published status from Status property
    metadata.published = false; // Default to draft
    if (page.properties?.Status?.select?.name) {
        const status = page.properties.Status.select.name.toLowerCase();
        metadata.published = (status === 'published');
    } else if (page.properties?.Status?.status?.name) {
        const status = page.properties.Status.status.name.toLowerCase();
        metadata.published = (status === 'published');
    }

    return metadata;
}

/**
 * Fallback: Extract metadata from recordMap (unofficial API response)
 */
function extractMetadataFromRecordMap(recordMap) {
    const metadata = {
        title: 'Untitled',
        excerpt: '',
        cover: null,
        tags: []
    };

    try {
        // Find the page block
        const pageId = Object.keys(recordMap.block).find(id =>
            recordMap.block[id]?.value?.type === 'page'
        );

        if (pageId) {
            const pageBlock = recordMap.block[pageId].value;

            // Extract title
            if (pageBlock.properties?.title?.[0]?.[0]) {
                metadata.title = pageBlock.properties.title[0][0];
            }

            // Extract cover
            if (pageBlock.format?.page_cover) {
                metadata.cover = pageBlock.format.page_cover;
            }
        }
    } catch (error) {
        console.warn('Error extracting metadata from recordMap:', error);
    }

    return metadata;
}

/**
 * Generate URL-friendly slug from title
 */
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
