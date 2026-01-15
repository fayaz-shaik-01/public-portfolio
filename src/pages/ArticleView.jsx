import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const ArticleView = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            // Fetch article
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

            // Fetch blocks
            const { data: blocksData, error: blocksError } = await supabase
                .from('blocks')
                .select('*')
                .eq('article_id', articleData.id)
                .order('position');

            if (blocksError) throw blocksError;
            setBlocks(blocksData || []);
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

    const renderBlock = (block) => {
        switch (block.type) {
            case 'paragraph':
                return (
                    <p style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
                        {block.content.text}
                    </p>
                );

            case 'heading1':
                return (
                    <h1 id={block.content.anchor} style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem' }}>
                        {block.content.text}
                    </h1>
                );

            case 'heading2':
                return (
                    <h2 id={block.content.anchor} style={{ fontSize: '2rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                        {block.content.text}
                    </h2>
                );

            case 'heading3':
                return (
                    <h3 id={block.content.anchor} style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                        {block.content.text}
                    </h3>
                );

            case 'heading4':
                return (
                    <h4 id={block.content.anchor} style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }}>
                        {block.content.text}
                    </h4>
                );

            case 'code':
                return (
                    <div style={{ margin: '1.5rem 0', borderRadius: '8px', overflow: 'hidden', background: '#1e1e1e' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.875rem', color: '#888' }}>
                            {block.content.language}
                        </div>
                        <Editor
                            height="auto"
                            language={block.content.language}
                            value={block.content.code}
                            theme="vs-dark"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                lineNumbers: block.content.showLineNumbers ? 'on' : 'off',
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                wordWrap: 'on',
                            }}
                        />
                    </div>
                );

            case 'math':
                return (
                    <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                        {block.content.display === 'inline' ? (
                            <InlineMath math={block.content.latex} />
                        ) : (
                            <BlockMath math={block.content.latex} />
                        )}
                    </div>
                );

            case 'callout':
                const calloutColors = {
                    blue: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6' },
                    yellow: { bg: 'rgba(251, 191, 36, 0.1)', border: '#fbbf24' },
                    red: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444' },
                    green: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' },
                };
                const colors = calloutColors[block.content.color] || calloutColors.blue;
                return (
                    <div style={{
                        margin: '1.5rem 0',
                        padding: '1rem',
                        background: colors.bg,
                        borderLeft: `4px solid ${colors.border}`,
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>{block.content.icon}</span>
                        <p style={{ flex: 1, margin: 0 }}>{block.content.text}</p>
                    </div>
                );

            case 'divider':
                return <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid var(--glass-border)' }} />;

            case 'quote':
                return (
                    <blockquote style={{ margin: '1.5rem 0', padding: '1rem 1.5rem', borderLeft: '4px solid var(--accent-primary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ margin: 0 }}>{block.content.text}</p>
                        {block.content.author && (
                            <footer style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                — {block.content.author}
                            </footer>
                        )}
                    </blockquote>
                );

            default:
                return null;
        }
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
            <div className="container" style={{ maxWidth: '800px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Link to="/articles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
                        <ArrowLeft size={16} /> Back to Articles
                    </Link>

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

                    <div className="glass" style={{ padding: '3rem', marginBottom: '3rem' }}>
                        {blocks.length > 0 ? (
                            blocks.map((block) => (
                                <div key={block.id}>
                                    {renderBlock(block)}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                No content available yet.
                            </p>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', paddingTop: '3rem', borderTop: '1px solid var(--glass-border)' }}>
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
