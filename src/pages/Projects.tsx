
import React from 'react';
import { ProjectCard } from '../components/ui/ProjectCard';

const Projects: React.FC = () => {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full mb-12 animate-fade-in-up">
                <h1 className="font-mono text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    <span className="text-primary mr-2">$</span>
                    <span className="typing-effect">./view_projects.sh</span>
                </h1>
                <p className="font-mono text-gray-500 text-sm md:text-base border-l-2 border-primary/30 pl-4 mt-4">
                    Loading repository data... Done.<br />
                    Found 2 public repositories matching criteria: "featured".
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full pb-20">

                <ProjectCard
                    name="ums"
                    repoPath="~/repos/User-Management-Script"
                    command="tree ."
                    description="A comprehensive Bash suite for automating user provisioning on RHEL/CentOS fleets. Handles group assignments, SSH key rotation, and audit logging compliance."
                    url="https://github.com/sysadmin/User-Management-Script.git"
                    output={
                        <>
                            .<br />
                            ├── <span className="text-blue-400 font-bold">bin/</span><br />
                            │   ├── <span className="text-green-400">create_user.sh</span><br />
                            │   ├── <span className="text-green-400">delete_user.sh</span><br />
                            │   └── <span className="text-green-400">audit_access.sh</span><br />
                            ├── <span className="text-blue-400 font-bold">config/</span><br />
                            │   └── groups.conf<br />
                            ├── <span className="text-blue-400 font-bold">logs/</span><br />
                            ├── LICENSE<br />
                            └── README.md
                        </>
                    }
                    delay={100}
                />

                <ProjectCard
                    name="fs-audit"
                    repoPath="~/repos/FileSystem-Audit-Data-Pipeline"
                    command="cat architecture_diagram.txt"
                    description="Real-time integrity monitoring pipeline. Captures kernel-level syscalls via Auditd, normalizes logs with Fluentd, and visualizes security events in Kibana."
                    url="https://github.com/sysadmin/FileSystem-Audit-Data-Pipeline.git"
                    output={
                        <div className="text-blue-300 select-all">
                            +----------+      +-----------+      +----------+<br />
                            |  AuditD  | ---&gt; |  Fluentd  | ---&gt; | Elastic  |<br />
                            | (Kernel) | JSON | (Aggreg.) | HTTPS| (Search) |<br />
                            +----------+      +-----------+      +----------+<br />
                            ^                  |                  ^<br />
                            |                  v                  |<br />
                            [ FileSys ]         [ Buffer ]        [ Kibana ]
                        </div>
                    }
                    delay={200}
                />

            </div>
        </div>
    );
};

export default Projects;
