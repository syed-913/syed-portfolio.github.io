import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const LazyFloatingChatbot = lazy(() => import('./FloatingChatbot').then(module => ({ default: module.FloatingChatbot })));

export const ChatbotLauncher = () => {
  const { settings } = useSiteSettings();
  const [activated, setActivated] = useState(false), [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null), restoreFocus = useRef(false);
  const close = useCallback((restore = true) => { restoreFocus.current = restore; setOpen(false); }, []);
  useEffect(() => {
    const otherOverlay = (event: Event) => { if ((event as CustomEvent).detail === 'navigation') close(false); };
    window.addEventListener('portfolio:overlay-open', otherOverlay);
    return () => window.removeEventListener('portfolio:overlay-open', otherOverlay);
  }, [close]);
  if (!settings.chatbotEnabled) return null;
  return <>
    {createPortal(<button ref={trigger} className="assistant-launcher" data-open={open} aria-expanded={open} aria-controls="portfolio-assistant" aria-label="Ask about me — open portfolio assistant" aria-hidden={open} tabIndex={open ? -1 : 0} disabled={open} type="button" onClick={() => {
      restoreFocus.current = false;
      window.dispatchEvent(new CustomEvent('portfolio:overlay-open', { detail: 'assistant' }));
      setActivated(true); setOpen(true);
    }}><svg className="assistant-hexagon" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 2 54.25 16v28L30 58 5.75 44V16Z"/></svg><MessageCircle size={23}/></button>, document.body)}
    {activated && <Suspense fallback={open ? <span className="assistant-loading" role="status">Opening portfolio assistant…</span> : null}><LazyFloatingChatbot open={open} onClose={close} onExitComplete={() => {
      if (restoreFocus.current) { trigger.current?.focus({ preventScroll: true }); restoreFocus.current = false; }
    }}/></Suspense>}
  </>;
};
