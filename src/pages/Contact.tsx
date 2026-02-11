
import React, { useState } from 'react';
import { Send, Terminal, Mail, MapPin, Github, Linkedin, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SENDING');
        setLogs(['Initializing handshake...', 'Resolving host discord.com...', 'Packing payload...']);

        // Use Cloudflare Worker proxy URL (set this after deploying your worker)
        // Replace with your actual worker URL: https://your-worker-name.your-subdomain.workers.dev
        const webhookUrl = import.meta.env.VITE_WEBHOOK_PROXY_URL || 'https://discord-webhook-proxy.syedammar06.workers.dev/';

        if (!webhookUrl) {
            setLogs(prev => [...prev, 'ERROR: Webhook URL not configured. Please set VITE_WEBHOOK_PROXY_URL in .env']);
            setStatus('ERROR');
            return;
        }

        const payload = {
            embeds: [{
                title: `New Message from ${formData.name}`,
                color: 0x00a89a, // Primary color
                fields: [
                    { name: 'Email', value: formData.email, inline: true },
                    { name: 'Subject', value: formData.subject, inline: true },
                    { name: 'Message', value: formData.message }
                ],
                footer: { text: "Portfolio Contact Form" },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay for "network" feel
            setLogs(prev => [...prev, 'Connection established.', 'Sending packet 1/1...']);

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                // Rate limited
                const data = await response.json();
                setLogs(prev => [...prev,
                    `ERROR: Rate limit exceeded.`,
                `${data.message || 'Please wait before sending another message.'}`,
                    'Connection closed.'
                ]);
                setStatus('ERROR');
            } else if (response.ok) {
                setLogs(prev => [...prev, 'ACK received.', 'Message delivered successfully.', 'Closing connection...']);
                setStatus('SUCCESS');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('IDLE'), 5000);
            } else {
                throw new Error('Server responded with non-200 status');
            }
        } catch (error) {
            setLogs(prev => [...prev, `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Connection reset by peer.']);
            setStatus('ERROR');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full max-w-7xl mx-auto py-12 px-4">

            <div className="w-full mb-12 animate-fade-in-up">
                <h1 className="font-mono text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    <span className="text-primary mr-2">$</span>./initiate_handshake.sh
                </h1>
                <p className="font-mono text-gray-500 text-sm md:text-base border-l-2 border-primary/30 pl-4 mt-4">
                    Establishing secure connection... Done.<br />
                    Channel open for communication. Awaiting input stream.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

                {/* Contact Form */}
                <div className="bg-surface-dark border border-surface-border rounded-lg p-6 md:p-8 shadow-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="font-mono text-xs text-gray-500">user@portfolio:~/contact-form</div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-mono text-primary">
                                <span className="text-gray-500">$</span> export SENDER_NAME=
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[#111417] border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-700"
                                placeholder='"John Doe"'
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-mono text-primary">
                                <span className="text-gray-500">$</span> export SENDER_EMAIL=
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#111417] border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-700"
                                placeholder='"john@example.com"'
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="block text-sm font-mono text-primary">
                                <span className="text-gray-500">$</span> export SUBJECT=
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-[#111417] border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-700"
                                placeholder='"Project Inquiry"'
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-mono text-primary">
                                <span className="text-gray-500">$</span> echo "MESSAGE" &gt;&gt; /dev/tcp/host/25
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                className="w-full bg-[#111417] border border-white/10 rounded px-4 py-2 text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-gray-700 resize-none"
                                placeholder="Type your message here..."
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'SENDING'}
                            className={`group w-full flex items-center justify-center gap-2 bg-primary/10 border border-primary/50 text-primary hover:bg-primary hover:text-black font-mono py-3 rounded transition-all duration-300 ${status === 'SENDING' ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <span>{status === 'SENDING' ? './sending...' : './send_message.sh'}</span>
                            <Send className={`w-4 h-4 ${status === 'SENDING' ? 'animate-ping' : 'group-hover:translate-x-1 transition-transform'}`} />
                        </button>

                        {status !== 'IDLE' && (
                            <div className="mt-4 p-4 bg-[#111417] border border-white/10 rounded font-mono text-xs md:text-sm">
                                {logs.map((log, i) => (
                                    <div key={i} className={`${log.includes('ERROR') ? 'text-red-500' : 'text-gray-400'}`}>
                                        <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </div>
                                ))}
                                {status === 'SUCCESS' && <div className="text-primary mt-2">Verified.</div>}
                            </div>
                        )}
                    </form>
                </div>

                {/* Contact Info Sidebar */}
                <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>

                    {/* Terminal Info */}
                    <div className="bg-surface-dark border border-surface-border rounded-lg p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Terminal className="w-24 h-24 text-primary" />
                        </div>
                        <h3 className="font-mono text-xl text-white font-bold mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-primary block"></span>
                            Connection Details
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded border border-white/10 text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-gray-500 mb-1">cat /etc/contact/email</p>
                                    <a href="mailto:hello@syedammar.dev" className="text-white hover:text-primary transition-colors font-mono">hello@syedammar.dev</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded border border-white/10 text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-gray-500 mb-1">curl ipinfo.io/city</p>
                                    <span className="text-white font-mono">Islamabad, Pakistan</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded border border-white/10 text-primary">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-mono text-gray-500 mb-1">ping -c 1 social_media</p>
                                    <div className="flex gap-4 mt-2">
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ASCII Art or Decorative Element */}
                    <div className="bg-[#15191e] border border-surface-border rounded-lg p-6 font-mono text-[10px] md:text-xs text-primary leading-tight overflow-hidden select-none opacity-50">
                        <pre>{`
   ._________________.
   |.---------------.|
   ||               ||
   ||   SYSTEM      ||
   ||   ONLINE      ||
   ||               ||
   ||_______________||
   /.-.-.-.-.-.-.-.-.\\
  /.-.-.-.-.-.-.-.-.-.\\
 /.-.-.-.-.-.-.-.-.-.-.\\
/______/__________\\___o_\\
\\_______________________/
`}</pre>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Contact;
