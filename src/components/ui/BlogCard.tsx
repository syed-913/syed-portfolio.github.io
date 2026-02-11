
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogCardProps {
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    slug: string;
    delay?: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    title,
    excerpt,
    date,
    readTime,
    slug,
    delay = 0
}) => {
    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(`${window.location.origin}/journal/${slug}`);
        // Ideally show a toast here, but simple alert for now or just silent copy
        // We can use a context for global toast if implemented
    };

    return (
        <article
            className="group relative bg-surface-dark border border-surface-border hover:border-primary/50 rounded-lg p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(0,168,154,0.3)] hover:-translate-y-1 animate-fade-in-up w-full"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
                <div className="font-mono text-xs text-[#98c379]">-rw-r--r-- 1 root root</div>
                <div className="font-mono text-xs text-gray-500 flex flex-wrap gap-3">
                    <span className="text-primary/70">[DATE: {date}]</span>
                    <span>[READ_TIME: {readTime}]</span>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors tracking-tight">
                <Link to={`/journal/${slug}`}>{title}</Link>
            </h2>

            <p className="font-mono text-sm text-gray-400 mb-6 leading-relaxed line-clamp-3">
                {excerpt}
            </p>

            <div className="flex items-center justify-between mt-auto">
                <button
                    onClick={handleShare}
                    className="group/btn flex items-center gap-2 font-mono text-xs text-primary bg-[#111417] px-4 py-2 rounded border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200"
                >
                    <span className="text-gray-500 group-hover/btn:text-white">$</span> sh share_link.sh
                </button>

                <Link
                    to={`/journal/${slug}`}
                    className="font-mono text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                >
                    <span>./read_more.sh</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </article>
    );
};
