import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { DataEmpty, DataLoading } from '../components/ui/DataState';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicProjects } from '../services/db';
import type { Project } from '../types/database';

const hasCaseStudy = (project: Project) => Boolean(
  project.problem || project.built || project.decisions?.length || project.outcome || project.learnings || project.output,
);

const Projects = () => {
  const { settings } = useSiteSettings();
  const reduce = useReducedMotion();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    getPublicProjects().then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title={`Work — ${settings.shortName}`} description={settings.workIntro} path="/projects" />
      <PageIntro eyebrow={settings.ui.projectsIntroEyebrow} title={settings.workTitle} intro={settings.workIntro} />
      <section className="content-section project-index">
        {loading ? <DataLoading label="Loading selected work…" variant="list" /> : projects.map((project, index) => {
          const key = project.id ?? project.name;
          const expanded = open === key;
          const storyAvailable = hasCaseStudy(project);
          return (
            <Reveal key={key} delay={index * 0.05}>
              <article className={`project-index-item ${expanded ? 'is-expanded' : ''}`}>
                <div className="project-index-top">
                  <span className="project-index-number">0{index + 1}</span>
                  <div className="project-index-main">
                    <p className="micro-label">{project.command || 'project'}</p>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    {!!project.stack?.length && (
                      <div className="project-stack-row project-index-stack">
                        {project.stack.slice(0, 7).map((tool) => <span key={tool}>{tool}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="project-index-actions">
                    {project.url && <a href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`}><ArrowUpRight size={20} /></a>}
                    {storyAvailable && (
                      <button
                        className="project-story-toggle"
                        onClick={() => setOpen(expanded ? null : key)}
                        aria-label={`${expanded ? 'Close' : 'Open'} ${project.name} case study`}
                        aria-expanded={expanded}
                      >
                        <ChevronDown size={20} />
                      </button>
                    )}
                  </div>
                </div>

                {storyAvailable && (
                  <button className="project-story-text-toggle" onClick={() => setOpen(expanded ? null : key)} aria-expanded={expanded}>
                    <span>{expanded ? 'Close case study' : settings.ui.projectStoryCta}</span>
                    <ChevronDown size={15} />
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {expanded && storyAvailable && (
                    <motion.div
                      className="project-case-wrap"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={reduce ? undefined : { height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="project-case-grid">
                        {project.problem && (
                          <section className="project-case-block">
                            <span>01</span><p>{settings.ui.projectProblemLabel}</p><h3>{project.problem}</h3>
                          </section>
                        )}
                        {project.built && (
                          <section className="project-case-block">
                            <span>02</span><p>{settings.ui.projectBuiltLabel}</p><h3>{project.built}</h3>
                          </section>
                        )}
                        {!!project.decisions?.length && (
                          <section className="project-case-block project-case-decisions">
                            <span>03</span><p>{settings.ui.projectDecisionsLabel}</p>
                            <ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
                          </section>
                        )}
                        {project.outcome && (
                          <section className="project-case-block project-case-outcome">
                            <span>04</span><p>{settings.ui.projectOutcomeLabel}</p><h3>{project.outcome}</h3>
                          </section>
                        )}
                        {project.learnings && (
                          <section className="project-case-block">
                            <span>05</span><p>{settings.ui.projectLearningsLabel}</p><h3>{project.learnings}</h3>
                          </section>
                        )}
                      </div>
                      {project.output && (
                        <div className="project-detail">
                          <p className="micro-label">Technical trace</p>
                          <div dangerouslySetInnerHTML={{ __html: project.output }} />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            </Reveal>
          );
        })}
        {!loading && !projects.length && <DataEmpty title={settings.ui.projectsEmptyTitle} body={settings.ui.projectsEmptyBody} />}
      </section>
    </>
  );
};

export default Projects;
