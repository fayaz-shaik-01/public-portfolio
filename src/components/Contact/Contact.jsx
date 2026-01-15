import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const { error } = await supabase
                .from('contacts')
                .insert([formData]);

            if (error) throw error;

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section id="contact" style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Let's Connect</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                        Interested in GenAI, Robotics, or just want to say hi? Drop a message!
                    </p>

                    {status === 'success' && (
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <CheckCircle size={20} style={{ color: '#86efac', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ color: '#86efac', fontSize: '0.875rem', margin: 0 }}>Message sent successfully! I'll get back to you soon.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>Failed to send message. Please try again.</p>
                        </div>
                    )}

                    <motion.form
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass"
                        style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', color: '#fff', borderRadius: '8px', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', color: '#fff', borderRadius: '8px', outline: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
                            <textarea
                                required
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.75rem 1rem', color: '#fff', borderRadius: '8px', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            style={{ padding: '1rem', background: status === 'sending' ? 'var(--bg-secondary)' : 'var(--accent-primary)', border: 'none', color: '#fff', fontWeight: 700, borderRadius: '8px', cursor: status === 'sending' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s', opacity: status === 'sending' ? 0.6 : 1 }}
                        >
                            {status === 'sending' ? 'Sending...' : (
                                <>Send Message <Send size={20} /></>
                            )}
                        </button>
                    </motion.form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
