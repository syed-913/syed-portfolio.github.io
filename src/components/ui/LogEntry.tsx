
import React from 'react';
import { cn } from '../../lib/utils';

interface LogEntryProps {
    title: string;
    company: string;
    date: string;
    description: string;
    path: string;
    logs: { status: 'OK' | 'WARN' | 'ERR'; message: string }[];
    delay?: number;
}

export const LogEntry: React.FC<LogEntryProps> = ({
    title,
    company,
    date,
    description,
    path,
    logs,
    delay = 0
}) => {
    return (
        <div
            className="group relative rounded-lg border border-surface-border bg-[#161b22] overflow-hidden shadow-2xl hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="bg-surface-border/50 border-b border-white/5 px-4 py-2 flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e74c3c]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#f1c40f]/80"></div>
                    <div className="w-3 h-3 rounded-full bg-[#2ecc71]/80"></div>
                </div>
                <div className="text-xs text-gray-500 font-mono absolute left-0 right-0 text-center pointer-events-none hidden sm:block">
                    [root@portfolio] {path}
                </div>
                <div className="w-10"></div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 border-b border-white/5 pb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{title}</h3>
                        <div className="text-blue-400 font-mono text-sm md:text-base">@ {company}</div>
                    </div>
                    <div className="shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded bg-surface-dark border border-white/10 text-xs text-primary font-mono shadow-sm">
                            {date}
                        </span>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-400 text-sm leading-relaxed max-w-3xl border-l-2 border-primary/30 pl-4">
                        {description}
                    </p>
                </div>

                <div className="space-y-3 font-mono text-sm md:text-base">
                    {logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-3 group/item">
                            <span className={cn(
                                "font-bold shrink-0 mt-0.5 select-none",
                                log.status === 'OK' ? "text-[#2ecc71]" :
                                    log.status === 'WARN' ? "text-[#f1c40f]" : "text-[#e74c3c]"
                            )}>
                                [{log.status}]
                            </span>
                            <span className="text-gray-300 group-hover/item:text-white transition-colors">
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
