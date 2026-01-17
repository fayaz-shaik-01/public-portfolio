import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw, Check, X, ExternalLink } from 'lucide-react';

const NotionSyncForm = ({ onSuccess, onCancel }) => {
    const [notionUrl, setNotionUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const handleFetchPreview = async () => {
        if (!notionUrl.trim()) {
            setError('Please enter a Notion page URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Call our Vercel API route to fetch Notion content
            const response = await fetch('/api/notion/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ notionPageUrl: notionUrl }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch Notion page');
            }

            setPreviewData(result.data);
        } catch (err) {
            console.error('Error fetching Notion page:', err);
            setError(err.message || 'Failed to fetch Notion page. Make sure the page is shared with your integration.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToSupabase = async () => {
        if (!previewData) return;

        setLoading(true);
        setError('');

        try {
            // Save to Supabase
            const { data, error: saveError } = await supabase
                .from('articles')
                .insert([
                    {
                        notion_page_id: previewData.notion_page_id,
                        title: previewData.title,
                        slug: previewData.slug,
                        excerpt: previewData.excerpt,
                        cover_image: previewData.cover_image,
                        notion_content: previewData.notion_content,
                        last_synced_at: previewData.last_synced_at,
                        author_id: user.id,
                        published: false, // Default to draft
                    },
                ])
                .select()
                .single();

            if (saveError) throw saveError;

            // Success!
            if (onSuccess) onSuccess(data);
        } catch (err) {
            console.error('Error saving to Supabase:', err);
            setError(err.message || 'Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Article from Notion</h2>

            {/* URL Input */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Notion Page URL
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={notionUrl}
                        onChange={(e) => setNotionUrl(e.target.value)}
                        placeholder="https://www.notion.so/..."
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.875rem',
                        }}
                        disabled={loading || previewData}
                    />
                    <button
                        onClick={handleFetchPreview}
                        disabled={loading || previewData}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: loading || previewData ? 'not-allowed' : 'pointer',
                            opacity: loading || previewData ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={16} className="spin" />
                                Fetching...
                            </>
                        ) : (
                            <>
                                <ExternalLink size={16} />
                                Fetch
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}

            {/* Preview */}
            {previewData && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                        Preview
                    </h3>

                    {previewData.cover_image && (
                        <img
                            src={previewData.cover_image}
                            alt={previewData.title}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                            }}
                        />
                    )}

                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Title
                            </label>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{previewData.title}</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                Slug
                            </label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                /articles/{previewData.slug}
                            </p>
                        </div>

                        {previewData.excerpt && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                    Excerpt
                                </label>
                                <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{previewData.excerpt}</p>
                            </div>
                        )}

                        {previewData.tags && previewData.tags.length > 0 && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Tags
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {previewData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                padding: '0.25rem 0.75rem',
                                                background: 'rgba(139, 92, 246, 0.2)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                borderRadius: '100px',
                                                fontSize: '0.75rem',
                                                color: '#a78bfa',
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <X size={16} />
                    Cancel
                </button>
                {previewData && (
                    <button
                        onClick={handleSaveToSupabase}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={16} className="spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Save to Portfolio
                            </>
                        )}
                    </button>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default NotionSyncForm;
