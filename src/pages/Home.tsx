
import { Link } from 'react-router-dom';
import { TerminalWindow } from '../components/ui/TerminalWindow';
import { ServiceCard } from '../components/ui/ServiceCard.tsx';
import { OneLiner } from '../components/ui/OneLiner';
import { CommandInput } from '../components/features/CommandInput';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">

            {/* Hero Section */}
            <div className="w-full max-w-4xl mb-24 animate-fade-in-up">
                <TerminalWindow header="user@portfolio: ~/hero">

                    {/* Whomami Command */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-primary">user@portfolio:~$</span>
                        <span className="text-white typing-effect">whoami</span>
                    </div>

                    <div className="mb-8 pl-4 border-l-2 border-surface-border text-gray-300">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                            System Architect & <br className="hidden md:block" />
                            Infrastructure Engineer
                        </h1>
                        <p className="max-w-2xl text-gray-400">
                            Specializing in high-availability clusters, automation pipelines, and zero-trust security architectures. I turn chaotic infrastructure into reliable code.
                        </p>
                    </div>

                    {/* Status Command */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                        <span className="text-primary">user@portfolio:~$</span>
                        <span className="text-white">cat ./current_status.txt</span>
                    </div>

                    <div className="mb-8 text-gray-400 space-y-1 font-mono text-sm">
                        <p>Location: <span className="text-[#f6f6f4]">Remote / Worldwide</span></p>
                        <p>Availability: <span className="text-primary">Open for contracts</span></p>
                        <p>Focus: <span className="text-[#f6f6f4]">Kubernetes, Ansible, AWS</span></p>
                    </div>

                    {/* Navigation/Nodes Command */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                        <span className="text-primary">user@portfolio:~$</span>
                        <span className="text-white">ls -1 ./available_nodes/</span>
                    </div>

                    <div className="mb-8 pl-4 border-l-2 border-surface-border grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                        {[
                            { name: './home*', path: '/' },
                            { name: './about*', path: '/about' },
                            { name: './experience*', path: '/experience' },
                            { name: './projects*', path: '/projects' },
                            { name: './achievements*', path: '/achievements' },
                            { name: './journals*', path: '/journals' },
                            { name: './contact*', path: '/contact' },
                        ].map((node) => (
                            <Link key={node.name} to={node.path} className="group flex items-center gap-2 text-[#98c379] hover:text-primary transition-colors">
                                <span className="text-gray-600 group-hover:text-primary/50 text-xs">r-x</span>
                                <span className="group-hover:underline underline-offset-4 decoration-dashed">{node.name}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Interactive Command Input */}
                    <CommandInput />

                    <OneLiner />

                </TerminalWindow>
            </div>

            {/* Active Services Section */}
            <div className="w-full max-w-6xl px-4">
                <div className="mb-10 flex items-end gap-4 border-b border-white/5 pb-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center">
                        <span className="text-primary mr-2">&gt;</span> ./active_services
                    </h2>
                    <span className="font-mono text-xs text-gray-500 mb-1 hidden sm:inline-block">--verbose</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ServiceCard title="module: automation" icon="terminal">
                        <span className="text-gray-500">{'{'}</span><br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"tools"</span>: [<span className="text-[#98c379]">"Ansible"</span>, <span className="text-[#98c379]">"Terraform"</span>],<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"goal"</span>: <span className="text-[#98c379]">"Idempotency"</span>,<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"pipeline"</span>: <span className="text-[#98c379]">"GitLab CI"</span><br />
                        <span className="text-gray-500">{'}'}</span>
                    </ServiceCard>

                    <ServiceCard title="module: security" icon="security" delay={100}>
                        <span className="text-gray-500">{'{'}</span><br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"policy"</span>: <span className="text-[#98c379]">"Zero Trust"</span>,<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"hardening"</span>: <span className="text-[#98c379]">"SELinux/AppArmor"</span>,<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"compliance"</span>: <span className="text-[#d19a66]">true</span><br />
                        <span className="text-gray-500">{'}'}</span>
                    </ServiceCard>

                    <ServiceCard title="module: cloud_ops" icon="cloud" delay={200}>
                        <span className="text-gray-500">{'{'}</span><br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"provider"</span>: <span className="text-[#98c379]">"AWS/GCP"</span>,<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"scaling"</span>: <span className="text-[#98c379]">"Horizontal"</span>,<br />
                        &nbsp;&nbsp;<span className="text-[#e06c75]">"uptime"</span>: <span className="text-[#d19a66]">99.99</span><br />
                        <span className="text-gray-500">{'}'}</span>
                    </ServiceCard>
                </div>
            </div>

        </div>
    );
};

export default Home;
