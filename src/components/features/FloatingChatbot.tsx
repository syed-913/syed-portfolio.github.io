import { forwardRef, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import '../../assistant.css';
import { createPortal } from 'react-dom';
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, ChevronDown, History, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ASSISTANT_DAILY_LIMIT, usePortfolioAssistant, type AssistantMessage, type AssistantMode } from '../../hooks/usePortfolioAssistant';
import { SafeMarkdown } from '../ui/SafeMarkdown';

const spring = { type: 'spring' as const, stiffness: 240, damping: 28, mass: 1 };

const AssistantFrame = ({ children, panelRef, reduced, paused }: { children: ReactNode; panelRef: RefObject<HTMLElement | null>; reduced: boolean; paused: boolean }) => {
  const present = useIsPresent();
  return <div className="assistant-position" data-paused={paused || !present || undefined} aria-hidden={!present} inert={!present}>
    <motion.section ref={panelRef} id="portfolio-assistant" className="assistant-dock" aria-label="Portfolio assistant" tabIndex={-1} style={{ pointerEvents: present ? 'auto' : 'none' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduced ? 0.08 : 0.18, delay: reduced ? 0 : 0.12 } }}>{children}</motion.section>
  </div>;
};

const MessageBubble = forwardRef<HTMLDivElement, { message: AssistantMessage; reduced: boolean; remaining?: number; footer?: ReactNode; retry: () => void; retryDisabled: boolean }>(function MessageBubble({ message, reduced, remaining, footer, retry, retryDisabled }, ref) {
  const present = useIsPresent();
  return <motion.div ref={ref} layout={reduced ? false : 'position'} className={`assistant-message ${message.role}`} aria-hidden={!present} inert={!present} initial={reduced ? { opacity: 0 } : { opacity: 0, y: message.role === 'user' ? 14 : 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -5, transition: { duration: 0.12 } }} transition={reduced ? { duration: 0.08 } : spring} style={{ transformOrigin: message.role === 'user' ? 'bottom right' : 'bottom left', pointerEvents: present ? 'auto' : 'none' }}>
    {message.role === 'model' && <span className="assistant-author"><i/>Portfolio guide{remaining !== undefined && <small>{remaining}/{ASSISTANT_DAILY_LIMIT} today</small>}</span>}
    <div className="assistant-message-copy"><SafeMarkdown>{message.text}</SafeMarkdown></div>
    {message.failedQuery && <div className="assistant-recovery"><button type="button" disabled={retryDisabled} onClick={retry}>Try again</button><Link to="/contact">Contact <ArrowUpRight size={13}/></Link></div>}
    {footer && <div className="assistant-message-footer">{footer}</div>}
  </motion.div>;
});


const AssistantComposer = ({ assistant, reduce, inputRef, panelRef, barRef, barSize, onClose, onModeChange }: {
  assistant: ReturnType<typeof usePortfolioAssistant>;
  reduce: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  barRef: RefObject<HTMLFormElement | null>;
  barSize: { width: number; height: number };
  onClose: (restoreFocus?: boolean) => void;
  onModeChange: (mode: AssistantMode) => void;
}) => {
  const present = useIsPresent();
  const [settled, setSettled] = useState(false);
  const interactive = present && (settled || reduce);
  useEffect(() => {
    if (!interactive) return;
    const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    (touch ? panelRef.current : inputRef.current)?.focus({ preventScroll: true });
  }, [interactive, inputRef, panelRef]);
  return (
        <form ref={barRef} className="assistant-composer" aria-busy={!interactive} onSubmit={event => { event.preventDefault(); if (!interactive) return; void assistant.send(); inputRef.current?.focus({ preventScroll: true }); }}>
          <motion.div onAnimationStart={() => setSettled(false)} onAnimationComplete={() => { if (present) setSettled(true); }} className="assistant-composer-surface" aria-hidden="true" initial={reduce ? { opacity: 0 } : { scaleX: 0.06, opacity: 0.4 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ scaleX: reduce ? 1 : 0.08, opacity: 0, transition: { duration: reduce ? 0.08 : 0.16, delay: reduce ? 0 : 0.12 } }} transition={reduce ? { duration: 0.08 } : { type: 'spring', stiffness: 150, damping: 25, mass: 1.1 }}>
            <svg className="assistant-edge" viewBox={`0 0 ${barSize.width} ${barSize.height}`} preserveAspectRatio="none"><rect x="1" y="1" width={Math.max(1, barSize.width - 2)} height={Math.max(1, barSize.height - 2)} rx="27" pathLength="100"/></svg>
          </motion.div>
          <div className="assistant-composer-content" data-ready={interactive} aria-hidden={!interactive} inert={!interactive}>
            <label className="assistant-mode"><MessageCircle size={19}/><span className="sr-only">Assistant mode</span><select value={assistant.mode} disabled={assistant.typing} onChange={event => onModeChange(event.target.value as AssistantMode)} aria-label="Assistant mode"><option value="NORMAL">Visitor</option><option value="RECRUITER">Recruiter</option></select><ChevronDown size={10}/></label>
            <label className="assistant-prompt"><span className="sr-only">Message</span><input ref={inputRef} value={assistant.input} onChange={event => assistant.setInput(event.target.value)} aria-label="Message" aria-describedby="assistant-quota" placeholder={assistant.remaining ? 'Ask about projects, skills or experience…' : 'Daily limit reached'} maxLength={2000} disabled={!assistant.remaining} autoComplete="off"/><span aria-hidden="true" className="assistant-short-prompt">{assistant.remaining ? 'Ask Syed…' : 'Limit reached'}</span></label>
            <button type="submit" className="assistant-send" disabled={!assistant.input.trim() || assistant.typing || !assistant.remaining} aria-label="Send message"><Send size={18}/></button>
            <button type="button" className="assistant-close" onClick={() => onClose()} aria-label="Close assistant"><X size={19}/></button>
          </div>
        </form>
  );
};

export const FloatingChatbot = ({ open, onClose, onExitComplete }: { open: boolean; onClose: (restoreFocus?: boolean) => void; onExitComplete: () => void }) => {
  const assistant = usePortfolioAssistant(open);
  const reduce = useReducedMotion();
  const [history, setHistory] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [barSize, setBarSize] = useState({ width: 680, height: 76 });
  const panel = useRef<HTMLElement>(null), input = useRef<HTMLInputElement>(null), viewport = useRef<HTMLDivElement>(null), bar = useRef<HTMLFormElement>(null);
  const lastQuestion = assistant.messages.map(message => message.role).lastIndexOf('user');
  const visibleMessages = history ? assistant.messages : assistant.messages.length === 1 && assistant.messages[0].id === 'welcome' ? [] : assistant.messages.slice(Math.max(0, lastQuestion >= 0 ? lastQuestion : assistant.messages.length - 1));
  const hasHistory = lastQuestion > 0;

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update); update();
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    const outside = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || panel.current?.contains(event.target) || event.target.closest('.assistant-launcher, a[href]')) return;
      onClose(false);
    };
    document.addEventListener('keydown', key); document.addEventListener('click', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('click', outside); };
  }, [open, onClose, reduce]);
  useEffect(() => {
    if (!open || !bar.current) return;
    const observer = new ResizeObserver(entries => {
      const box = entries[0].contentRect;
      setBarSize(previous => Math.abs(previous.width - box.width) < 1 && Math.abs(previous.height - box.height) < 1 ? previous : { width: box.width, height: box.height });
    });
    observer.observe(bar.current); return () => observer.disconnect();
  }, [open]);
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const visual = window.visualViewport;
    const update = () => {
      const position = panel.current?.parentElement;
      position?.style.setProperty('--assistant-keyboard-gap', `${Math.max(0, window.innerHeight - visual.height - visual.offsetTop)}px`);
      position?.style.setProperty('--assistant-viewport-height', `${visual.height}px`);
    };
    update(); visual.addEventListener('resize', update); visual.addEventListener('scroll', update);
    return () => { visual.removeEventListener('resize', update); visual.removeEventListener('scroll', update); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: reduce ? 'instant' : 'smooth' }));
    return () => cancelAnimationFrame(frame);
  }, [assistant.messages, assistant.typing, history, open, reduce]);

  if (!assistant.settings.chatbotEnabled) return null;
  const transition = reduce ? { duration: 0.08 } : spring;
  return createPortal(<AnimatePresence onExitComplete={onExitComplete}>
    {open && <AssistantFrame key="position" panelRef={panel} reduced={!!reduce} paused={!pageVisible}>
        <LayoutGroup id="portfolio-conversation">
          <span className="sr-only" id="assistant-quota">{assistant.remaining} of {ASSISTANT_DAILY_LIMIT} questions remaining today.</span>
          <div ref={viewport} className={`assistant-messages ${history ? 'has-history' : ''}`} id="assistant-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text">
            <AnimatePresence initial={false} mode="popLayout">
              {visibleMessages.map(message => <MessageBubble key={message.id} message={message} reduced={!!reduce} remaining={message.role === 'model' && message.id === assistant.messages.at(-1)?.id ? assistant.remaining : undefined} retry={() => void assistant.send(message.failedQuery)} retryDisabled={assistant.typing || !assistant.remaining} footer={hasHistory && message.role === 'model' && message.id === assistant.messages.at(-1)?.id ? <button type="button" aria-expanded={history} aria-controls="assistant-messages" onClick={() => setHistory(value => !value)}><History size={14}/>{history ? 'Latest exchange' : 'History'}</button> : undefined}/>)}
              {assistant.typing && <motion.div key="typing" layout={reduce ? false : 'position'} className="assistant-typing" role="status" initial={{ opacity: 0, scale: reduce ? 1 : 0.86, y: reduce ? 0 : 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.9, transition: { duration: 0.1 } }} transition={transition}><span className="sr-only">Portfolio assistant is typing</span><i/><i/><i/></motion.div>}
            </AnimatePresence>
          </div>
        </LayoutGroup>
        <AssistantComposer assistant={assistant} reduce={!!reduce} inputRef={input} panelRef={panel} barRef={bar} barSize={barSize} onClose={onClose} onModeChange={mode => { assistant.switchMode(mode); setHistory(false); }}/>
    </AssistantFrame>}
  </AnimatePresence>, document.body);
};
