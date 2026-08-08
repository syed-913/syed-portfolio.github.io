import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingChatbot } from '../features/FloatingChatbot';
import { CursorField } from '../features/CursorField';

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="site-shell">
    <div className="ambient ambient-one" aria-hidden="true" />
    <div className="ambient ambient-two" aria-hidden="true" />
    <CursorField />
    <Navbar />
    <main className="site-main">{children}</main>
    <Footer />
    <FloatingChatbot />
  </div>
);
