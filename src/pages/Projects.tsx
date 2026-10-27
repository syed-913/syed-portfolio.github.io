import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronDown, Terminal } from "lucide-react";
import { CopyButton } from "../components/ui/CopyButton";
import { SEO } from "../components/features/SEO";
import { PageIntro } from "../components/ui/PageIntro";
import { DataEmpty, DataError, DataLoading } from "../components/ui/DataState";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePublicData } from "../hooks/usePublicData";
import { getPublicProjects } from "../services/db";
import { SafeProjectHtml } from "../components/ui/SafeProjectHtml";

export default function Projects() {
  const { settings } = useSiteSettings();
  const { items, loading, error, retry } = usePublicData(getPublicProjects, 'projects');
  const { hash } = useLocation();
  const [selection, setSelection] = useState<{
    hash: string;
    id: string | null;
  } | null>(null);
  let hashId = "";
  try {
    hashId = decodeURIComponent(hash.slice(1));
  } catch {
    hashId = hash.slice(1);
  }
  const open = selection?.hash === hash ? selection.id : hashId || null;
  useEffect(() => {
    if (!loading && hash) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(hashId)?.scrollIntoView({ block: "start" }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [hash, hashId, loading]);
  return (
    <>
      <SEO
        title={`Projects — ${settings.shortName}`}
        description={settings.workIntro}
        path="/projects"
      />
      <PageIntro title={settings.workTitle} intro={settings.workIntro} />
      <section
        className="content-section project-index"
        aria-label="Project case studies"
      >
        {loading ? (
          <DataLoading label="Loading projects…" variant="list" />
        ) : error ? (
          <DataError retry={retry} />
        ) : (
          items.map((project) => {
            const id = project.id ?? project.name;
            const expanded = open === id;
            const hasStory = !!(
              project.problem ||
              project.built ||
              project.decisions?.length ||
              project.outcome ||
              project.learnings ||
              project.output
            );
            return (
              <article
                id={id}
                key={id}
                className={`project-index-item ${expanded ? "is-expanded" : ""}`}
              >
                <div className="project-index-top">
                  <div className="project-index-main">
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    {!!project.stack?.length && <div className="tag-row">
                      {project.stack?.map((tool) => (
                        <span key={tool}>{tool}</span>
                      ))}
                    </div>}
                  </div>
                  <div className="project-index-actions">
                    {project.command && <div className="project-command">
                      <div className="project-command-head"><span><Terminal size={15} />Command</span><CopyButton text={project.command} label="Copy command" /></div>
                      <pre><span aria-hidden="true">$ </span><code>{project.command}</code></pre>
                    </div>}
                    {project.url && (
                      <a
                        className="text-link"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View repository
                        <ArrowUpRight size={20} />
                      </a>
                    )}
                  </div>
                </div>
                {hasStory && (
                  <>
                    <button
                      className="project-story-toggle"
                      onClick={() =>
                        setSelection({ hash, id: expanded ? null : id })
                      }
                      aria-expanded={expanded}
                      aria-controls={`case-${id}`}
                    >
                      <span>{expanded ? "Close case study" : "Explore case study"}</span>
                      <ChevronDown size={18} />
                    </button>
                    <div
                      id={`case-${id}`}
                      className={`project-case-wrap ${expanded ? "is-open" : ""}`}
                      aria-hidden={!expanded}
                      inert={!expanded}
                    >
                    <div className="project-case-inner"><div className="project-case-content">
                      <div className="project-case-grid">
                        {[
                          [settings.ui.projectProblemLabel, project.problem],
                          [settings.ui.projectBuiltLabel, project.built],
                        ].map(
                          ([label, text]) =>
                            text && (
                              <section
                                className="project-case-block"
                                key={label}
                              >
                                <h3>{label}</h3>
                                <p>{text}</p>
                              </section>
                            ),
                        )}
                        {!!project.decisions?.length && (
                          <section className="project-case-block">
                            <h3>{settings.ui.projectDecisionsLabel}</h3>
                            <ul>
                              {project.decisions.map((decision) => (
                                <li key={decision}>{decision}</li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {[
                          [settings.ui.projectOutcomeLabel, project.outcome],
                          [
                            settings.ui.projectLearningsLabel,
                            project.learnings,
                          ],
                        ].map(
                          ([label, text]) =>
                            text && (
                              <section
                                className="project-case-block"
                                key={label}
                              >
                                <h3>{label}</h3>
                                <p>{text}</p>
                              </section>
                            ),
                        )}
                      </div>
                      {project.output && (
                        <section className="project-detail">
                          <h3>Technical trace</h3>
                          <SafeProjectHtml html={project.output} />
                        </section>
                      )}
                    </div></div>
                    </div>
                  </>
                )}
              </article>
            );
          })
        )}
        {!loading && !error && !items.length && (
          <DataEmpty
            title={settings.ui.projectsEmptyTitle}
            body={settings.ui.projectsEmptyBody}
          />
        )}
      </section>
    </>
  );
}
