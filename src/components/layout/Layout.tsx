
import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { GlobalCommandListener } from '../features/GlobalCommandListener';
import { SystemLogs } from '../features/SystemLogs';
import { FloatingChatbot } from '../features/FloatingChatbot';
import { GridBackground } from '../ui/GridBackground';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col bg-background-dark text-white font-display selection:bg-primary selection:text-black overflow-x-hidden">
            <GlobalCommandListener />
            <GridBackground />
            <Navbar />
            <main className="relative z-10 flex-grow py-10 px-4 w-full max-w-7xl mx-auto">
                {children}
            </main>
            <Footer />
            <SystemLogs />
            <FloatingChatbot />
        </div>
    );
};
