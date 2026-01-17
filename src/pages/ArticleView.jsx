import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { NotionRenderer } from 'react-notion-x';

// Import Notion styles
import 'react-notion-x/src/styles.css';
import 'prismjs/themes/prism-tomorrow.css';
import 'katex/dist/katex.min.css';

const ArticleView = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            // Fetch article with Notion content
            const { data: articleData, error: articleError } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (articleError) throw articleError;
            if (!articleData) {
                setError('Article not found');
                setLoading(false);
                return;
            }

            setArticle(articleData);
        } catch (error) {
            console.error('Error fetching article:', error);
            setError('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
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

    if (error || !article) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass" style={{ maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Article Not Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        {error || 'The article you\'re looking for doesn\'t exist or has been removed.'}
                    </p>
                    <Link to="/articles" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        ← Back to Articles
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article style={{ minHeight: '100vh', padding: '120px 0 80px' }}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link to="/articles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Back to Articles
                    </Link>

                    {/* Article Header */}
                    <div style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            <Calendar size={14} />
                            {formatDate(article.created_at)}
                        </div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: 1.2, marginBottom: '1rem' }}>
                            {article.title}
                        </h1>
                        {article.excerpt && (
                            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {article.excerpt}
                            </p>
                        )}
                    </div>

                    {/* Notion Content */}
                    {article.notion_content ? (
                        <div className="notion-container">
                            <NotionRenderer
                                recordMap={article.notion_content}
                                fullPage={false}
                                darkMode={true}
                                disableHeader={true}
                                showTableOfContents={false}
                                minTableOfContentsItems={3}
                            />
                        </div>
                    ) : (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                No Notion content available.
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                This article may have been created before Notion integration was added.
                                Try re-syncing from Notion to display the content.
                            </p>
                            {/* Debug info */}
                            <details style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
                                <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', overflow: 'auto' }}>
                                    {JSON.stringify({
                                        hasNotionContent: !!article.notion_content,
                                        notionPageId: article.notion_page_id,
                                        lastSynced: article.last_synced_at,
                                        contentKeys: article.notion_content ? Object.keys(article.notion_content) : []
                                    }, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', paddingTop: '3rem', marginTop: '3rem', borderTop: '1px solid var(--glass-border)' }}>
                        <Link to="/articles" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
                            ← Back to All Articles
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Custom styles for Notion content */}
            <style>{`
                /* Override Notion styles to match portfolio theme */
                .notion-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--glass-border);
                    border-radius: 12px;
                    padding: 3rem;
                    backdrop-filter: blur(10px);
                }

                .notion-page {
                    padding: 0 !important;
                    background: transparent !important;
                }

                .notion-text {
                    color: var(--text-primary) !important;
                    line-height: 1.8 !important;
                }

                .notion-h1, .notion-h2, .notion-h3 {
                    color: var(--text-primary) !important;
                }

                .notion-code {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid var(--glass-border) !important;
                    border-radius: 8px !important;
                }

                .notion-callout {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid var(--glass-border) !important;
                    border-radius: 8px !important;
                }

                .notion-quote {
                    border-left: 4px solid var(--accent-primary) !important;
                    background: rgba(255, 255, 255, 0.02) !important;
                }

                .notion-link {
                    color: var(--accent-primary) !important;
                }

                .notion-asset-wrapper {
                    border-radius: 8px;
                    overflow: hidden;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </article>
    );
};

export default ArticleView;
