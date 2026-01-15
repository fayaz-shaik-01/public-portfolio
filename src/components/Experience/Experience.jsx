import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Code, Database, Zap } from 'lucide-react';

const Experience = () => {
    const experiences = [
        {
            title: "Associate Software Engineer",
            company: "Enphase Solar Energy",
            period: "July 2023 - Present",
            description: "Automating test functionalities for Enphase Mobile Application. Recently pivoted to developing backend services using Java and Spring Boot for Water Heater/EV Chargers.",
            icon: <Briefcase size={20} />,
            highlights: ["Reduced automation execution time by 40%", "Improved API performance by 20% through backend collaboration"]
        },
        {
            title: "B.Tech in Electrical & Electronics",
            company: "NIT Calicut",
            period: "2019 - 2023",
            description: "Foundation in DS&A, Artificial Intelligence, and Digital Electronics. GPA: 8.55/10",
            icon: <GraduationCap size={20} />,
            highlights: ["Coursework: AI, Network Theory, Digital Electronics"]
        }
    ];

    const skills = [
        { category: "Languages", items: ["Java", "C++", "Python", "Javascript"] },
        { category: "Web & AI", items: ["HTML/CSS", "React", "Machine Learning", "Deep Learning"] },
        { category: "Tools & DevOps", items: ["Docker", "Jenkins", "Git", "Selenium", "Appium"] }
    ];

    return (
        <section id="experience" style={{ padding: '100px 0', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>

                    {/* Experience Timeline */}
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Journey</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {experiences.map((exp, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="glass"
                                    style={{ padding: '2rem', position: 'relative' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>{exp.title}</h3>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{exp.company}</p>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>
                                            {exp.period}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        {exp.description}
                                    </p>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {exp.highlights.map((h, i) => (
                                            <li key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <Zap size={14} style={{ color: 'var(--accent-primary)' }} /> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Skills Grid */}
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Tech Stack</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {skills.map((skillGroup, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {skillGroup.category}
                                    </h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {skillGroup.items.map((skill, i) => (
                                            <span key={i} className="glass" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', border: '1px solid var(--glass-border)' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}

                            <div className="glass" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px dashed var(--accent-primary)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Currently deep-diving into <strong>Large Language Models (LLMs)</strong> and <strong>Robotics Operating Systems (ROS)</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Experience;
