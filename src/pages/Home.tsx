
import { Link } from 'react-router-dom';
import { TerminalWindow } from '../components/ui/TerminalWindow';
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
                            System Admin & <br className="hidden md:block" />
                            Engineer (Jr)
                        </h1>
                        <p className="max-w-2xl text-gray-400">
                            I engineer automated Linux (RHEL) and AWS cloud environments using Python to build scalable, resilient infrastructure. By integrating AI-driven insights with ISO 27001 and NIST security standards, I bridge the gap between system administration and proactive, compliant operations. Focused on transforming manual workflows into secure, cloud-native pipelines that drive operational efficiency and data integrity.
                        </p>
                    </div>

                    {/* Status Command */}
                    <div className="flex flex-wrap gap-2 mb-4 items-center">
                        <span className="text-primary">user@portfolio:~$</span>
                        <span className="text-white">cat ./current_status.txt</span>
                    </div>

                    <div className="mb-8 text-gray-400 space-y-1 font-mono text-sm">
                        <p>Location: <span className="text-[#f6f6f4]">Remote (Globally) and On-Site (Karachi, PK)</span></p>
                        <p>Availability: <span className="text-primary">Open to Work</span></p>
                        <p>Focus: <span className="text-[#f6f6f4]">Kubernetes, Ansible, AWS, Terraform, Grafana, Podman, OPNsense</span></p>
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



        </div>
    );
};

export default Home;
