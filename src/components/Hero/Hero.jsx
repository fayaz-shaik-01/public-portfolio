import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, TestTube } from 'lucide-react';
import Scene from './Scene';

const Hero = () => {
    return (
        <section id="hero" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <Scene />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span className="glass" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bot size={16} />
                            GenAI & Robotics Enthusiast
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>•</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ex-Automation Engineer</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Shaik <br />
                        <span style={{ color: 'var(--accent-primary)', WebkitTextFillColor: 'initial' }}>Fayaz</span>
                    </h1>

                    <p style={{ maxWidth: '600px', fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        Bridging the gap between reliable testing and intelligent automation.
                        Currently engineering the future with <span style={{ color: '#fff' }}>GenAI</span>, <span style={{ color: '#fff' }}>distributed systems</span>, and <span style={{ color: '#fff' }}>robotics</span>.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href="#projects" className="glass" style={{ padding: '1rem 2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--accent-primary)', border: 'none', color: '#fff', cursor: 'pointer', transition: 'transform 0.2s' }}>
                            Explore Projects <ArrowRight size={20} />
                        </a>
                        <a href="#contact" className="glass" style={{ padding: '1rem 2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            Get in touch
                        </a>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
            >
                <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, var(--accent-primary), transparent)' }}></div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>Scroll Down</span>
            </motion.div>
        </section>
    );
};

export default Hero;
