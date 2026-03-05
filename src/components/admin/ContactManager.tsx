import React, { useState, useEffect } from 'react';
import { getMessages, deleteItem, updateItem } from '../../services/db';
import type { ContactMessage } from '../../types/database';
import { Trash2, Mail, MailOpen } from 'lucide-react';

export const ContactManager: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const data = await getMessages();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            await deleteItem('messages', id);
            fetchMessages();
        }
    };

    const toggleReadStatus = async (msg: ContactMessage) => {
        await updateItem('messages', msg.id!, { read: !msg.read });
        fetchMessages();
    };

    if (loading) return <div className="text-gray-500 font-mono">Loading messages...</div>;

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Contact Messages</h3>

            <div className="space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded border transition-colors ${msg.read ? 'bg-[#161b22] border-white/5 opacity-75' : 'bg-surface-dark border-primary/30'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    {msg.name} <span className="text-xs font-normal text-gray-500">&lt;{msg.email}&gt;</span>
                                    {!msg.read && <span className="w-2 h-2 rounded-full bg-primary mx-2"></span>}
                                </h4>
                                <p className="text-xs text-primary font-mono mt-1">Subject: {msg.subject}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 font-mono hidden md:inline-block">{new Date(msg.createdAt).toLocaleString()}</span>
                                <button onClick={() => toggleReadStatus(msg)} className="text-gray-400 hover:text-white" title={msg.read ? "Mark unread" : "Mark read"}>
                                    {msg.read ? <MailOpen size={16} /> : <Mail size={16} />}
                                </button>
                                <button onClick={() => handleDelete(msg.id!)} className="text-red-400 hover:text-red-300">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-black/20 rounded font-mono text-sm text-gray-300 whitespace-pre-wrap border border-white/5">
                            {msg.message}
                        </div>
                    </div>
                ))}
                {messages.length === 0 && <p className="text-gray-500 text-center py-8">No messages found.</p>}
            </div>
        </div>
    );
};
