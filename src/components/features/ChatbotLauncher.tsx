import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "../../hooks/useSiteSettings";

const LazyFloatingChatbot = lazy(() => import("./FloatingChatbot").then(module => ({ default: module.FloatingChatbot })));
export const ChatbotLauncher = () => {
  const { settings } = useSiteSettings();
  const [activated, setActivated] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const close = useCallback(() => { restoreFocus.current = true; setOpen(false); }, []);
  useEffect(() => {
    const otherOverlay = (event: Event) => {
      if ((event as CustomEvent).detail === "navigation") { restoreFocus.current = false; setOpen(false); }
    };
    window.addEventListener("portfolio:overlay-open", otherOverlay);
    return () => window.removeEventListener("portfolio:overlay-open", otherOverlay);
  }, []);
  if (!settings.chatbotEnabled) return null;
  const toggle = () => {
    if (open) close();
    else {
      restoreFocus.current = false;
      window.dispatchEvent(new CustomEvent("portfolio:overlay-open", { detail: "assistant" }));
      setActivated(true); setOpen(true);
    }
  };
  return <>
    <div className="chatbot-dock">
      <button ref={trigger} className={`chatbot-launch ${open ? "is-active" : ""}`} type="button" onClick={toggle} aria-expanded={open} aria-controls="portfolio-assistant" aria-label={open ? "Close portfolio assistant" : "Ask about me — open portfolio assistant"} title="Portfolio assistant"><MessageCircle size={21} /></button>
    </div>
    {activated && <Suspense fallback={<span className="sr-only" role="status">Loading portfolio assistant…</span>}>
      <LazyFloatingChatbot open={open} onClose={close} onExitComplete={() => {
        if (!open && restoreFocus.current) { trigger.current?.focus({ preventScroll: true }); restoreFocus.current = false; }
      }} />
    </Suspense>}
  </>;
};
