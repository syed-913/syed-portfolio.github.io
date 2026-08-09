import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AnalyticsTracker } from './components/features/AnalyticsTracker';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Experience = lazy(() => import('./pages/Experience'));
const Projects = lazy(() => import('./pages/Projects'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DashboardPortal = lazy(() => import('./components/auth/DashboardPortal'));

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
};

const RoutePending = ({ compact = false }: { compact?: boolean }) => (
  <div className={`route-pending ${compact ? 'is-compact' : ''}`} role="status" aria-live="polite">
    <span className="route-pending-mark" aria-hidden="true"><i /><i /><i /></span>
    <span>Loading interface</span>
  </div>
);

const Deferred = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<RoutePending />}>{children}</Suspense>
);

function AppRoutes() {
  return (
    <>
      <AnalyticsTracker />
      <ScrollToTop />
      <Routes>
        <Route path="/dashboard" element={<Suspense fallback={<RoutePending compact />}><DashboardPortal /></Suspense>} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<Deferred><About /></Deferred>} />
              <Route path="/experience" element={<Deferred><Experience /></Deferred>} />
              <Route path="/projects" element={<Deferred><Projects /></Deferred>} />
              <Route path="/credentials" element={<Deferred><Achievements /></Deferred>} />
              <Route path="/writing" element={<Deferred><Blog /></Deferred>} />
              <Route path="/writing/:slug" element={<Deferred><BlogPost /></Deferred>} />

              <Route path="/achievements" element={<Navigate to="/credentials" replace />} />
              <Route path="/journals" element={<Navigate to="/writing" replace />} />
              <Route path="/journal/:slug" element={<LegacyJournalRedirect />} />

              <Route path="/contact" element={<Deferred><Contact /></Deferred>} />
              <Route path="*" element={<Deferred><NotFound /></Deferred>} />
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
