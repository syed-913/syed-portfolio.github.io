
import React from 'react';
import { BlogCard } from '../components/ui/BlogCard';

const Blog: React.FC = () => {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full max-w-4xl mb-12 animate-fade-in-up">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center flex-wrap gap-2 text-lg md:text-xl font-mono">
                        <span className="text-primary">[root@portfolio ~]#</span>
                        <span className="text-white typing-effect">ls -l ./journals</span>
                        <span className="w-2.5 h-5 bg-primary animate-cursor-blink"></span>
                    </div>
                    <div className="pl-4 border-l-2 border-surface-border text-gray-500 font-mono text-sm">
                        <p>total 24K</p>
                        <p>drwxr-xr-x 2 root root 4.0K Nov 20 10:00 .</p>
                        <p>drwxr-xr-x 5 root root 4.0K Nov 18 14:22 ..</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl grid gap-6 pb-20">

                <BlogCard
                    title="Hardening SSH Configuration"
                    excerpt="Implementing best practices for SSH security including key-based authentication, disabling root login, implementing Fail2Ban, and MFA integration for critical infrastructure access points."
                    date="2023-11-20"
                    readTime="8 min"
                    slug="hardening-ssh-config"
                    delay={100}
                />

                <BlogCard
                    title="Kubernetes Cluster Autoscaling"
                    excerpt="A comprehensive guide to setting up Horizontal Pod Autoscaler (HPA) and Cluster Autoscaler on AWS EKS. Strategies for optimizing cost versus performance during traffic spikes."
                    date="2023-11-02"
                    readTime="12 min"
                    slug="k8s-autoscaling"
                    delay={200}
                />

                <BlogCard
                    title="Log Aggregation with ELK Stack"
                    excerpt="Centralizing system logs from multiple nodes using Elasticsearch, Logstash, and Kibana. Creating meaningful dashboards for real-time monitoring of distributed system health."
                    date="2023-10-25"
                    readTime="15 min"
                    slug="elk-stack-logging"
                    delay={300}
                />

                <BlogCard
                    title="Automating Backups with Ansible"
                    excerpt="Replacing manual cron jobs with idempotent Ansible playbooks for database and filesystem backups. Includes integration with S3 for offsite storage and rotation policies."
                    date="2023-10-10"
                    readTime="6 min"
                    slug="ansible-backups"
                    delay={400}
                />

            </div>
        </div>
    );
};

export default Blog;
