
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, User, Bot, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

interface ChatLog {
    id: string;
    sessionId: string;
    timestamp: string;
    mode: 'NORMAL' | 'RECRUITER' | 'NERD';
    userQuery: string;
    aiResponse: string;
}

interface GroupedSession {
    sessionId: string;
    mode: 'NORMAL' | 'RECRUITER' | 'NERD';
    firstTimestamp: string;
    messages: ChatLog[];
}

const MODE_COLORS = {
    NORMAL: 'text-gray-400 bg-white/5',
    RECRUITER: 'text-primary bg-primary/10',
    NERD: 'text-red-400 bg-red-500/10',
};

export const ChatLogsViewer: React.FC = () => {
    const [logs, setLogs] = useState<ChatLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'chatLogs'), orderBy('timestamp', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatLog));
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch chat logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Group by sessionId
    const sessions: GroupedSession[] = Object.values(
        logs.reduce((acc, log) => {
            if (!acc[log.sessionId]) {
                acc[log.sessionId] = {
                    sessionId: log.sessionId,
                    mode: log.mode,
                    firstTimestamp: log.timestamp,
                    messages: [],
                };
            }
            acc[log.sessionId].messages.push(log);
            return acc;
        }, {} as Record<string, GroupedSession>)
    );

    const formatTime = (ts: string) => {
        try {
            const d = new Date(ts);
            return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return ts; }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} className="text-primary" />
                    Chatbot Conversations
                    <span className="text-xs text-gray-600 font-normal normal-case">({sessions.length} sessions)</span>
                </h3>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="text-center py-8 text-gray-600 font-mono text-sm animate-pulse">
                    Fetching logs...
                </div>
            )}

            {!loading && sessions.length === 0 && (
                <div className="text-center py-8 text-gray-600 font-mono text-sm">
                    No conversations yet.
                </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {sessions.map((session) => (
                    <div key={session.sessionId} className="border border-white/5 rounded-lg overflow-hidden">
                        {/* Session Header */}
                        <button
                            onClick={() => setExpandedSession(prev => prev === session.sessionId ? null : session.sessionId)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#161b22] hover:bg-white/5 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                {expandedSession === session.sessionId
                                    ? <ChevronDown size={14} className="text-gray-500 shrink-0" />
                                    : <ChevronRight size={14} className="text-gray-500 shrink-0" />
                                }
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${MODE_COLORS[session.mode]}`}>
                                    {session.mode}
                                </span>
                                <span className="font-mono text-xs text-gray-600">
                                    {session.sessionId.substring(0, 20)}...
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 shrink-0">
                                <span>{session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}</span>
                                <span>{formatTime(session.firstTimestamp)}</span>
                            </div>
                        </button>

                        {/* Session Messages */}
                        {expandedSession === session.sessionId && (
                            <div className="bg-[#0d1117] p-4 space-y-4 border-t border-white/5">
                                {[...session.messages].reverse().map((msg) => (
                                    <div key={msg.id} className="space-y-2">
                                        {/* User Query */}
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                <User size={11} className="text-primary" />
                                            </div>
                                            <p className="text-sm text-white bg-primary/10 rounded-lg px-3 py-2 leading-relaxed max-w-[90%]">
                                                {msg.userQuery}
                                            </p>
                                        </div>
                                        {/* AI Response */}
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot size={11} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-300 bg-[#161b22] rounded-lg px-3 py-2 leading-relaxed max-w-[90%] border border-white/5">
                                                {msg.aiResponse}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-gray-700 pl-7 font-mono">
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
