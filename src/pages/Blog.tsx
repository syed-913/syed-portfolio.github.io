
import React, { useEffect, useState } from 'react';
import { BlogCard } from '../components/ui/BlogCard';
import { getPosts } from '../services/db';
import type { BlogPost } from '../types/database';

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getPosts();
                setPosts(data.filter(post => post.visible));
            } catch (error) {
                console.error("Failed to fetch blog posts:", error);
            } finally {
                setTimeout(() => setLoading(false), 800);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full max-w-4xl mb-12 animate-fade-in-up">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center flex-wrap gap-2 text-lg md:text-xl font-mono">
                        <span className="text-primary">[root@portfolio ~]#</span>
                        <span className="text-white typing-effect">ls -l ./journals</span>
                        <span className="w-2.5 h-5 bg-primary animate-cursor-blink"></span>
                    </div>
                    <div className="pl-4 border-l-2 border-surface-border text-gray-500 font-mono text-sm">
                        {loading ? (
                            <p className="animate-pulse">Loading journal entries...</p>
                        ) : (
                            <>
                                <p>total {posts.length * 4}K</p>
                                <p>drwxr-xr-x 2 root root 4.0K Nov 20 10:00 .</p>
                                <p>drwxr-xr-x 5 root root 4.0K Nov 18 14:22 ..</p>
                                {posts.map(post => (
                                    <p key={post.id}>-rw-r--r-- 1 root root 8.0K {post.date} {post.slug}.md</p>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl grid gap-6 pb-20">
                {!loading && posts.map((post, index) => (
                    <BlogCard
                        key={post.id}
                        title={post.title}
                        excerpt={post.content.substring(0, 150) + '...'}
                        date={post.date}
                        readTime={post.readTime}
                        slug={post.slug}
                        delay={100 * (index + 1)}
                    />
                ))}
                {!loading && posts.length === 0 && (
                    <div className="text-gray-500 font-mono text-center py-8">
                        No journal entries found. Check back later.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
