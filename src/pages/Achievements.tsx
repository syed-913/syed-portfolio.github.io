
import React from 'react';
import { AchievementCard } from '../components/ui/AchievementCard';

const Achievements: React.FC = () => {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full mb-10 flex flex-col md:flex-row md:items-end gap-2 md:gap-4 border-b border-white/5 pb-6 animate-fade-in-up">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-mono">
                    <span className="text-primary mr-3">&gt;</span>
                    <span className="typing-effect">ls ./achievements --list</span>
                </h1>
                <span className="font-mono text-xs text-gray-500 mb-1.5 hidden md:inline-block">Found 6 items</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-20">

                <AchievementCard
                    id="RH-120-430"
                    title="Red Hat Certified Engineer"
                    description="Advanced automation & system management."
                    status="VALIDATED"
                    icon="verified"
                    permissions="-rw-r--r--"
                    owner="root:root"
                    size="4KB"
                    details={{
                        issued_by: "Red Hat",
                        date: "2023-10-12",
                        exp: "2026-10-12"
                    }}
                    delay={100}
                />

                <AchievementCard
                    id="CKA-9921"
                    title="Kubernetes Administrator"
                    description="Cluster architecture & troubleshooting."
                    status="VALIDATED"
                    icon="anchor"
                    permissions="-rw-r--r--"
                    owner="k8s:admin"
                    size="8KB"
                    details={{
                        issued_by: "CNCF",
                        score: 98.5,
                        version: "v1.28"
                    }}
                    delay={200}
                />

                <AchievementCard
                    id="AWS-SAA-03"
                    title="AWS Solutions Architect"
                    description="Designing resilient cloud systems."
                    status="ACTIVE"
                    icon="cloud"
                    permissions="-rw-r--r--"
                    owner="aws:user"
                    size="2KB"
                    details={{
                        provider: "Amazon Web Services",
                        level: "Associate",
                        badges: ["SAA", "IAM"].join(", ")
                    }}
                    delay={300}
                />

                <AchievementCard
                    id="COMP-SEC-22"
                    title="CompTIA Security+"
                    description="Infrastructure security & encryption."
                    status="RENEWED"
                    icon="security"
                    permissions="-r--------"
                    owner="sec:audit"
                    size="6KB"
                    details={{
                        issued_by: "CompTIA",
                        compliance: true,
                        standard: "ISO-17024"
                    }}
                    delay={400}
                />

                <AchievementCard
                    id="HASHI-003"
                    title="HashiCorp Terraform"
                    description="Infrastructure as Code mastery."
                    status="VALIDATED"
                    icon="deployed_code"
                    permissions="-rw-r--r--"
                    owner="tf:iac"
                    size="3KB"
                    details={{
                        issued_by: "HashiCorp",
                        modules: "500+",
                        type: "Associate"
                    }}
                    delay={500}
                />

                <AchievementCard
                    id="CSCO-1102"
                    title="Cisco Certified Network Associate"
                    description="Fundamentals of network engineering."
                    status="ARCHIVED"
                    icon="router"
                    permissions="-rw-r--r--"
                    owner="net:ccna"
                    size="5KB"
                    details={{
                        issued_by: "Cisco",
                        valid_until: "2022-01-01",
                        legacy: true
                    }}
                    delay={600}
                />

            </div>
        </div>
    );
};

export default Achievements;
