
import React, { useEffect, useState } from 'react';
import { KernelPanic } from './KernelPanic';
import { Terminal } from 'lucide-react';

export const GlobalCommandListener: React.FC = () => {
    const [buffer, setBuffer] = useState('');
    const [showPanic, setShowPanic] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input field (if we add any later)
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'Backspace') {
                setBuffer(prev => prev.slice(0, -1));
                return;
            }

            if (e.key.length === 1) {
                setBuffer(prev => (prev + e.key).slice(-50)); // Keep last 50 chars
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const checkCommands = () => {
            const lowerBuffer = buffer.toLowerCase();

            if (lowerBuffer.includes('sudo rm -rf /') || lowerBuffer.includes('rm -rf /')) {
                setShowPanic(true);
                setBuffer('');
            } else if (lowerBuffer.includes('cat /etc/passwd') || lowerBuffer.includes('cat /etc/shadow')) {
                showToast("🚫 Permission denied: Nice try, script kiddie.");
                setBuffer('');
            } else if (lowerBuffer.includes('whoami')) {
                showToast("root (obviously)");
                setBuffer('');
            } else if (lowerBuffer.includes('ls -la')) {
                showToast("📂 .hidden_secrets  .config  .ssh (Don't touch!)");
                setBuffer('');
            }
        };

        checkCommands();
    }, [buffer]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    if (showPanic) {
        return <KernelPanic />;
    }

    return (
        <>
            {toastMessage && (
                <div className="fixed bottom-10 right-10 z-50 bg-surface-dark border border-primary text-white px-4 py-3 rounded shadow-lg animate-fade-in-up flex items-center gap-3">
                    <Terminal size={18} className="text-primary" />
                    <span className="font-mono text-sm">{toastMessage}</span>
                </div>
            )}

            {/* Visual indicator that typing is being captured (optional, maybe hidden) */}
            <div className="fixed bottom-2 right-2 text-white/5 font-mono text-xs pointer-events-none">
                {buffer}
            </div>
        </>
    );
};
