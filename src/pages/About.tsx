
import React from 'react';
import { TerminalWindow } from '../components/ui/TerminalWindow';

const About: React.FC = () => {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full mb-12 animate-fade-in-up">
                <h1 className="font-mono text-xl md:text-3xl font-bold text-white tracking-tight mb-2">
                    <span className="text-primary mr-2">$</span>
                    <span className="typing-effect">cat /etc/sysadmin/bio</span>
                </h1>
                <p className="font-mono text-gray-500 text-sm md:text-base border-l-2 border-primary/30 pl-4 mt-4">
                    Reading system profile configuration... Done.<br />
                    Displaying administrator details and installed kernel modules.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">

                {/* Left Column: Profile Config */}
                <div className="h-full animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <TerminalWindow header="/etc/sysadmin/profile.conf" className="h-full">
                        <div className="flex gap-2 mb-4">
                            <span className="text-primary">root@portfolio:~/etc$</span>
                            <span className="text-white">cat profile.conf</span>
                        </div>

                        <div className="mb-6 pl-2 text-gray-300 leading-relaxed whitespace-pre overflow-x-auto font-mono text-xs md:text-sm">
                            <span className="text-gray-500"># System Identity Configuration</span><br />
                            <span className="text-blue-400">NAME</span>="<span className="text-green-400">Syed Ammar Hussain</span>"<br />
                            <span className="text-blue-400">ROLE</span>="<span className="text-green-400">SysAdmin & Engineer</span>"<br />
                            <span className="text-blue-400">LOCATION</span>="<span className="text-green-400">Karachi</span>"<br />
                            <span className="text-blue-400">SHELL</span>="<span className="text-green-400">/bin/zsh</span>"<br />
                            <br />
                            <span className="text-gray-500"># Metrics & Status</span><br />
                            <span className="text-blue-400">UPTIME</span>="<span className="text-green-400">1 Years of Experience</span>"<br />
                            <span className="text-blue-400">CAFFEINE_LEVEL</span>="<span className="text-green-400">Critical</span>"<br />
                            <span className="text-blue-400">SLEEP_SCHEDULE</span>="<span className="text-green-400">Daemonized</span>"
                        </div>

                        <div className="mb-2 text-gray-400 text-xs md:text-sm border-l-2 border-surface-border pl-4">
                            <h3 className="text-white font-bold mb-1">Status Report</h3>
                            <p>I engineer automated Linux (RHEL) and AWS cloud environments using Python to build scalable, resilient infrastructure. By integrating AI-driven insights with ISO 27001 and NIST security standards, I bridge the gap between system administration and proactive, compliant operations.</p>
                        </div>
                    </TerminalWindow>
                </div>

                {/* Right Column: Skills / APT List */}
                <div className="h-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <TerminalWindow header="root@portfolio: ~" className="h-full">
                        <div className="flex gap-2 mb-4">
                            <span className="text-primary">root@portfolio:~#</span>
                            <span className="text-white">apt list --installed | grep "essential"</span>
                        </div>

                        <div className="mb-6 text-gray-300 leading-tight whitespace-pre overflow-x-auto code-block font-mono text-xs md:text-sm">
                            <span className="text-gray-500">Listing... Done</span><br />
                            <span className="text-gray-500"># Containerization & Orchestration</span><br />
                            <span className="text-green-400">docker-ce</span>/stable 5:24.0.5 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">kubernetes-cli</span>/stable 1.28.2 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">helm</span>/stable 3.12.0 <span className="text-gray-500">[installed]</span><br />
                            <br />
                            <span className="text-gray-500"># Infrastructure as Code</span><br />
                            <span className="text-green-400">ansible</span>/ppa 8.4.0 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">terraform</span>/stable 1.5.7 <span className="text-gray-500">[installed]</span><br />
                            <br />
                            <span className="text-gray-500"># Web Servers & Load Balancers</span><br />
                            <span className="text-green-400">nginx</span>/stable 1.18.0 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">traefik</span>/v2 2.10.4 <span className="text-gray-500">[installed]</span><br />
                            <br />
                            <span className="text-gray-500"># Monitoring & Observability</span><br />
                            <span className="text-green-400">grafana</span>/stable 10.1.5 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">prometheus</span>/stable 2.47.0 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">node-exporter</span>/stable 1.6.1 <span className="text-gray-500">[installed]</span><br />
                            <br />
                            <span className="text-gray-500"># Scripting</span><br />
                            <span className="text-green-400">python3</span>/focal 3.8.10 <span className="text-gray-500">[installed]</span><br />
                            <span className="text-green-400">bash</span>/focal 5.0.17 <span className="text-gray-500">[installed]</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <span className="text-green-400 font-bold">➜</span>
                                <span className="text-gray-400">45 packages listed. System is ready for deployment.</span>
                            </div>
                        </div>
                    </TerminalWindow>
                </div>

            </div>
        </div>
    );
};

export default About;
