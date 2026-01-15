import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const ArticlesList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('published', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (error) {
            console.error('Error fetching articles:', error);
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
                    <p style={{ color: 'var(--text-secondary)' }}>Loading articles...</p>
                </div>
            </div>
        );
    }

    return (
        <section style={{ minHeight: '100vh', padding: '120px 0 80px' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Articles & Insights</h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                        Exploring GenAI, Robotics, and the future of intelligent systems
                    </p>
                </div>

                {articles.length === 0 ? (
                    <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            No articles published yet. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {articles.map((article, index) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={`/articles/${article.slug}`} style={{ display: 'block', height: '100%' }}>
                                    <div className="glass" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} />
                                                {formatDate(article.created_at)}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={14} />
                                                5 min read
                                            </span>
                                        </div>

                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>
                                            {article.title}
                                        </h3>

                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, flex: 1 }}>
                                            {article.excerpt || 'Click to read more...'}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                                            Read Article <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'underline' }}>
                        ← Back to Portfolio
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ArticlesList;
