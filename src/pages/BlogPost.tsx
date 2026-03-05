
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Terminal, ArrowUp } from 'lucide-react';
import { getPosts, getPostBySlug, incrementUpvote } from '../services/db';
import type { BlogPost as BlogPostType } from '../types/database';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [recentPosts, setRecentPosts] = useState<BlogPostType[]>([]);
    const [loading, setLoading] = useState(true);
    const [upvotes, setUpvotes] = useState(0);
    const [hasUpvoted, setHasUpvoted] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (slug) {
            getPostBySlug(slug).then(data => {
                setPost(data);
                setLoading(false);
            }).catch(console.error);

            getPosts().then(posts => {
                // filter out current post and only keep top 5
                const others = posts.filter(p => p.slug !== slug).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
                setRecentPosts(others);
            }).catch(console.error);
        }
    }, [slug]);

    useEffect(() => {
        if (post) {
            setUpvotes(post.upvotes || 0);
            const upvotedPosts = JSON.parse(localStorage.getItem('upvoted_posts') || '[]');
            if (upvotedPosts.includes(post.slug)) {
                setHasUpvoted(true);
            }
        }
    }, [post]);

    const handleUpvote = async () => {
        if (!hasUpvoted && post) {
            setUpvotes(prev => prev + 1);
            setHasUpvoted(true);

            const upvotedPosts = JSON.parse(localStorage.getItem('upvoted_posts') || '[]');
            upvotedPosts.push(post.slug);
            localStorage.setItem('upvoted_posts', JSON.stringify(upvotedPosts));

            try {
                await incrementUpvote(post.slug);
            } catch (error) {
                console.error("Failed to upvote post:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] font-mono text-primary animate-pulse">
                Loading post_data.bin...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] font-mono text-red-500">
                <Terminal size={48} className="mb-4" />
                <h1>Error 404: POST_NOT_FOUND</h1>
                <p className="text-gray-400 mt-2">The requested journal entry '{slug}' does not exist.</p>
                <button onClick={() => navigate('/journals')} className="mt-6 text-primary hover:underline">
                    return to ./journals
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto py-12 px-4">
            <div className="flex flex-col lg:flex-row gap-12 w-full animate-fade-in-up">
                {/* Main Content */}
                <div className="w-full lg:w-2/3">
                    <div className="mb-8">
                        <Link to="/journals" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-4 transition-colors font-mono text-sm">
                            <ArrowLeft className="w-4 h-4" /> cd ..
                        </Link>

                        <div className="flex items-center flex-wrap gap-2 text-lg md:text-xl font-mono mb-2">
                            <span className="text-primary">[root@portfolio journals]#</span>
                            <span className="text-white">view {slug}.md</span>
                            <span className="w-2.5 h-5 bg-primary animate-cursor-blink"></span>
                        </div>

                        <div className="font-mono text-xs md:text-sm text-gray-500 flex flex-wrap gap-3 md:gap-4 border-l-2 border-surface-border pl-4">
                            <span className="text-primary/70">[PUBLISHED: {post.date}]</span>
                            <span>[CHAR_COUNT: {post.content.length}]</span>
                            <span>[READ_TIME: {post.readTime}]</span>
                        </div>
                    </div>

                    <article className="bg-surface-dark border border-surface-border rounded-lg p-6 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Terminal className="w-24 h-24 text-primary" />
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                            {post.title}
                        </h1>

                        <div className="prose prose-invert max-w-none prose-p:font-prose prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:font-display prose-headings:text-white prose-a:text-primary hover:prose-a:text-white prose-a:transition-colors prose-strong:text-white prose-pre:bg-transparent prose-pre:m-0 prose-pre:p-0 font-prose">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <div className="bg-[#1e1e1e] rounded-md overflow-hidden my-6 border border-white/10 shadow-2xl">
                                                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
                                                    <span className="text-xs font-mono text-gray-400">{match[1]}</span>
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                                    </div>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
                                                    codeTagProps={{ className: 'font-mono text-sm' }}
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className="bg-[#1e242b] text-[#e06c75] px-1.5 py-0.5 rounded font-mono text-[0.85em] border border-white/5 before:content-none after:content-none" {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    blockquote({ node, children, ...props }: any) {
                                        return (
                                            <blockquote className="border-l-4 border-primary/70 bg-[#161b22]/50 px-4 py-3 my-6 font-prose text-gray-300 rounded-r shadow-inner not-italic relative" {...props}>
                                                {children}
                                            </blockquote>
                                        );
                                    }
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="font-mono text-xs text-gray-500">
                                    <span className="text-primary">root@portfolio:~/journals$</span> process_priority={upvotes}
                                </div>

                                <button
                                    onClick={handleUpvote}
                                    disabled={hasUpvoted}
                                    className={`group relative inline-flex items-center gap-3 px-6 py-3 bg-[#111417] border rounded transition-all duration-300 ${hasUpvoted ? 'border-primary/50 opacity-50 cursor-not-allowed' : 'border-primary/30 hover:border-primary hover:bg-primary/10'}`}
                                >
                                    <span className="font-mono text-primary group-hover:text-white transition-colors text-sm sm:text-base">
                                        [ sudo renice -n -20 blog_post ]
                                    </span>
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-primary transition-all ${hasUpvoted ? 'bg-primary text-black' : 'bg-primary/20 group-hover:bg-primary group-hover:text-black'}`}>
                                        <ArrowUp className="w-4 h-4" />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </article>
                </div>

                {/* Sidebar */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-8">
                    {/* Author Card */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary border border-primary/30">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">SysAdmin</h4>
                                <p className="text-xs font-mono text-gray-500">uid=0(root) gid=0(root)</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Linux enthusiast, DevOps engineer, and automation junkie. Documenting my journey through the shell.
                        </p>
                    </div>

                    {/* Example Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6">
                            <div className="border-b border-white/5 pb-3 mb-4">
                                <h3 className="font-mono font-bold text-white text-sm">grep "tags"</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded bg-background-dark border border-white/10 text-xs font-mono text-gray-400 hover:text-primary hover:border-primary/50 cursor-pointer transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Entries */}
                    {recentPosts.length > 0 && (
                        <div className="bg-surface-dark border border-surface-border rounded-lg p-6">
                            <div className="border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                                <h3 className="font-mono font-bold text-white text-sm">ls -t ~/journals | head -n 5</h3>
                            </div>
                            <div className="flex flex-col gap-5">
                                {recentPosts.map(rp => (
                                    <Link key={rp.slug} to={`/journal/${rp.slug}`} className="group block border-l-2 border-transparent hover:border-primary pl-3 -ml-3 transition-all duration-300">
                                        <h4 className="font-bold text-gray-300 group-hover:text-primary transition-colors text-sm leading-snug">
                                            {rp.title}
                                        </h4>
                                        <div className="font-mono text-xs text-gray-500 mt-1 flex items-center justify-between">
                                            <span>{rp.date}</span>
                                            <span className="text-primary/50 group-hover:text-primary transition-colors">{rp.readTime}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default BlogPost;
