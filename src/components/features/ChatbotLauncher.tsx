import { lazy, Suspense, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const LazyFloatingChatbot = lazy(() => import('./FloatingChatbot').then((module) => ({ default: module.FloatingChatbot })));

export const ChatbotLauncher = () => {
  const { settings } = useSiteSettings();
  const [activated, setActivated] = useState(false);

  if (!settings.chatbotEnabled) return null;

  if (activated) {
    return (
      <Suspense fallback={
        <div className="chatbot-dock">
          <button className="chatbot-launch is-loading" type="button" disabled aria-label="Ask about me — loading portfolio assistant">
            <MessageCircle size={21} /><span>Ask about me</span><Sparkles size={13} />
          </button>
        </div>
      }>
        <LazyFloatingChatbot initialOpen />
      </Suspense>
    );
  }

  return (
    <div className="chatbot-dock">
      <button className="chatbot-launch" type="button" onClick={() => setActivated(true)} aria-label="Ask about me — open portfolio assistant">
        <MessageCircle size={21} /><span>Ask about me</span><Sparkles size={13} />
      </button>
    </div>
  );
};
