import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Terminal, Briefcase, User, Sparkles } from 'lucide-react';

type Role = 'NORMAL' | 'RECRUITER' | 'NERD';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const SYSTEM_PROMPTS = {
    NORMAL: "You are Syed Ammar's portfolio AI assistant. Be conversational, friendly, and brief. Answer questions about his experience as a Linux System Administrator and DevOps Engineer.",
    RECRUITER: "You are Syed Ammar's portfolio AI assistant tailored for recruiters. Be formal, professional, and highlight his core metrics, achievements, certifications (RHCSA, AWS, Terraform), and enterprise experience. Keep responses concise and focused on ROI and technical qualifications.",
    NERD: "You are Syed Ammar's internal terminal bot. Speak heavily in Linux jargon, use sarcastic hacker humor, and occasionally 'roast' the user playfully about their lack of root privileges. Emphasize Ammar's deep technical automation skills."
};
// --- Rate Limiting ---
// Gemini 2.5 Flash free tier: ~500 RPD shared across ALL users.
// We limit each unique visitor to 15 messages per day to protect the shared quota.
const RATE_LIMIT_KEY = 'chatbot_usage';
const DAILY_LIMIT = 15;

interface UsageData { count: number; date: string; }

const getTodayKey = () => new Date().toISOString().split('T')[0]; // e.g. "2026-02-26"

const getRemainingMessages = (): number => {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY);
        if (!raw) return DAILY_LIMIT;
        const usage: UsageData = JSON.parse(raw);
        if (usage.date !== getTodayKey()) return DAILY_LIMIT;
        return Math.max(0, DAILY_LIMIT - usage.count);
    } catch { return DAILY_LIMIT; }
};

const incrementUsage = () => {
    try {
        const raw = localStorage.getItem(RATE_LIMIT_KEY);
        const today = getTodayKey();
        if (raw) {
            const usage: UsageData = JSON.parse(raw);
            if (usage.date === today) {
                localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: usage.count + 1, date: today }));
                return;
            }
        }
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, date: today }));
    } catch { /* ignore */ }
};
export const FloatingChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeRole, setActiveRole] = useState<Role>('NORMAL');
    const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    const [remaining, setRemaining] = useState(getRemainingMessages);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I'm Ammar's AI Assistant. How can I help you navigate the portfolio today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        // Check rate limit before sending
        if (remaining <= 0) {
            setMessages(prev => [...prev, {
                role: 'model',
                text: `🚫 Daily message limit reached (${DAILY_LIMIT}/day). Come back tomorrow!`
            }]);
            return;
        }

        const userMessage = input.trim();
        setInput('');
        incrementUsage();
        setRemaining(getRemainingMessages());
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setIsTyping(true);

        try {
            const webhookUrl = import.meta.env.VITE_GEMINI_PROXY_URL;
            if (!webhookUrl) {
                throw new Error("VITE_GEMINI_PROXY_URL is not defined in .env");
            }

            // Apply Sliding Window: Keep only the last 6 messages (3 turns)
            const recentMessages = messages.concat([{ role: 'user', text: userMessage }]).slice(-6);

            // Map messages to Gemini API format
            const contents = recentMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            // Determine Temperature and Top P per mode
            let temperature = 0.7;
            let topP = 0.95;
            if (activeRole === 'RECRUITER') { // Focused
                temperature = 0.2;
                topP = 0.8;
            } else if (activeRole === 'NERD') { // Creative
                temperature = 0.9;
                topP = 1.0;
            }

            // Build exact payload Gemini API expects so the proxy just has to forward it
            const payload = {
                system_instruction: {
                    role: "system",
                    parts: [{ text: SYSTEM_PROMPTS[activeRole] }]
                },
                contents: contents,
                temperature: temperature,
                topP: topP
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.error && errorJson.error.message) {
                        errorText = errorJson.error.message;
                    }
                } catch (e) {
                    // It was plain text
                }
                throw new Error(`Server returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Extract text from Gemini's response structure
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

            setMessages(prev => [...prev, { role: 'model', text: aiText }]);

            // Fire-and-forget logging to Firestore
            import('../../services/db').then(({ addItem }) => {
                addItem('chatLogs', {
                    sessionId,
                    timestamp: new Date().toISOString(),
                    mode: activeRole,
                    userQuery: userMessage,
                    aiResponse: aiText
                }).catch(err => console.error("Failed to sync chat log:", err));
            });
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: `[SYSTEM ERROR]: Could not reach the AI gateway. ${error instanceof Error ? error.message : ''}` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleRoleChange = (role: Role) => {
        setActiveRole(role);
        let greeting = "";
        if (role === 'NORMAL') greeting = "Switched to standard mode. How can I help?";
        if (role === 'RECRUITER') greeting = "Professional mode engaged. Ready to discuss qualifications and experience.";
        if (role === 'NERD') greeting = "root@bot:~# Terminal mode active. Don't touch things you don't understand.";

        setMessages([{ role: 'model', text: greeting }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] bg-[#0d1117] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">

                    {/* Header */}
                    <div className="bg-[#161b22] border-b border-white/10 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary relative">
                                <Bot size={18} />
                                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161b22]"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Ammar's AI</h3>
                                <p className="text-xs text-primary font-mono tracking-tighter">online</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Persona Selector */}
                    <div className="bg-[#111417] p-2 border-b border-white/5 flex gap-1 justify-center shrink-0">
                        <button
                            onClick={() => handleRoleChange('NORMAL')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${activeRole === 'NORMAL' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <User size={12} /> Normal
                        </button>
                        <button
                            onClick={() => handleRoleChange('RECRUITER')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${activeRole === 'RECRUITER' ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Briefcase size={12} /> Recruiter
                        </button>
                        <button
                            onClick={() => handleRoleChange('NERD')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors ${activeRole === 'NERD' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Terminal size={12} /> Nerd
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-black ml-auto rounded-br-sm'
                                    : 'bg-[#161b22] border border-white/5 text-gray-300 rounded-bl-sm font-sans'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-[#161b22] border border-white/5 text-gray-400 rounded-lg rounded-bl-sm p-3 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#161b22] border-t border-white/10 shrink-0">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={remaining > 0 ? "Ask me anything..." : "Daily limit reached. Come back tomorrow!"}
                                disabled={remaining <= 0}
                                className="w-full bg-[#0d1117] border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping || remaining <= 0}
                                className="absolute right-2 p-1.5 bg-primary text-black rounded-full disabled:opacity-50 hover:bg-white transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                        <div className="flex justify-end mt-1.5">
                            <span className={`text-[10px] font-mono ${remaining <= 3 ? 'text-red-400' : 'text-gray-600'}`}>
                                {remaining}/{DAILY_LIMIT} messages remaining today
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-[#161b22] border border-primary/50 text-primary rounded-full shadow-[0_0_20px_rgba(0,168,154,0.3)] hover:shadow-[0_0_30px_rgba(0,168,154,0.5)] hover:-translate-y-1 transition-all duration-300"
                >
                    <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
                    <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-20"></div>
                </button>
            )}
        </div>
    );
};
