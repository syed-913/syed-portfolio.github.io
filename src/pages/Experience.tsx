
import React from 'react';
import { LogEntry } from '../components/ui/LogEntry';

const Experience: React.FC = () => {
    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto">

            {/* Page Header */}
            <div className="mb-12 animate-fade-in-up">
                <div className="flex items-center gap-2 text-lg md:text-xl font-bold font-mono">
                    <span className="text-primary">[root@portfolio ~]#</span>
                    <span className="text-white typing-effect">ls -la /var/log/experience/</span>
                    <span className="w-2.5 h-5 bg-primary animate-cursor-blink ml-1"></span>
                </div>
                <div className="text-gray-500 text-sm mt-2 font-mono"># Listing directory contents: 4 entries found...</div>
            </div>

            <div className="space-y-12 pb-20">
                <LogEntry
                    title="Senior DevOps Engineer"
                    company="srv-cloud-tech"
                    date="Jan 2021 - Present"
                    path="/var/log/exp/srv-cloud-tech"
                    description="Lead engineer focused on modernizing cloud infrastructure and automating deployment workflows. Responsible for maintaining high availability across distributed systems and implementing container orchestration strategies."
                    logs={[
                        { status: 'OK', message: 'Architected multi-region AWS infrastructure reducing latency by 40%.' },
                        { status: 'OK', message: 'Implemented Kubernetes clusters (EKS) managing 50+ microservices.' },
                        { status: 'OK', message: 'Automated CI/CD pipelines using Jenkins & GitLab CI, cutting deployment time by 60%.' }
                    ]}
                    delay={100}
                />

                <LogEntry
                    title="Linux System Administrator"
                    company="node-fin-sys"
                    date="Mar 2018 - Dec 2020"
                    path="/var/log/exp/node-fin-sys"
                    description="Managed large-scale enterprise server environments with strict security compliance requirements. Focused on system hardening, configuration management, and zero-downtime migrations."
                    logs={[
                        { status: 'OK', message: 'Managed 500+ RHEL/CentOS servers in a high-compliance financial environment.' },
                        { status: 'OK', message: 'Hardened system security using SELinux, resulting in zero critical breaches.' },
                        { status: 'OK', message: 'Developed Ansible playbooks for automated patching and configuration management.' },
                        { status: 'WARN', message: 'Legacy system migration completed successfully.' }
                    ]}
                    delay={200}
                />

                <LogEntry
                    title="Junior Network Engineer"
                    company="host-start-up"
                    date="Jun 2016 - Feb 2018"
                    path="/var/log/exp/host-start-up"
                    description="Supported network infrastructure operations and datacenter expansion. Specialized in monitoring solutions and hardware configuration for optimal routing performance."
                    logs={[
                        { status: 'OK', message: 'Configured Cisco routers and switches for optimal internal network performance.' },
                        { status: 'OK', message: 'Monitored network traffic using Nagios and Zabbix, resolving outages within SLA.' },
                        { status: 'OK', message: 'Assisted in the physical setup of a new 50-rack datacenter facility.' }
                    ]}
                    delay={300}
                />

                <LogEntry
                    title="B.S. Computer Science"
                    company="uni-tech-inst"
                    date="2012 - 2016"
                    path="/var/log/exp/uni-tech-inst"
                    description="Undergraduate studies with a focus on core computer science principles and distributed systems architecture."
                    logs={[
                        { status: 'OK', message: 'Graduated with Honors.' },
                        { status: 'OK', message: 'Focus: Distributed Systems & Network Security.' }
                    ]}
                    delay={400}
                />

                <div className="mt-16 text-center text-gray-600 font-mono text-sm">
                    <span className="text-secondary">~</span> (END)
                </div>

            </div>
        </div>
    );
};

export default Experience;
