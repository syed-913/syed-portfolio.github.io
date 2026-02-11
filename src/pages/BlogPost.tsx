
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Terminal, ArrowUp } from 'lucide-react';

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [upvotes, setUpvotes] = React.useState(0);
    const [hasUpvoted, setHasUpvoted] = React.useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const handleUpvote = () => {
        if (!hasUpvoted) {
            setUpvotes(prev => prev + 1);
            setHasUpvoted(true);
        }
    };

    // Mock data for the specific post from reference, others could be added
    const post = {
        title: "Hardening SSH Configuration",
        date: "2023-11-20",
        readTime: "8 min",
        charCount: "12,450",
        content: (
            <>
                <p>
                    Secure Shell (SSH) is the backbone of remote server administration. However, a default SSH configuration often leaves doors open that sophisticated attackers can exploit. In this log entry, I'll detail the steps to harden SSH on a Linux server to enterprise-grade security standards.
                </p>

                <h3>1. Disable Root Login</h3>
                <p>
                    The root account is the ultimate prize for an attacker. By disabling direct root login, you force attackers to compromise a user account first and then attempt privilege escalation.
                </p>

                <div className="bg-[#15191e] border border-white/5 rounded-md p-4 mb-6 font-mono text-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-500">/etc/ssh/sshd_config</span>
                        <span className="text-xs text-primary">vim</span>
                    </div>
                    <code className="block text-gray-300">
                        <span className="text-gray-500"># PermitRootLogin yes</span><br />
                        <span className="text-primary">PermitRootLogin</span> no
                    </code>
                </div>

                <h3>2. Key-Based Authentication Only</h3>
                <p>
                    Passwords are susceptible to brute-force attacks. <strong>SSH keys</strong> provide a much stronger authentication mechanism. Once your keys are set up, disable password authentication entirely.
                </p>

                <div className="bg-[#15191e] border border-white/5 rounded-md p-4 mb-6 font-mono text-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-500">/etc/ssh/sshd_config</span>
                        <span className="text-xs text-primary">vim</span>
                    </div>
                    <code className="block text-gray-300">
                        <span className="text-primary">PasswordAuthentication</span> no<br />
                        <span className="text-primary">PubkeyAuthentication</span> yes
                    </code>
                </div>

                <h3>3. Implementing Fail2Ban</h3>
                <p>
                    Even with strong settings, your logs will be filled with login attempts. Fail2Ban scans log files and bans IPs that show malicious signs -- too many password failures, seeking for exploits, etc.
                </p>
                <p>
                    Installing Fail2Ban is usually as simple as running your package manager:
                </p>

                <div className="bg-[#15191e] border border-white/5 rounded-md p-4 mb-6 font-mono text-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span className="text-xs text-gray-500">terminal</span>
                        <span className="text-xs text-primary">bash</span>
                    </div>
                    <code className="block text-gray-300">
                        <span className="text-primary">sudo</span> apt update<br />
                        <span className="text-primary">sudo</span> apt install fail2ban -y<br />
                        <span className="text-primary">sudo</span> systemctl enable fail2ban
                    </code>
                </div>

                <h3>Conclusion</h3>
                <p>
                    Security is not a destination, but a journey. These steps are the baseline for any public-facing server. Remember to always audit your logs and keep your software up to date.
                </p>
            </>
        )
    };

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
                            <span>[CHAR_COUNT: {post.charCount}]</span>
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

                        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-code:text-primary prose-a:text-blue-400 font-prose prose-code:font-mono">
                            {post.content}
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
                        <div className="flex gap-2">
                            <a className="text-xs font-mono border border-white/10 px-2 py-1 rounded hover:bg-white/5 text-primary" href="#">@twitter</a>
                            <a className="text-xs font-mono border border-white/10 px-2 py-1 rounded hover:bg-white/5 text-primary" href="#">@github</a>
                        </div>
                    </div>

                    {/* Related Logs */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6">
                        <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between">
                            <h3 className="font-mono font-bold text-white text-sm">./related_logs</h3>
                            <span className="text-xs text-gray-500">ls -1</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <Link to="/journal/k8s-autoscaling" className="group block">
                                <div className="font-mono text-xs text-primary mb-1 group-hover:text-white transition-colors">2023-11-02</div>
                                <h4 className="text-gray-300 font-bold group-hover:text-primary transition-colors text-sm">Kubernetes Cluster Autoscaling</h4>
                            </Link>
                            <div className="h-px bg-white/5 w-full"></div>
                            <Link to="/journal/elk-stack-logging" className="group block">
                                <div className="font-mono text-xs text-primary mb-1 group-hover:text-white transition-colors">2023-10-25</div>
                                <h4 className="text-gray-300 font-bold group-hover:text-primary transition-colors text-sm">Log Aggregation with ELK</h4>
                            </Link>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 text-center">
                            <Link to="/journals" className="font-mono text-xs text-gray-500 hover:text-white transition-colors">
                                cd .. (view all)
                            </Link>
                        </div>
                    </div>

                    {/* Example Tags */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6">
                        <div className="border-b border-white/5 pb-3 mb-4">
                            <h3 className="font-mono font-bold text-white text-sm">grep "tags"</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['#security', '#ssh', '#linux', '#devops', '#hardening'].map(tag => (
                                <span key={tag} className="px-2 py-1 rounded bg-background-dark border border-white/10 text-xs font-mono text-gray-400 hover:text-primary hover:border-primary/50 cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>

            </div>
        </div>
    );
};

export default BlogPost;
