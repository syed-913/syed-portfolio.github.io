
import React from 'react';
import { cn } from '../../lib/utils';
import { BadgeCheck, Anchor, Cloud, Shield, Database, Router } from 'lucide-react';

interface AchievementCardProps {
    id: string;
    title: string;
    description: string;
    status: 'VALIDATED' | 'ACTIVE' | 'RENEWED' | 'ARCHIVED';
    details: Record<string, string | number | boolean | string[]>;
    icon: 'verified' | 'anchor' | 'cloud' | 'security' | 'deployed_code' | 'router';
    permissions: string;
    owner: string;
    size: string;
    delay?: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
    id,
    title,
    description,
    status,
    details,
    icon,
    permissions,
    owner,
    size,
    delay = 0
}) => {
    const getIcon = () => {
        switch (icon) {
            case 'verified': return <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-red-500 group-hover:text-red-400 transition-colors" />;
            case 'anchor': return <Anchor className="w-8 h-8 md:w-10 md:h-10 text-blue-500 group-hover:text-blue-400 transition-colors" />;
            case 'cloud': return <Cloud className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 group-hover:text-yellow-400 transition-colors" />;
            case 'security': return <Shield className="w-8 h-8 md:w-10 md:h-10 text-purple-500 group-hover:text-purple-400 transition-colors" />;
            case 'deployed_code': return <Database className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 group-hover:text-indigo-400 transition-colors" />;
            case 'router': return <Router className="w-8 h-8 md:w-10 md:h-10 text-orange-500 group-hover:text-orange-400 transition-colors" />;
            default: return <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-gray-500" />;
        }
    };

    return (
        <div
            className="group relative bg-surface-dark border border-surface-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_-5px_rgba(0,168,154,0.3)] hover:-translate-y-1 cursor-default animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="bg-[#15191e] border-b border-white/5 px-4 py-2 flex justify-between items-center text-[10px] md:text-xs font-mono">
                <div className="flex gap-3 text-gray-500">
                    <span>{permissions}</span>
                    <span>{owner}</span>
                    <span>{size}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", status === 'ARCHIVED' ? 'bg-gray-500' : 'bg-green-500')}></div>
                    <span className={cn("font-bold tracking-wider", status === 'ARCHIVED' ? 'text-gray-500' : 'text-green-500')}>
                        STATUS: {status}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-white/5 rounded border border-white/5">
                        {getIcon()}
                    </div>
                    <span className="font-mono text-xs text-gray-600 bg-[#111417] px-2 py-1 rounded border border-white/5">ID: {id}</span>
                </div>

                <h3 className={cn("text-xl font-bold mb-1 transition-colors", status === 'ARCHIVED' ? 'text-gray-400 group-hover:text-white' : 'text-white group-hover:text-primary')}>
                    {title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 font-mono">{description}</p>

                <div className={cn("font-mono text-xs text-gray-400 bg-[#111417] p-3 rounded border border-white/5 shadow-inner transition-opacity", status === 'ARCHIVED' ? 'opacity-75 group-hover:opacity-100' : '')}>
                    <span className="text-gray-500">{'{'}</span><br />
                    {Object.entries(details).map(([key, value], index, arr) => (
                        <React.Fragment key={key}>
                            &nbsp;&nbsp;<span className="text-[#e06c75]">"{key}"</span>: <span className={typeof value === 'number' ? 'text-[#d19a66]' : typeof value === 'boolean' ? 'text-[#c678dd]' : 'text-[#98c379]'}>
                                {typeof value === 'string' ? `"${value}"` : value.toString()}
                            </span>
                            {index < arr.length - 1 && ','}<br />
                        </React.Fragment>
                    ))}
                    <span className="text-gray-500">{'}'}</span>
                </div>
            </div>
        </div>
    );
};
