import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicProjects } from '../services/db';
import type { Project } from '../types/database';

const Projects = () => {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { getPublicProjects().then(setProjects).catch(() => setProjects([])); }, []);

  return (
    <>
      <SEO title={`Work — ${settings.shortName}`} description={settings.workIntro} path="/projects" />
      <PageIntro eyebrow={settings.ui.projectsIntroEyebrow} title={settings.workTitle} intro={settings.workIntro} />
      <section className="content-section project-index">
        {projects.map((project, index) => {
          const key = project.id ?? project.name;
          const expanded = open === key;
          return (
            <Reveal key={key} delay={index * 0.05}>
              <article className="project-index-item">
                <div className="project-index-top">
                  <span className="project-index-number">0{index + 1}</span>
                  <div className="project-index-main">
                    <p className="micro-label">{project.command || 'project'}</p>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                  </div>
                  <div className="project-index-actions">
                    <a href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}><ArrowUpRight size={20} /></a>
                    {project.output && <button onClick={() => setOpen(expanded ? null : key)} aria-label="Toggle technical detail">{expanded ? <ChevronUp /> : <ChevronDown />}</button>}
                  </div>
                </div>
                {expanded && project.output && (
                  <div className="project-detail" dangerouslySetInnerHTML={{ __html: project.output }} />
                )}
              </article>
            </Reveal>
          );
        })}
        {!projects.length && <div className="empty-state-card"><h3>{settings.ui.projectsEmptyTitle}</h3><p>{settings.ui.projectsEmptyBody}</p></div>}
      </section>
    </>
  );
};
export default Projects;
