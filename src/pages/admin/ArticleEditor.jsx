import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import BlockEditor from '../../editor/BlockEditor';
import { Save, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isNew = id === 'new';

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [published, setPublished] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [articleData, setArticleData] = useState(null);

    useEffect(() => {
        if (!isNew && id) {
            fetchArticle();
        } else if (isNew) {
            // Create a new article in database first
            createNewArticle();
        }
    }, [id, isNew]);

    useEffect(() => {
        // Auto-generate slug from title
        if (isNew && title) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generatedSlug);
        }
    }, [title, isNew]);

    const createNewArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .insert([{
                    title: 'Untitled Article',
                    slug: `untitled-${Date.now()}`,
                    excerpt: '',
                    published: false,
                    author_id: user.id,
                }])
                .select()
                .single();

            if (error) throw error;

            setArticleData(data);
            navigate(`/admin/articles/${data.id}`, { replace: true });
        } catch (error) {
            console.error('Error creating article:', error);
            setError(`Failed to create article: ${error.message}`);
        }
    };

    const fetchArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setArticleData(data);
            setTitle(data.title);
            setSlug(data.slug);
            setExcerpt(data.excerpt || '');
            setPublished(data.published || false);
        } catch (error) {
            console.error('Error fetching article:', error);
            setError('Failed to load article');
        }
    };

    const handleSaveMetadata = async () => {
        if (!title.trim() || !slug.trim()) {
            setError('Title and slug are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const { error } = await supabase
                .from('articles')
                .update({
                    title,
                    slug,
                    excerpt,
                    published,
                })
                .eq('id', articleData.id);

            if (error) throw error;

            alert('Article metadata saved successfully!');
        } catch (error) {
            console.error('Error saving metadata:', error);
            setError(error.message || 'Failed to save metadata');
        } finally {
            setSaving(false);
        }
    };

    if (!articleData && !isNew) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid var(--glass-border)',
                        borderTop: '3px solid var(--accent-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading article...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={() => setPublished(!published)}
                            className="glass"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: published ? '#86efac' : 'var(--text-secondary)'
                            }}
                        >
                            {published ? <Eye size={18} /> : <EyeOff size={18} />}
                            {published ? 'Published' : 'Draft'}
                        </button>
                        <button
                            onClick={handleSaveMetadata}
                            disabled={saving}
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'var(--accent-primary)',
                                border: 'none',
                                color: '#fff',
                                fontWeight: 700,
                                borderRadius: '8px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: saving ? 0.6 : 1
                            }}
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Metadata'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                        <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Title and Metadata */}
                <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter article title..."
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.75rem 1rem',
                                color: '#fff',
                                borderRadius: '8px',
                                outline: 'none',
                                fontSize: '1.5rem',
                                fontWeight: 600
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Slug (URL)
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="article-url-slug"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '0.75rem 1rem',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Excerpt (Optional)
                            </label>
                            <input
                                type="text"
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="Brief description..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    padding: '0.75rem 1rem',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Block Editor */}
                {articleData && (
                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Content</h3>
                        <BlockEditor articleId={articleData.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleEditor;
