import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ReactFlow, { Background, Controls } from 'reactflow';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import 'reactflow/dist/style.css';

const ArticleView = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const editor = useEditor({
        extensions: [StarterKit],
        editable: false,
        content: article?.content || '',
    });

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    useEffect(() => {
        if (editor && article?.content) {
            editor.commands.setContent(article.content);
        }
    }, [editor, article]);

    const fetchArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (error) throw error;
            if (!data) {
                setError('Article not found');
            } else {
                setArticle(data);
            }
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
                        <EditorContent
                            editor={editor}
                            style={{
                                color: 'var(--text-primary)',
                                lineHeight: 1.8,
                                fontSize: '1.05rem'
                            }}
                        />
                    </div>

                    {article.mindmap_data && article.mindmap_data.nodes && article.mindmap_data.nodes.length > 0 && (
                        <div className="glass" style={{ padding: '2rem', marginBottom: '3rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Visual Mindmap</h3>
                            <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                <ReactFlow
                                    nodes={article.mindmap_data.nodes}
                                    edges={article.mindmap_data.edges}
                                    fitView
                                    nodesDraggable={false}
                                    nodesConnectable={false}
                                    elementsSelectable={false}
                                >
                                    <Background color="#333" gap={20} />
                                    <Controls showInteractive={false} />
                                </ReactFlow>
                            </div>
                        </div>
                    )}

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
