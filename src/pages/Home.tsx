import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  FlaskConical,
  MapPin,
} from "lucide-react";
import { SEO } from "../components/features/SEO";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { scheduleAfterPaint } from "../lib/idle";
import { InlineCopy, InlineCopyLines } from "../components/ui/InlineCopy";
import type { Certificate, Experience, Project } from "../types/database";

import { consoleWorkflow as stages } from "../data/consoleWorkflow";
import { normalizeHeroCanvas, publicCanvasScenes } from "../lib/heroCanvas";
const HeroProjectCanvas = lazy(() => import("../components/features/HeroProjectCanvas"));

function WorkflowGlyph({ stage }: { stage: string }) {
  return (
    <span
      className={`workflow-glyph glyph-${stage.toLowerCase()}`}
      aria-hidden="true"
    >
      {stage === "Validate" ? (
        <span className="glyph-checklist">
          {[0, 1, 2].map((row) => (
            <span key={row}>
              <Check size={20} strokeWidth={1.4} />
              <i />
            </span>
          ))}
        </span>
      ) : (
        <>
          <span className="glyph-page">
            <span className="glyph-fold" />
            <span className="glyph-lines">
              <i />
              <i />
              <i />
              <i />
            </span>
          </span>
          {stage === "Commit" && (
            <span className="glyph-approval">
              <Check size={28} strokeWidth={1.3} />
            </span>
          )}
          {stage === "Audit" && <span className="glyph-search" />}
        </>
      )}
    </span>
  );
}
export default function Home() {
  const { settings } = useSiteSettings();
  const customCanvas = useMemo(() => normalizeHeroCanvas(settings.heroCanvas), [settings.heroCanvas]);
  const [data, setData] = useState<{
    projects: Project[];
    certificates: Certificate[];
    experience: Experience[];
  }>({ projects: [], certificates: [], experience: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stage, setStage] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const cancel = scheduleAfterPaint(() => {
      import("../services/db")
        .then(async (db) => {
          const results = await Promise.allSettled([
            db.getPublicProjects(),
            db.getPublicCertificates(),
            db.getPublicExperience(),
          ]);
          if (!active) return;
          setData({
            projects: results[0].status === "fulfilled" ? results[0].value : [],
            certificates:
              results[1].status === "fulfilled" ? results[1].value : [],
            experience:
              results[2].status === "fulfilled" ? results[2].value : [],
          });
          setError(results.some((r) => r.status === "rejected"));
        })
        .catch(() => active && setError(true))
        .finally(() => active && setLoading(false));
    });
    return () => {
      active = false;
      cancel();
    };
  }, []);
  const project =
    data.projects.find((p) => /user.management.console/i.test(p.name)) ??
    data.projects[0];
  const hasCustomCanvas = !!customCanvas && publicCanvasScenes(customCanvas, data.projects).length > 0;
  const isConsole = !!project && /user.management.console/i.test(project.name);
  const evidence = [
    {
      mark: "AWS",
      item: data.certificates.find((c) => /cloud practitioner/i.test(c.name)),
      label: "AWS Cloud Practitioner",
    },
    {
      mark: "ISC2",
      item: data.certificates.find((c) =>
        /certified in cybersecurity/i.test(c.name),
      ),
      label: "ISC2 Certified in Cybersecurity",
    },
    {
      mark: "GRC",
      item: data.certificates.find((c) => /27001.*lead auditor/i.test(c.name)),
      label: "ISO/IEC 27001\nLead Auditor",
    },
  ];
  return (
    <>
      <SEO
        title={settings.seo.title}
        description={settings.seo.description}
        path="/"
      />
      <div className="manual-opening">
        <aside className="index-rail" aria-hidden="true">
          <span>
            <b>01</b>
            <i>/ Profile</i>
          </span>
          <span>
            <b>02</b>
            <i>Selected work</i>
          </span>
          <span>
            <b>03</b>
            <i>Credentials</i>
          </span>
        </aside>
        <section className="manual-hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <InlineCopyLines lineClassName={index => index === 2 ? "accent" : undefined}>{settings.heroTitle}</InlineCopyLines>
          </h1>
          <p className="hero-introduction"><InlineCopy>{settings.heroBody}</InlineCopy></p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/projects">
              {settings.ui.homePrimaryCta}
              <ArrowUpRight size={21} />
            </Link>
            <Link className="button button-ghost" to="/experience">
              {settings.ui.homeSecondaryCta}
            </Link>
          </div>
          <picture>
            <source srcSet="/images/profile-portrait.webp" type="image/webp" />
            <img
              className="hero-portrait"
              src="/images/profile-portrait.png"
              width="1024"
              height="1024"
              alt="Syed Ammar Hussain in an emerald hoodie, black cap and glasses"
              fetchPriority="high"
            />
          </picture>
          <div className="hero-context">
            <strong>{settings.name}</strong>
            <span>
              <MapPin size={18} />
              {settings.location}
            </span>
            <span>
              <i className="status-dot" />
              {settings.availability}
            </span>
          </div>
          <div className={`project-specimen${hasCustomCanvas ? " has-custom-canvas" : ""}`} aria-label="Featured project">
            {loading ? (
              <div className="specimen-pending" role="status">
                Loading selected project…
              </div>
            ) : hasCustomCanvas && customCanvas ? (
              <Suspense fallback={<div className="specimen-pending" role="status">Loading project canvas…</div>}><HeroProjectCanvas config={customCanvas} projects={data.projects}/></Suspense>
            ) : project ? (
              <>
                <div className="specimen-heading">
                  <h2>01 / {project.name}</h2>
                  <span>Linux / Security / Automation</span>
                </div>
                {isConsole ? (
                  <>
                    <div className="workflow-stages">
                      {stages.map((s, i) => {
                        return (
                          <div className="workflow-stage" key={s.name}>
                            <button
                              type="button"
                              className={`stage-frame ${stage === i ? "is-selected" : ""}`}
                              aria-expanded={stage === i}
                              aria-controls="workflow-detail"
                              onClick={() => setStage(stage === i ? null : i)}
                            >
                              <span className="stage-number">0{i + 1}</span>
                              <strong>{s.name}</strong>
                              <WorkflowGlyph stage={s.name} />
                              <span
                                className="stage-affordance"
                                aria-hidden="true"
                              >
                                {stage === i ? (
                                  <Check size={15} />
                                ) : (
                                  <ArrowUpRight size={15} />
                                )}
                              </span>
                            </button>
                            <p>{s.caption}</p>
                            {i < 3 && (
                              <span
                                className="stage-connector"
                                aria-hidden="true"
                              >
                                <i />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="file-feeds" aria-hidden="true">
                      <i />
                      <i />
                    </div>
                    <div className="system-files">
                      <p>Account files (read / update)</p>
                      <div className="system-file-list">
                        {[
                          ["/etc/passwd", "User account information"],
                          ["/etc/shadow", "Password hashes and aging policy"],
                          ["/etc/{group,gshadow}", "Group access records"],
                        ].map(([name, description]) => (
                          <div className="system-file" key={name}>
                            <svg
                              className="system-file-icon"
                              width="30"
                              height="36"
                              viewBox="0 0 30 36"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.1"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M2 1.5H19.5L28.5 10.5V34.5H2Z M19.5 1.5V10.5H28.5" />
                              <path d="M7 13.5H14 M7 19.5H22 M7 25.5H22" />
                            </svg>
                            <div>
                              <strong>{name}</strong>
                              <span>{description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {stage !== null && (
                      <div
                        id="workflow-detail"
                        className="workflow-detail"
                        role="region"
                        aria-label={`${stages[stage].name} details`}
                      >
                        <strong>{stages[stage].name}</strong>
                        <p>{stages[stage].detail}</p>
                        <button
                          onClick={() => setStage(null)}
                          aria-label="Close stage details"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="specimen-description">{project.description}</p>
                )}
                <Link
                  className="specimen-cta"
                  to={`/projects#${project.id ?? "selected"}`}
                >
                  Explore the case study
                  <ArrowUpRight size={24} />
                </Link>
                <div className="specimen-focus">
                  <span>Project focus</span>
                  <p>Linux · Automation · Compliance</p>
                </div>
              </>
            ) : (
              <div className="specimen-pending">
                <h2>
                  {error
                    ? "Project content is unavailable."
                    : "Projects are being prepared."}
                </h2>
                <p>
                  {error
                    ? "Please reload to try again. You can also explore the repositories on GitHub."
                    : "Explore my repositories for more work."}
                </p>
                <a
                  className="text-link"
                  href={settings.socials.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explore GitHub
                  <ArrowUpRight size={18} />
                </a>
              </div>
            )}
          </div>
        </section>
        <div
          className="credential-strip"
          aria-label="Selected credentials and training"
        >
          {evidence
            .filter((e) => loading || e.item)
            .map((e) => (
              <Link
                key={e.mark}
                to="/credentials"
                className="credential-signal"
              >
                <span className="credential-mark">{e.mark}</span>
                <div>
                  <strong>{e.label}</strong>
                  <span>
                    {loading
                      ? "Loading…"
                      : e.item
                        ? e.mark === "GRC"
                          ? `${e.item.issuer} / ${e.item.date}`
                          : `/ ${e.item.date}`
                        : "View credentials"}
                  </span>
                </div>
              </Link>
            ))}
          {(loading ||
            data.experience.some((e) => /al.?nafi/i.test(e.company))) && (
            <Link to="/experience" className="credential-signal">
              <span className="credential-mark">
                <FlaskConical size={37} strokeWidth={1.3} />
              </span>
              <div>
                <strong>Lab-based internship</strong>
                <span>/ 2023 – 2024</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
