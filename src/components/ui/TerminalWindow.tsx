
import React from 'react';
import { cn } from '../../lib/utils';

interface TerminalWindowProps {
    children: React.ReactNode;
    header?: string;
    className?: string;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
    children,
    header = "user@portfolio: ~",
    className
}) => {
    return (
        <div className={cn(
            "w-full rounded-xl border border-surface-border bg-surface-dark/95 shadow-2xl overflow-hidden backdrop-blur-sm",
            className
        )}>
            <div className="flex items-center justify-between px-4 py-3 bg-[#15191e] border-b border-surface-border">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="font-mono text-xs text-gray-500 select-none hidden sm:block">
                    {header}
                </div>
                <div className="w-10"></div>
            </div>
            <div className="p-6 md:p-10 font-mono text-sm md:text-base leading-relaxed w-full">
                {children}
            </div>
        </div>
    );
};
