import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicPosts } from '../services/db';
import type { BlogPost } from '../types/database';

const Blog = () => {
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  useEffect(() => { getPublicPosts().then(setPosts).catch(() => setPosts([])); }, []);

  return (
    <>
      <SEO title={`Writing — ${settings.shortName}`} description={settings.writingIntro} path="/journals" />
      <PageIntro eyebrow={settings.ui.writingIntroEyebrow} title={settings.writingTitle} intro={settings.writingIntro} />
      <section className="content-section journal-grid">
        {posts.map((post, index) => (
          <Reveal key={post.id ?? post.slug} delay={index * 0.05}>
            <Link to={`/journal/${post.slug}`} className="journal-card">
              <div className="journal-meta"><span>{post.date}</span><span>{post.readTime}</span></div>
              <h2>{post.title}</h2>
              <p>{post.content.replace(/[#*_`>\-]/g, '').slice(0, 180)}{post.content.length > 180 ? '…' : ''}</p>
              <div className="journal-bottom"><div className="tag-row">{post.tags?.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div><ArrowDownRight /></div>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
};
export default Blog;
