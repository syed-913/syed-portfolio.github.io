
import React from 'react';
import { cn } from '../../lib/utils';
import { Terminal, Shield, Cloud } from 'lucide-react';

interface ServiceCardProps {
    title: string;
    icon: 'terminal' | 'security' | 'cloud';
    children: React.ReactNode;
    delay?: number;
}

const iconMap = {
    terminal: Terminal,
    security: Shield,
    cloud: Cloud,
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ title, icon, children, delay = 0 }) => {
    const Icon = iconMap[icon];

    return (
        <div
            className={cn(
                "group relative bg-surface-dark border border-surface-border hover:border-primary/50 rounded-lg p-5 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(0,168,154,0.3)] hover:-translate-y-1",
                "animate-fade-in-up"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-4 right-4 text-surface-border group-hover:text-primary transition-colors">
                <Icon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="font-mono text-lg font-bold text-primary mb-4">{title}</h3>
            <div className="font-mono text-xs md:text-sm text-gray-400 code-block bg-[#111417] p-4 rounded border border-white/5">
                {children}
            </div>
        </div>
    );
};
