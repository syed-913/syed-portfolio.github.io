import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { AnalyticsTracker } from './components/features/AnalyticsTracker';
import { AdminGate } from './components/auth/AdminGate';
import Home from './pages/Home';
import About from './pages/About';
import Experience from './pages/Experience';
import Projects from './pages/Projects';
import Achievements from './pages/Achievements';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
};

function AppRoutes() {
  return (
    <>
      <AnalyticsTracker />
      <ScrollToTop />
      <Routes>
        <Route path="/dashboard" element={<AdminGate><Dashboard /></AdminGate>} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/credentials" element={<Achievements />} />
              <Route path="/writing" element={<Blog />} />
              <Route path="/writing/:slug" element={<BlogPost />} />

              {/* Legacy public URLs stay valid, but canonical navigation now uses the clearer names. */}
              <Route path="/achievements" element={<Navigate to="/credentials" replace />} />
              <Route path="/journals" element={<Navigate to="/writing" replace />} />
              <Route path="/journal/:slug" element={<LegacyJournalRedirect />} />

              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </>
  );
}

const LegacyJournalRedirect = () => {
  const location = useLocation();
  const slug = location.pathname.split('/').filter(Boolean).pop() ?? '';
  return <Navigate to={`/writing/${slug}`} replace />;
};

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
