
import React from 'react';

interface ProjectCardProps {
    name: string;
    repoPath: string;
    command: string;
    output: React.ReactNode;
    description: string;
    url: string;
    delay?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    name,
    repoPath,
    command,
    output,
    description,
    url,
    delay = 0
}) => {
    return (
        <div
            className="h-full animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="group flex flex-col h-full rounded-xl border border-surface-border bg-surface-dark/95 shadow-2xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center justify-between px-4 py-3 bg-[#15191e] border-b border-surface-border">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="font-mono text-xs text-gray-500 select-none hidden sm:block">
                        {repoPath}
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="flex-grow p-6 font-mono text-sm flex flex-col">
                    <div className="flex gap-2 mb-4">
                        <span className="text-primary">user@portfolio:~/{name}$</span>
                        <span className="text-white">{command}</span>
                    </div>

                    <div className="mb-6 text-gray-300 leading-relaxed whitespace-pre overflow-x-auto code-block text-xs md:text-sm">
                        {output}
                    </div>

                    <div className="mb-6 text-gray-400 text-xs md:text-sm border-l-2 border-surface-border pl-4">
                        <h3 className="text-white font-bold mb-1">About</h3>
                        <p>{description}</p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-green-400 font-bold">➜</span>
                                <span className="text-white">git clone</span>
                            </div>
                            <a
                                href={url}
                                className="text-blue-400 hover:text-blue-300 hover:underline break-all transition-colors truncate"
                            >
                                {url}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
