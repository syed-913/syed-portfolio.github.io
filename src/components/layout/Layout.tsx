import type { ReactNode } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ChatbotLauncher } from '../features/ChatbotLauncher';
import { CursorField } from '../features/CursorField';

export const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="site-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <CursorField />
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <m.main
          key={location.pathname}
          className="site-main"
          initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={reduce ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? undefined : { opacity: 0, y: -7, filter: 'blur(3px)' }}
          transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <m.div
            className="route-signal"
            aria-hidden="true"
            initial={reduce ? false : { scaleX: 0, opacity: 0.9 }}
            animate={reduce ? undefined : { scaleX: 1, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
          />
          {children}
        </m.main>
      </AnimatePresence>
      <Footer />
      <ChatbotLauncher />
    </div>
  );
};
