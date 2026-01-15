import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Layers, Radio, Notebook } from 'lucide-react';

const Projects = () => {
    const projects = [
        {
            title: "Emergency Vehicle Classification",
            category: "Deep Learning / Audio Processing",
            description: "Built an LSTM-based ML model to classify emergency vehicles based on sound input with 89% accuracy.",
            tags: ["Python", "TensorFlow", "Deep Learning", "Librosa"],
            icon: <Radio size={24} />,
            link: "#",
            github: "https://github.com/ShaikFayaz"
        },
        {
            title: "Journal Application",
            category: "Fullstack Development",
            description: "A secure Java-based daily journal application for tracking life events with modern authentication.",
            tags: ["Java", "Spring Boot", "JWT", "MongoDB"],
            icon: <Notebook size={24} />,
            link: "#",
            github: "https://github.com/ShaikFayaz"
        },
        {
            title: "Autonomous Navigation System",
            category: "Robotics (Concept)",
            description: "Exploring path planning algorithms and ROS integration for indoor mobile robots.",
            tags: ["ROS", "C++", "Python", "SLAM"],
            icon: <Layers size={24} />,
            link: "#",
            github: "https://github.com/ShaikFayaz"
        }
    ];

    return (
        <section id="projects" style={{ padding: '100px 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Selected Works</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        A glimpse into my transition from building robust test suites to engineering intelligent systems.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="glass"
                            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '2.5rem', flex: 1 }}>
                                <div style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    {project.icon}
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                                            <Github size={20} />
                                        </a>
                                        <a href={project.link} style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                                            <ExternalLink size={20} />
                                        </a>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{project.title}</h3>
                                <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
                                    {project.category}
                                </p>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    {project.description}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                                    {project.tags.map((tag, i) => (
                                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.75rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                <a href={project.link} style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                    Read Case Study <ExternalLink size={16} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
