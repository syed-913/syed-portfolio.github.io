
import React, { useEffect, useState } from 'react';
import { ProjectCard } from '../components/ui/ProjectCard';
import { getPublicProjects } from '../services/db';
import type { Project } from '../types/database';

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getPublicProjects();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                startLoadingSequence();
            }
        };

        fetchProjects();
    }, []);

    const startLoadingSequence = () => {
        // Minimum loading time for the "terminal feel"
        setTimeout(() => setLoading(false), 800);
    };

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] w-full">
            {/* Page Header */}
            <div className="w-full mb-12 animate-fade-in-up">
                <h1 className="font-mono text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
                    <span className="text-primary mr-2">$</span>
                    <span className="typing-effect">./view_projects.sh</span>
                </h1>
                <p className="font-mono text-gray-500 text-sm md:text-base border-l-2 border-primary/30 pl-4 mt-4">
                    {loading ? (
                        <span className="animate-pulse">Connecting to repository...</span>
                    ) : (
                        <>
                            Loading project data... Done.<br />
                            Found {projects.length} active projects.
                        </>
                    )}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full pb-20">
                {projects.map((project, index) => (
                    <ProjectCard
                        key={project.id || index}
                        name={project.name}
                        command={project.command}
                        description={project.description}
                        url={project.url}
                        output={<div dangerouslySetInnerHTML={{ __html: project.output }} />}
                        delay={100 * (index + 1)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Projects;
