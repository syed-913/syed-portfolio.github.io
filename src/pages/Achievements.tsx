
import React, { useEffect, useState } from 'react';
import { AchievementCard } from '../components/ui/AchievementCard';
import { getCertificates } from '../services/db';
import type { Certificate } from '../types/database';

const Achievements: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const data = await getCertificates();
                setCertificates(data);
            } catch (error) {
                console.error("Failed to fetch certificates:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchCertificates();
    }, []);

    const resolvePublicPath = (path: string): string => {
        const base = import.meta.env.BASE_URL ?? '/';
        const cleaned = path.replace(/^\/public/, '').replace(/^\//, '');
        const withoutBase = cleaned.startsWith(base.replace(/^\//, ''))
            ? cleaned.slice(base.replace(/^\//, '').length).replace(/^\//, '')
            : cleaned;
        return `${base.endsWith('/') ? base : base + '/'}${withoutBase}`;
    };

    const handleViewCertificate = (url?: string) => {
        if (url) {
            window.open(resolvePublicPath(url), '_blank');
        } else {
            console.warn("No image URL provided for certificate");
        }
    };

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">

            {/* Page Header */}
            <div className="w-full mb-10 flex flex-col md:flex-row md:items-end gap-2 md:gap-4 border-b border-white/5 pb-6 animate-fade-in-up">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-mono">
                    <span className="text-primary mr-3">&gt;</span>
                    <span className="typing-effect">ls ./achievements --list</span>
                </h1>
                <span className="font-mono text-xs text-gray-500 mb-1.5 hidden md:inline-block">
                    {loading ? "Scanning..." : `Found ${certificates.length} items`}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-20">
                {certificates.map((cert, index) => (
                    <AchievementCard
                        key={cert.id || index}
                        id={cert.id || `CERT-${1000 + index}`}
                        title={cert.name}
                        description={`Issued by ${cert.issuer}`}
                        status="VALIDATED"
                        icon="verified"
                        permissions="-rw-r--r--"
                        owner="root:root"
                        size="4KB"
                        issuerLogo={cert.issuerLogo}
                        credentialId={cert.credentialId || `CERT-${1000 + index}`}
                        details={{
                            date: cert.date,
                            valid: true,
                            ...(cert.category ? { category: cert.category } : {}),
                            ...(cert.details ? (() => { try { return JSON.parse(cert.details); } catch (e) { return {} } })() : {})
                        }}
                        delay={100 * (index + 1)}
                        onView={cert.imageUrl ? () => handleViewCertificate(cert.imageUrl!.replace('/public', '')) : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default Achievements;
