
import React, { useEffect, useState } from 'react';
import { LogEntry } from '../components/ui/LogEntry';
import { getExperience } from '../services/db';
import type { Experience as ExperienceType } from '../types/database';

const Experience: React.FC = () => {
    const [experiences, setExperiences] = useState<ExperienceType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperience = async () => {
            try {
                const data = await getExperience();
                setExperiences(data);
            } catch (error) {
                console.error("Failed to fetch experience:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchExperience();
    }, []);

    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto">

            {/* Page Header */}
            <div className="mb-12 animate-fade-in-up">
                <div className="flex items-center gap-2 text-lg md:text-xl font-bold font-mono">
                    <span className="text-primary">[root@portfolio ~]#</span>
                    <span className="text-white typing-effect">ls -la /var/log/experience/</span>
                    <span className="w-2.5 h-5 bg-primary animate-cursor-blink ml-1"></span>
                </div>
                <div className="text-gray-500 text-sm mt-2 font-mono">
                    {loading ? "Reading directory..." : `# Listing directory contents: ${experiences.length} entries found...`}
                </div>
            </div>

            <div className="space-y-12 pb-20">
                {experiences.map((exp, index) => (
                    <LogEntry
                        key={exp.id || index}
                        title={exp.role}
                        company={exp.company}
                        date={exp.duration}
                        path={`/var/log/exp/${exp.company.toLowerCase().replace(/\s+/g, '-')}`}
                        description={exp.description[0] || "Experience detail"}
                        logs={exp.description.map(desc => ({ status: 'OK', message: desc }))}
                        delay={100 * (index + 1)}
                    />
                ))}

                {!loading && (
                    <div className="mt-16 text-center text-gray-600 font-mono text-sm">
                        <span className="text-secondary">~</span> (END)
                    </div>
                )}
            </div>
        </div>
    );
};

export default Experience;
