import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import NotionRenderer from '../components/notion/NotionRenderer';

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
                    {article.notion_content?.blocks ? (
                        <div className="notion-content-wrapper" style={{ marginBottom: '3rem' }}>
                            <NotionRenderer blocks={article.notion_content.blocks} />
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
                        </div>
                    )}

                    <div style={{ textAlign: 'center', paddingTop: '3rem', marginTop: '3rem', borderTop: '1px solid var(--glass-border)' }}>
                        <Link to="/articles" style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
                            ← Back to All Articles
                        </Link>
                    </div>
                </motion.div>
            </div>
        </article>
    );
};

export default ArticleView;
