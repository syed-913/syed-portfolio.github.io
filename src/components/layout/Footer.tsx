
import React, { useState, useEffect } from 'react';

export const Footer: React.FC = () => {
    const [uptime, setUptime] = useState<string>('');

    useEffect(() => {
        const startDate = new Date('2023-01-01'); // Arbitrary start date for uptime

        const updateUptime = () => {
            const now = new Date();
            const diff = now.getTime() - startDate.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            setUptime(`up ${days} days, 1 user, load average: 0.05, 0.01, 0.00`);
        };

        updateUptime();
        const interval = setInterval(updateUptime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="relative z-10 w-full border-t border-white/5 bg-background-dark/95 backdrop-blur py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors font-mono text-xs uppercase tracking-wider">GitHub</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors font-mono text-xs uppercase tracking-wider">LinkedIn</a>
                    <a href="#" className="text-gray-500 hover:text-primary transition-colors font-mono text-xs uppercase tracking-wider">PGP Key</a>
                </div>
                <div className="font-mono text-xs text-gray-600 bg-[#15191e] px-3 py-1.5 rounded border border-white/5">
                    <span className="text-primary">syed-ammar@portfolio:~$</span> uptime | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {uptime}
                </div>
            </div>
        </footer>
    );
};
