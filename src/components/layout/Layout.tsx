
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { GlobalCommandListener } from '../features/GlobalCommandListener';
import { SystemLogs } from '../features/SystemLogs';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col bg-background-dark text-white font-display selection:bg-primary selection:text-black overflow-x-hidden">
            <GlobalCommandListener />
            <div className="fixed inset-0 bg-grid bg-grid-pattern pointer-events-none z-0 h-full w-full"></div>
            <Navbar />
            <main className="relative z-10 flex-grow py-10 px-4 w-full max-w-7xl mx-auto">
                {children}
            </main>
            <Footer />
            <SystemLogs />
        </div>
    );
};
