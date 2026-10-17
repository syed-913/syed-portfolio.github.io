import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '../components/ui/CodeBlock';
import { SEO } from '../components/features/SEO';
import { DataError, DataLoading } from '../components/ui/DataState';
import { getPostBySlug, getPublicPosts, incrementUpvote } from '../services/db';
import type { BlogPost as BlogPostType } from '../types/database';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { displayReadTime } from '../lib/writing';
import { prepareArticle, remarkArticleHeadings } from '../lib/article';
import { useActiveSection } from '../hooks/useActiveSection';

const BlogPost = () => {
  const { slug = '' } = useParams();
  return <ArticleReader key={slug} slug={slug} />;
};

const ArticleReader = ({ slug }: { slug: string }) => {
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const articleRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: articleRef, offset: ['start start', 'end end'] });
  const readingProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.28 });
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [previousPost, setPreviousPost] = useState<BlogPostType | null>(null);
  const [nextPost, setNextPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [upvotes, setUpvotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const [pulse, setPulse] = useState(0);
  const prepared = useMemo(() => prepareArticle(post?.content ?? '', post?.title ?? ''), [post?.content, post?.title]);
  const activeSection = useActiveSection(prepared.sections.map(section => section.id));

  useEffect(() => {
    let active = true;
    window.scrollTo(0, 0);
    Promise.all([getPostBySlug(slug), getPublicPosts()]).then(([data, allPosts]) => {
      if (!active) return;
      setPost(data);
      setUpvotes(data?.upvotes ?? 0);
      const index = allPosts.findIndex((item) => item.slug === slug);
      setPreviousPost(index >= 0 && index < allPosts.length - 1 ? allPosts[index + 1] : null);
      setNextPost(index > 0 ? allPosts[index - 1] : null);
      let stored: string[] = [];
      try { const parsed: unknown = JSON.parse(localStorage.getItem('upvoted_posts') || '[]'); if (Array.isArray(parsed)) stored = parsed; } catch { /* storage is optional */ }
      setVoted(stored.includes(slug));
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, attempt]);

  const vote = async () => {
    if (!post || voted) return;
    setVoted(true);
    setPulse((value) => value + 1);
    setUpvotes((value) => value + 1);
    const stored = JSON.parse(localStorage.getItem('upvoted_posts') || '[]') as string[];
    localStorage.setItem('upvoted_posts', JSON.stringify([...stored, slug]));
    incrementUpvote(slug).catch(() => undefined);
  };

  if (loading) return <div className="article-loading"><DataLoading label="Opening field note…" variant="article" /></div>;
  if (error) return <div className="article-loading"><DataError retry={() => { setLoading(true); setError(false); setAttempt(value => value + 1); }} /></div>;
  if (!post) return <div className="article-loading"><h1>Note not found.</h1><Link to="/writing">Back to writing</Link></div>;

  const articleDescription = post.content.replace(/[#*_`>-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const parsedDate = post.date ? new Date(post.date) : null;
  const publishedTime = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
  const dateLabel = publishedTime ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsedDate!) : post.date;
  const sectionLinks = prepared.sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined} className={section.level > 2 ? 'is-nested' : undefined}>{section.title}</a>);
  const articleUrl = `https://syedammar.engineer/writing/${post.slug}/`;
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: articleDescription,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    author: { '@id': 'https://syedammar.engineer/#person' },
    publisher: { '@id': 'https://syedammar.engineer/#person' },
    ...(publishedTime ? { datePublished: publishedTime } : {}),
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
    inLanguage: 'en',
  };

  return (
    <>
      <SEO title={`${post.title} — ${settings.shortName}`} description={articleDescription} path={`/writing/${post.slug}`} type="article" publishedTime={publishedTime} structuredData={articleStructuredData} />
      <motion.div className="article-reading-progress" aria-hidden="true" style={{ scaleX: reduce ? scrollYProgress : readingProgress }} />
      <article ref={articleRef} className="article-page">
        <Link to="/writing" className="article-back"><ArrowLeft size={16} /> All field notes</Link>
        <div className="article-layout">
          {!!sectionLinks.length && <aside className="article-aside"><nav className="article-toc" aria-label="Article sections"><strong>In this note</strong>{sectionLinks}</nav></aside>}
        <div className="article-canvas">
          <header className="article-header">
            <div className="article-kicker"><time dateTime={publishedTime}>{dateLabel}</time><span>{displayReadTime(post)}</span></div>
            <h1>{post.title}</h1>
            <div className="tag-row">{post.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </header>
          {!!sectionLinks.length && <details className="article-toc-mobile"><summary>In this note<ChevronDown size={16} /></summary><nav aria-label="Article sections on mobile">{sectionLinks}</nav></details>}
          <div className="article-body prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkArticleHeadings]}
              components={{
                code({ className, children }) {
                  return <code className={`inline-code ${className ?? ''}`}>{children}</code>;
                },
                pre({ children }) {
                  const child = Children.toArray(children)[0];
                  if (!isValidElement<{ className?: string; children?: unknown }>(child)) return <pre>{children}</pre>;
                  const language = /language-([\w+-]+)/.exec(child.props.className || '')?.[1] || 'text';
                  return <CodeBlock code={String(child.props.children ?? '').replace(/\n$/, '')} language={language} />;
                },
                a({ children, href, title }) {
                  const external = /^https?:\/\//.test(href ?? '');
                  return <a href={href} title={title} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
                },
                table({ children }) {
                  return <div className="article-table-scroll" role="region" aria-label="Scrollable article table" tabIndex={0}><table>{children}</table></div>;
                },
              }}
            >{prepared.content}</ReactMarkdown>
          </div>
          <footer className="article-footer">
            <motion.button
              onClick={vote}
              disabled={voted}
              className={voted ? 'voted' : ''}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce || voted ? undefined : { scale: 0.94 }}
            >
              <motion.span key={pulse} className="like-icon-wrap" animate={reduce || !voted ? undefined : { scale: [1, 1.55, .9, 1], rotate: [0, -10, 7, 0] }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
                <Heart size={17} fill={voted ? 'currentColor' : 'none'} />
              </motion.span>
              {upvotes} useful
              {voted && <motion.i className="like-burst" key={`burst-${pulse}`} initial={{ opacity: .7, scale: .5 }} animate={{ opacity: 0, scale: 1.8 }} transition={{ duration: .6 }} />}
            </motion.button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' })}>Back to top <ArrowUp size={16} /></button>
          </footer>

          {(previousPost || nextPost) && (
            <nav className="article-neighbors" aria-label="More field notes">
              {previousPost ? (
                <Link to={`/writing/${previousPost.slug}`} className="article-neighbor article-neighbor-previous">
                  <span><ArrowLeft size={15} /> {settings.ui.writingPrevious}</span>
                  <strong>{previousPost.title}</strong>
                  <small>{displayReadTime(previousPost)}</small>
                </Link>
              ) : <span />}
              {nextPost && (
                <Link to={`/writing/${nextPost.slug}`} className="article-neighbor article-neighbor-next">
                  <span>{settings.ui.writingNext} <ArrowRight size={15} /></span>
                  <strong>{nextPost.title}</strong>
                  <small>{displayReadTime(nextPost)}</small>
                </Link>
              )}
            </nav>
          )}
        </div>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
