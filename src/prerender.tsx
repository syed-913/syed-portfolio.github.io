import { renderToReadableStream } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SiteSettingsContext } from './context/SiteSettingsContext';
import { PublicSnapshotContext } from './context/PublicSnapshotContext';
import type { PublicSnapshot } from './lib/publicSnapshot';
import { Layout } from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Experience from './pages/Experience';
import Achievements from './pages/Achievements';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import { HtmlSanitizerContext } from './context/HtmlSanitizerContext';

/** Build-only rendering of the same public components; effects and private routes never run. */
export async function renderPublicPage(route: string, snapshot: PublicSnapshot, sanitizeHtml: (html: string) => string): Promise<string> {
  const stream = await renderToReadableStream(
    <HtmlSanitizerContext.Provider value={sanitizeHtml}>
      <LazyMotion features={domAnimation}>
        <PublicSnapshotContext.Provider value={snapshot}>
          <SiteSettingsContext.Provider value={{ settings: snapshot.settings, loading: false }}>
            <MemoryRouter initialEntries={[route]}>
              <Layout><Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/credentials" element={<Achievements />} />
                <Route path="/writing" element={<Blog />} />
                <Route path="/writing/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes></Layout>
            </MemoryRouter>
          </SiteSettingsContext.Provider>
        </PublicSnapshotContext.Provider>
      </LazyMotion>
    </HtmlSanitizerContext.Provider>,
    { signal: AbortSignal.timeout(15_000), onError(error) { throw error; } },
  );
  await stream.allReady;
  return new Response(stream).text();
}
