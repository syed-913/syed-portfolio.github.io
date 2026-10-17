import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import { PlatformDirectory } from "../components/ui/PlatformDirectory";
import { SEO } from "../components/features/SEO";
import { DataError, DataLoading } from "../components/ui/DataState";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePublicData } from "../hooks/usePublicData";
import {
  getPublicCertificates,
  getPublicExperience,
  getPublicProjects,
} from "../services/db";
import { displayExperienceDuration } from "../lib/experience";
import { learningEntryType } from "../types/database";
import { useActiveSection } from "../hooks/useActiveSection";
import { InlineCopy } from "../components/ui/InlineCopy";
import { EducationProgress } from "../components/ui/EducationProgress";
const profileSections = [
  { id: "focus", label: "Technical focus" }, { id: "training", label: "Experience" },
  { id: "profile-projects", label: "Projects" }, { id: "learning-records", label: "Credentials" },
  { id: "current-learning", label: "Learning" }, { id: "platforms", label: "Across the web" },
];
export default function About() {
  const { settings } = useSiteSettings();
  const experience = usePublicData(getPublicExperience);
  const projects = usePublicData(getPublicProjects);
  const learning = usePublicData(getPublicCertificates);
  const activeSection = useActiveSection(profileSections.map(section => section.id));
  const [contentsOpen, setContentsOpen] = useState(() => window.matchMedia("(min-width: 1101px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1101px)");
    const update = () => setContentsOpen(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <div className="resume-page profile-page">
      <SEO
        title={`Profile — ${settings.shortName}`}
        description={settings.aboutBody}
        path="/about"
      />
      <header className="page-intro resume-intro">
        <div>
          <h1 className="page-title">{settings.name}</h1>
          <p className="resume-position">Linux / Cloud / Security</p>
          <p className="page-lead"><InlineCopy>{settings.aboutBody}</InlineCopy></p>
        </div>
        <div className="resume-contact">
          <img className="profile-portrait" src="/profile-avatar.webp" alt="Syed Ammar" width="80" height="80" />
          <span>
            <MapPin size={18} />
            {settings.location}
          </span>
          <span>
            <i className="status-dot" />
            {settings.availability}
          </span>
          <Link className="text-link" to="/contact">
            Get in touch
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </header>
      <div className="profile-layout content-section">
      <aside className="profile-section-rail">
        <details className="profile-section-disclosure" open={contentsOpen} onToggle={event => setContentsOpen(event.currentTarget.open)}>
          <summary onClick={event => { if (window.matchMedia("(min-width: 1101px)").matches) event.preventDefault(); }}>On this page<ChevronDown size={16} aria-hidden="true" /></summary>
          <nav className="profile-navigation" aria-label="Profile sections">
            {profileSections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? "location" : undefined} onClick={() => { if (window.matchMedia("(max-width: 1100px)").matches) setContentsOpen(false); }}>{section.label}</a>)}
          </nav>
        </details>
      </aside>
      <div className="profile-content">
      <section className="resume-section" id="focus">
        <h2>Technical focus</h2>
        <div className="resume-skills">
          {settings.capabilities.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p><InlineCopy>{item.description}</InlineCopy></p>
              <div className="tag-row">
                {item.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="resume-section" id="training">
        <h2>Experience & training</h2>
        <div>
          {experience.loading ? (
            <DataLoading variant="list" />
          ) : experience.error ? (
            <DataError retry={experience.retry} />
          ) : (
            experience.items.map((item) => (
              <article className="resume-entry" key={item.id ?? item.role}>
                <div className="resume-entry-head">
                  <h3>{item.role}</h3>
                  <time>{displayExperienceDuration(item)}</time>
                </div>
                <p className="resume-entry-sub">
                  {item.company}
                  {/al.?nafi/i.test(item.company)
                    ? " · Lab-based internship"
                    : ""}
                </p>
                <ul>
                  {item.description.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))
          )}
          <p className="context-note"><InlineCopy>{settings.aboutNote}</InlineCopy></p>
          <Link className="text-link profile-section-link" to="/experience">Explore experience & training<ArrowUpRight size={17} /></Link>
        </div>
      </section>
      <section className="resume-section" id="profile-projects">
        <h2>Projects</h2>
        <div>
          {projects.loading ? (
            <DataLoading variant="list" />
          ) : projects.error ? (
            <DataError retry={projects.retry} />
          ) : (
            projects.items.map((item) => (
              <article className="resume-entry" key={item.id ?? item.name}>
                <div className="resume-entry-head">
                  <h3>{item.name}</h3>
                  {item.url && (
                    <a
                      className="text-link"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Repository
                      <ArrowUpRight size={17} />
                    </a>
                  )}
                </div>
                <p>{item.description}</p>
                <div className="tag-row">
                  {item.stack?.map((tool) => (
                    <span key={tool}>{tool}</span>
                  ))}
                </div>
                <Link
                  className="text-link"
                  to={`/projects#${item.id ?? item.name}`}
                >
                  Read case study
                  <ArrowUpRight size={17} />
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
      <section className="resume-section" id="learning-records">
        <h2>Certifications & education</h2>
        <div>
          {learning.loading ? (
            <DataLoading variant="list" />
          ) : learning.error ? (
            <DataError retry={learning.retry} />
          ) : (
            [...learning.items].sort((a, b) => Number(learningEntryType(a) === "education") - Number(learningEntryType(b) === "education")).map((item) => (
              <article className="resume-learning" key={item.id ?? item.name}>
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {learningEntryType(item) === "education"
                      ? item.institution || item.issuer
                      : item.issuer}
                  </p>
                  <EducationProgress entry={item} />
                </div>
                <span>
                  {learningEntryType(item) === "education"
                    ? `${(item.startDate || "").replace("/", " ")} – ${(item.endDate || "Present").replace("/", " ")}`
                    : item.date}
                </span>
              </article>
            ))
          )}
          <Link className="text-link" to="/credentials">
            View credentials
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="resume-section" id="current-learning">
        <h2>Current learning</h2>
        <div>
          <p><InlineCopy>{settings.currentFocus}</InlineCopy></p>
          <p className="context-note">
            Tools I’m exploring alongside my documented projects and formal
            training.
          </p>
        </div>
      </section>
      <section id="platforms">
        <div className="section-heading-row">
          <h2>Across the web.</h2>
          <p className="section-copy">
            One place to find the code, credentials and writing.
          </p>
        </div>
        <PlatformDirectory />
      </section>
      </div>
      </div>
    </div>
  );
}
