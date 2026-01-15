import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Hero from './components/Hero/Hero';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import ArticlesList from './pages/ArticlesList';
import ArticleView from './pages/ArticleView';

// Admin pages
import Login from './pages/admin/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ArticleEditor from './pages/admin/ArticleEditor';

// Portfolio Home Page
const PortfolioHome = () => {
  return (
    <>
      <nav className="glass" style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '0.75rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', borderRadius: '100px' }}>
        <a href="#hero" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Home</a>
        <a href="#experience" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Journey</a>
        <a href="#projects" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Projects</a>
        <Link to="/articles" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Articles</Link>
        <a href="#contact" className="glass" style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.4rem 1rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>Contact</a>
      </nav>

      <Hero />
      <Experience />
      <Projects />
      <Contact />

      <section id="footer" style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Shaik Fayaz. Built with React, Three.js & Supabase.
        </p>
      </section>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PortfolioHome />} />
          <Route path="/articles" element={<ArticlesList />} />
          <Route path="/articles/:slug" element={<ArticleView />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/:id"
            element={
              <ProtectedRoute>
                <ArticleEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
