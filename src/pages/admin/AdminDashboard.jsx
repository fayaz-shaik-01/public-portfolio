import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Edit, Trash2, Eye, EyeOff, LogOut, Mail, FileText, RefreshCw } from 'lucide-react';
import NotionSyncForm from '../../components/NotionSyncForm';

const AdminDashboard = () => {
    const [articles, setArticles] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'contacts'
    const [showNotionSync, setShowNotionSync] = useState(false);
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all articles (published and unpublished)
            const { data: articlesData, error: articlesError } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (articlesError) throw articlesError;
            setArticles(articlesData || []);

            // Fetch contacts
            const { data: contactsData, error: contactsError } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (contactsError) throw contactsError;
            setContacts(contactsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const togglePublish = async (articleId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('articles')
                .update({ published: !currentStatus })
                .eq('id', articleId);

            if (error) throw error;
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error toggling publish status:', error);
        }
    };

    const deleteArticle = async (articleId) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', articleId);

            if (error) throw error;
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    const markContactAsRead = async (contactId, currentStatus) => {
        try {
            const { error } = await supabase
                .from('contacts')
                .update({ read: !currentStatus })
                .eq('id', contactId);

            if (error) throw error;
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                    <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/" className="glass" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                            View Portfolio
                        </Link>
                        <button onClick={handleSignOut} className="glass" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => setActiveTab('articles')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'articles' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === 'articles' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <FileText size={18} /> Articles ({articles.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('contacts')}
                        style={{
                            padding: '1rem 2rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'contacts' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                            color: activeTab === 'contacts' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Mail size={18} /> Contacts ({contacts.filter(c => !c.read).length} unread)
                    </button>
                </div>

                {/* Articles Tab */}
                {activeTab === 'articles' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Manage Articles</h2>
                            <button
                                onClick={() => setShowNotionSync(true)}
                                style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', color: '#fff', cursor: 'pointer' }}
                            >
                                <Plus size={18} /> Add from Notion
                            </button>
                        </div>

                        {articles.length === 0 ? (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>No articles yet. Create your first one!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {articles.map((article) => (
                                    <motion.div
                                        key={article.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="glass"
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.25rem' }}>{article.title}</h3>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    background: article.published ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                                                    color: article.published ? '#86efac' : '#d1d5db'
                                                }}>
                                                    {article.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                Created {formatDate(article.created_at)}
                                                {article.last_synced_at && (
                                                    <> • Synced {formatDate(article.last_synced_at)}</>
                                                )}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => togglePublish(article.id, article.published)}
                                                className="glass"
                                                style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', cursor: 'pointer', borderRadius: '6px' }}
                                                title={article.published ? 'Unpublish' : 'Publish'}
                                            >
                                                {article.published ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            <button
                                                onClick={() => deleteArticle(article.id)}
                                                className="glass"
                                                style={{ padding: '0.5rem', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', borderRadius: '6px', color: '#ef4444' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Contacts Tab */}
                {activeTab === 'contacts' && (
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Contact Submissions</h2>

                        {contacts.length === 0 ? (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>No contact submissions yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {contacts.map((contact) => (
                                    <motion.div
                                        key={contact.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="glass"
                                        style={{
                                            padding: '1.5rem',
                                            opacity: contact.read ? 0.6 : 1,
                                            borderLeft: contact.read ? 'none' : '3px solid var(--accent-primary)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{contact.name}</h3>
                                                <a href={`mailto:${contact.email}`} style={{ color: 'var(--accent-primary)', fontSize: '0.875rem' }}>
                                                    {contact.email}
                                                </a>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                    {formatDate(contact.created_at)}
                                                </p>
                                                <button
                                                    onClick={() => markContactAsRead(contact.id, contact.read)}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: 'transparent',
                                                        border: '1px solid var(--glass-border)',
                                                        color: 'var(--text-secondary)',
                                                        cursor: 'pointer',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    Mark as {contact.read ? 'Unread' : 'Read'}
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                                            {contact.message}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notion Sync Modal */}
                {showNotionSync && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '2rem',
                    }}>
                        <NotionSyncForm
                            onSuccess={(article) => {
                                setShowNotionSync(false);
                                fetchData(); // Refresh articles list
                            }}
                            onCancel={() => setShowNotionSync(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
