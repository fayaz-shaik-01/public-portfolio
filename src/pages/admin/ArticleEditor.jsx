import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Save,
    ArrowLeft,
    Bold,
    Italic,
    List,
    Heading1,
    Heading2,
    Eye,
    EyeOff,
    Plus,
    AlertCircle
} from 'lucide-react';

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
    const [showMindmap, setShowMindmap] = useState(false);

    // Mindmap state
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Tiptap editor
    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Start writing your article...</p>',
        editorProps: {
            attributes: {
                style: 'outline: none; min-height: 300px; color: var(--text-primary); font-family: var(--font-main); line-height: 1.8; font-size: 1.05rem;',
            },
        },
    });

    useEffect(() => {
        if (!isNew && id) {
            fetchArticle();
        }
    }, [id, isNew]);

    useEffect(() => {
        // Auto-generate slug from title
        if (isNew) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setSlug(generatedSlug);
        }
    }, [title, isNew]);

    const fetchArticle = async () => {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            setTitle(data.title);
            setSlug(data.slug);
            setExcerpt(data.excerpt || '');
            setPublished(data.published);

            if (editor && data.content) {
                editor.commands.setContent(data.content);
            }

            if (data.mindmap_data) {
                setNodes(data.mindmap_data.nodes || []);
                setEdges(data.mindmap_data.edges || []);
                if (data.mindmap_data.nodes && data.mindmap_data.nodes.length > 0) {
                    setShowMindmap(true);
                }
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            setError('Failed to load article');
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !slug.trim()) {
            setError('Title and slug are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const articleData = {
                title,
                slug,
                excerpt,
                content: editor?.getJSON() || {},
                mindmap_data: showMindmap ? { nodes, edges } : null,
                published,
                author_id: user.id,
            };

            if (isNew) {
                const { data, error } = await supabase
                    .from('articles')
                    .insert([articleData])
                    .select()
                    .single();

                if (error) throw error;
                navigate(`/admin/articles/edit/${data.id}`);
            } else {
                const { error } = await supabase
                    .from('articles')
                    .update(articleData)
                    .eq('id', id);

                if (error) throw error;
            }

            alert('Article saved successfully!');
        } catch (error) {
            console.error('Error saving article:', error);
            setError(error.message || 'Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    const addMindmapNode = () => {
        const newNode = {
            id: `node-${Date.now()}`,
            position: { x: Math.random() * 400, y: Math.random() * 300 },
            data: { label: 'New Node' },
            style: { background: 'var(--accent-primary)', color: '#fff', borderRadius: '8px', padding: '10px' }
        };
        setNodes((nds) => [...nds, newNode]);
    };

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
                            onClick={handleSave}
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
                            {saving ? 'Saving...' : 'Save Article'}
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

                {/* Editor */}
                <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Content</h3>

                    {/* Editor Toolbar */}
                    {editor && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <button
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                style={{
                                    background: editor.isActive('bold') ? 'var(--accent-primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                <Bold size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                style={{
                                    background: editor.isActive('italic') ? 'var(--accent-primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                <Italic size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                style={{
                                    background: editor.isActive('heading', { level: 1 }) ? 'var(--accent-primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                <Heading1 size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                style={{
                                    background: editor.isActive('heading', { level: 2 }) ? 'var(--accent-primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                <Heading2 size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                style={{
                                    background: editor.isActive('bulletList') ? 'var(--accent-primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '4px'
                                }}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    )}

                    <EditorContent editor={editor} style={{ padding: '1rem' }} />
                </div>

                {/* Mindmap Section */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Mindmap (Optional)</h3>
                        <button
                            onClick={() => setShowMindmap(!showMindmap)}
                            className="glass"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {showMindmap ? 'Hide Mindmap' : 'Show Mindmap'}
                        </button>
                    </div>

                    {showMindmap && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <button
                                    onClick={addMindmapNode}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--accent-primary)',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Plus size={16} /> Add Node
                                </button>
                            </div>

                            <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    fitView
                                >
                                    <Background color="#333" gap={20} />
                                    <Controls />
                                </ReactFlow>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArticleEditor;
