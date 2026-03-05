
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { name: './home', path: '/' },
    { name: './about', path: '/about' },
    { name: './experience', path: '/experience' },
    { name: './projects', path: '/projects' },
    { name: './achievements', path: '/achievements' },
    { name: './journals', path: '/journals' },
    { name: './contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="font-mono text-sm md:text-base font-bold tracking-tight text-white hover:text-primary transition-colors duration-200 flex items-center gap-2"
                        >
                            <Terminal size={18} className="text-primary" />
                            <span className="text-primary">[syed-ammar@portfolio ~]#</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex gap-6 lg:gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "font-mono text-sm transition-colors hover:text-white",
                                    location.pathname === item.path ? "text-primary" : "text-gray-400"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-white/5 bg-background-dark">
                    <div className="space-y-1 px-4 py-3">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "block py-2 font-mono text-sm hover:text-white transition-colors",
                                    location.pathname === item.path ? "text-primary" : "text-gray-400"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};
