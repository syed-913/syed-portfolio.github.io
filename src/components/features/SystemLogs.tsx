
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LogEntry {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    message: string;
    source: 'KERNEL' | 'NETWORK' | 'SYSTEM' | 'USER';
}

export const SystemLogs: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial boot logs
    useEffect(() => {
        const bootLogs: string[] = [
            "Initializing kernel...",
            "Loading drivers...",
            "Mounting file system...",
            "Starting network services...",
            "Establishing secure connection...",
            "System ready."
        ];

        let delay = 0;
        bootLogs.forEach((msg) => {
            delay += Math.random() * 500 + 200;
            setTimeout(() => {
                addLog('INFO', msg, 'KERNEL');
            }, delay);
        });
    }, []);

    // Monitor navigation
    useEffect(() => {
        addLog('INFO', `Navigation detected: ${location.pathname}`, 'USER');

        // Random background noise logs
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const randomEvents = [
                    { msg: "Packet trace complete", type: 'DEBUG', src: 'NETWORK' },
                    { msg: "Garbage collection started", type: 'DEBUG', src: 'SYSTEM' },
                    { msg: "Memory usage optimized", type: 'INFO', src: 'SYSTEM' },
                    { msg: "Heartbeat signal received", type: 'DEBUG', src: 'NETWORK' },
                    { msg: "Updating display buffer", type: 'DEBUG', src: 'KERNEL' },
                ];
                const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
                addLog(event.type as any, event.msg, event.src as any);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [location.pathname]);

    // Auto-scroll
    useEffect(() => {
        if (logsEndRef.current && isExpanded) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isExpanded]);

    const addLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, source: 'KERNEL' | 'NETWORK' | 'SYSTEM' | 'USER') => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour12: false }) + `.${now.getMilliseconds().toString().padStart(3, '0')}`;

        setLogs(prev => {
            const newLogs = [...prev, {
                id: Date.now() + Math.random(),
                timestamp: timeString,
                level,
                message,
                source
            }];
            return newLogs.slice(-50); // Keep last 50 logs
        });
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out border border-surface-border rounded-lg bg-[#0d0d0d]/90 backdrop-blur-md shadow-2xl overflow-hidden font-mono text-[10px] md:text-xs ${isExpanded ? 'w-[calc(100vw-2rem)] md:w-96 h-64' : 'w-auto h-auto'}`}
        >
            {/* Header / Toggle */}
            <div
                className="flex items-center justify-between px-3 py-2 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-primary animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-gray-300 font-bold">system_logs</span>
                    {!isExpanded && logs.length > 0 && (
                        <span className="text-gray-500 truncate max-w-[150px] hidden sm:inline-block border-l border-white/10 pl-2 ml-2">
                            {logs[logs.length - 1].message}
                        </span>
                    )}
                </div>
                <div className="text-gray-400">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </div>
            </div>

            {/* Logs Content */}
            {isExpanded && (
                <div className="p-3 overflow-y-auto h-[calc(100%-36px)] space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-2 hover:bg-white/5 p-0.5 rounded">
                            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
                            <span className={`shrink-0 w-12 ${log.level === 'INFO' ? 'text-blue-400' :
                                log.level === 'WARN' ? 'text-yellow-400' :
                                    log.level === 'ERROR' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                {log.level}
                            </span>
                            <span className="text-purple-400 shrink-0 w-16 hidden sm:inline-block">[{log.source}]</span>
                            <span className="text-gray-300 break-all">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            )}
        </div>
    );
};
