
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Project, Certificate, Experience } from '../types/database';

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // --- Projects ---
    const projects: Project[] = [
        {
            name: "ums",
            repoPath: "~/repos/User-Management-Script",
            command: "tree .",
            description: "A comprehensive Bash suite for automating user provisioning on RHEL/CentOS fleets. Handles group assignments, SSH key rotation, and audit logging compliance.",
            url: "https://github.com/sysadmin/User-Management-Script.git",
            output: `.<br />
├── <span className="text-blue-400 font-bold">bin/</span><br />
│   ├── <span className="text-green-400">create_user.sh</span><br />
│   ├── <span className="text-green-400">delete_user.sh</span><br />
│   └── <span className="text-green-400">audit_access.sh</span><br />
├── <span className="text-blue-400 font-bold">config/</span><br />
│   └── groups.conf<br />
├── <span className="text-blue-400 font-bold">logs/</span><br />
├── LICENSE<br />
└── README.md`,
            visible: true,
            order: 1
        },
        {
            name: "fs-audit",
            repoPath: "~/repos/FileSystem-Audit-Data-Pipeline",
            command: "cat architecture_diagram.txt",
            description: "Real-time integrity monitoring pipeline. Captures kernel-level syscalls via Auditd, normalizes logs with Fluentd, and visualizes security events in Kibana.",
            url: "https://github.com/sysadmin/FileSystem-Audit-Data-Pipeline.git",
            output: `<div className="text-blue-300 select-all">
+----------+      +-----------+      +----------+<br />
|  AuditD  | ---> |  Fluentd  | ---> | Elastic  |<br />
| (Kernel) | JSON | (Aggreg.) | HTTPS| (Search) |<br />
+----------+      +-----------+      +----------+<br />
^                  |                  ^<br />
|                  v                  |<br />
[ FileSys ]         [ Buffer ]        [ Kibana ]
</div>`,
            visible: true,
            order: 2
        }
    ];

    projects.forEach((proj) => {
        const ref = doc(collection(db, 'projects'));
        batch.set(ref, proj);
    });

    // --- Experience ---
    const experience: Experience[] = [
        {
            role: "Senior System Administrator",
            company: "TechCorp Inc.",
            duration: "2023 - Present",
            description: [
                "Managed a fleet of 500+ RHEL servers.",
                "Automated patching with Ansible.",
                "Reduced downtime by 40%."
            ],
            techStack: ["Linux", "Ansible", "AWS", "Python"],
            visible: true,
            order: 1
        },
        {
            role: "Junior DevOps Engineer",
            company: "StartupXYZ",
            duration: "2021 - 2023",
            description: [
                "Built CI/CD pipelines with Jenkins.",
                "Containerized applications using Docker."
            ],
            techStack: ["Jenkins", "Docker", "Bash", "Git"],
            visible: true,
            order: 2
        }
    ];

    experience.forEach((exp) => {
        const ref = doc(collection(db, 'experience'));
        batch.set(ref, exp);
    });

    // --- Certificates ---
    const certificates: Certificate[] = [
        {
            name: "Red Hat Certified System Administrator (RHCSA)",
            issuer: "Red Hat",
            date: "2024",
            imageUrl: "", // Placeholder
            visible: true,
            order: 1
        },
        {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2023",
            imageUrl: "", // Placeholder
            visible: true,
            order: 2
        }
    ];

    certificates.forEach((cert) => {
        const ref = doc(collection(db, 'certificates'));
        batch.set(ref, cert);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
};
