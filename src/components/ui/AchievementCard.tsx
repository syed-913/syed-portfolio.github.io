
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { BadgeCheck, Anchor, Cloud, Shield, Database, Router, Eye, Check, Copy } from 'lucide-react';

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
    issuerLogo?: string;
    credentialId?: string;
    delay?: number;
    onView?: () => void;
}

// Normalize a public-folder path to work with the Vite base URL.
// Handles paths stored as "/logo/aws.png", "logo/aws.png", "/public/logo/aws.png" etc.
const resolvePublicPath = (path: string): string => {
    const base = import.meta.env.BASE_URL ?? '/';
    // Strip any leading /public and leading slash
    const cleaned = path.replace(/^\/public/, '').replace(/^\//, '');
    // Remove the base from the path if it's already there (avoid double-prefix)
    const withoutBase = cleaned.startsWith(base.replace(/^\//, ''))
        ? cleaned.slice(base.replace(/^\//, '').length).replace(/^\//, '')
        : cleaned;
    // Re-join cleanly
    return `${base.endsWith('/') ? base : base + '/'}${withoutBase}`;
};

const CRED_ID_MAX = 14; // max visible characters before truncation

const CredentialIdBadge: React.FC<{ credentialId: string }> = ({ credentialId }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(credentialId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const truncated = credentialId.length > CRED_ID_MAX
        ? `${credentialId.slice(0, CRED_ID_MAX)}...`
        : credentialId;

    return (
        <button
            onClick={handleCopy}
            title={`Copy full ID: ${credentialId}`}
            className="group/id flex items-center gap-1.5 font-mono text-xs text-gray-600 bg-[#111417] px-2 py-1 rounded border border-white/5 hover:border-primary/30 hover:text-gray-300 transition-all duration-200 cursor-pointer max-w-[160px]"
        >
            <span className="truncate">
                <span className="text-gray-500">ID: </span>
                {truncated}
            </span>
            <span className="shrink-0 opacity-0 group-hover/id:opacity-100 transition-opacity">
                {copied
                    ? <Check size={11} className="text-green-400" />
                    : <Copy size={11} className="text-gray-500" />
                }
            </span>
        </button>
    );
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
    title,
    description,
    status,
    details,
    icon,
    permissions,
    owner,
    size,
    issuerLogo,
    credentialId,
    delay = 0,
    onView
}) => {
    const resolvedLogo = issuerLogo ? resolvePublicPath(issuerLogo) : undefined;

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
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", status === 'ARCHIVED' ? 'bg-gray-500' : 'bg-green-500')}></div>
                        <span className={cn("font-bold tracking-wider", status === 'ARCHIVED' ? 'text-gray-500' : 'text-green-500')}>
                            STATUS: {status}
                        </span>
                    </div>
                    {onView && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onView();
                            }}
                            className="text-gray-400 hover:text-primary transition-colors focus:outline-none"
                            title="View Certificate"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-white/5 rounded border border-white/5 flex items-center justify-center">
                        {resolvedLogo ? (
                            <img
                                src={resolvedLogo}
                                alt="Issuer Logo"
                                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        ) : (
                            getIcon()
                        )}
                    </div>
                    {credentialId && <CredentialIdBadge credentialId={credentialId} />}
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
