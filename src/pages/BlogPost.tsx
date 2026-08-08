import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUp, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SEO } from '../components/features/SEO';
import { DataLoading } from '../components/ui/DataState';
import { getPostBySlug, incrementUpvote } from '../services/db';
import type { BlogPost as BlogPostType } from '../types/database';
import { useSiteSettings } from '../hooks/useSiteSettings';

const BlogPost = () => {
  const { slug = '' } = useParams();
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [voted, setVoted] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getPostBySlug(slug).then((data) => {
      setPost(data);
      setUpvotes(data?.upvotes ?? 0);
      const stored = JSON.parse(localStorage.getItem('upvoted_posts') || '[]') as string[];
      setVoted(stored.includes(slug));
    }).finally(() => setLoading(false));
  }, [slug]);

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
  if (!post) return <div className="article-loading"><h1>Note not found.</h1><Link to="/writing">Back to writing</Link></div>;

  return (
    <>
      <SEO title={`${post.title} — ${settings.shortName}`} description={post.content.replace(/[#*_`>\-]/g, '').slice(0, 155)} path={`/writing/${post.slug}`} type="article" />
      <article className="article-page">
        <Link to="/writing" className="article-back"><ArrowLeft size={16} /> All field notes</Link>
        <div className="article-canvas">
          <header className="article-header">
            <div className="article-kicker"><span>{post.date}</span><span>{post.readTime}</span></div>
            <h1>{post.title}</h1>
            <div className="tag-row">{post.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </header>
          <div className="article-body prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="code-frame">
                      <div className="code-frame-head"><span>{match[1]}</span><span>technical trace</span></div>
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1.25rem', background: '#101216' }} {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : <code className="inline-code" {...props}>{children}</code>;
                },
              }}
            >{post.content}</ReactMarkdown>
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
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top <ArrowUp size={16} /></button>
          </footer>
        </div>
      </article>
    </>
  );
};
export default BlogPost;
