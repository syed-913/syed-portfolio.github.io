import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { SEO } from '../components/features/SEO';
import { getPostBySlug, incrementUpvote } from '../services/db';
import type { BlogPost as BlogPostType } from '../types/database';
import { useSiteSettings } from '../hooks/useSiteSettings';

const BlogPost = () => {
  const { slug = '' } = useParams();
  const { settings } = useSiteSettings();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getPostBySlug(slug).then((data) => {
      setPost(data);
      setUpvotes(data?.upvotes ?? 0);
      const stored = JSON.parse(localStorage.getItem('upvoted_posts') || '[]') as string[];
      setVoted(stored.includes(slug));
    }).finally(() => setLoading(false));
  }, [slug]);

  const vote = async () => {
    if (!post || voted) return;
    setVoted(true); setUpvotes((value) => value + 1);
    const stored = JSON.parse(localStorage.getItem('upvoted_posts') || '[]') as string[];
    localStorage.setItem('upvoted_posts', JSON.stringify([...stored, slug]));
    incrementUpvote(slug).catch(() => undefined);
  };

  if (loading) return <div className="article-loading">Loading field note…</div>;
  if (!post) return <div className="article-loading"><h1>Note not found.</h1><Link to="/journals">Back to writing</Link></div>;

  return (
    <>
      <SEO title={`${post.title} — ${settings.shortName}`} description={post.content.replace(/[#*_`>\-]/g, '').slice(0, 155)} path={`/journal/${post.slug}`} type="article" />
      <article className="article-page">
        <Link to="/journals" className="article-back"><ArrowLeft size={16} /> All field notes</Link>
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
          <button onClick={vote} disabled={voted} className={voted ? 'voted' : ''}><Heart size={17} fill={voted ? 'currentColor' : 'none'} /> {upvotes} useful</button>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top <ArrowUp size={16} /></button>
        </footer>
      </article>
    </>
  );
};
export default BlogPost;
