import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";
import { SEO } from "../components/features/SEO";
import { PageIntro } from "../components/ui/PageIntro";
import { DataEmpty, DataError, DataLoading } from "../components/ui/DataState";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePublicData } from "../hooks/usePublicData";
import { getPublicExperience } from "../services/db";
import { displayExperienceDuration } from "../lib/experience";
export default function Experience() {
  const { settings } = useSiteSettings();
  const { items, loading, error, retry } = usePublicData(getPublicExperience, 'experience');
  return (
    <>
      <SEO
        title={`Experience — ${settings.shortName}`}
        description={settings.experienceIntro}
        path="/experience"
      />
      <PageIntro
        title={settings.experienceTitle}
        intro={settings.experienceIntro}
      />
      <section className="content-section timeline">
        {loading ? (
          <DataLoading label="Loading experience…" variant="timeline" />
        ) : error ? (
          <DataError retry={retry} />
        ) : (
          items.map((item) => (
            <article className="timeline-item" key={item.id ?? item.company}>
              <div className="timeline-meta">
                <time>{displayExperienceDuration(item)}</time>
                {/al.?nafi/i.test(item.company) && (
                  <span className="training-label">
                    <FlaskConical size={16} />
                    Lab-based internship
                  </span>
                )}
              </div>
              <div className="timeline-card">
                <h2>{item.role}</h2>
                <p className="experience-company">{item.company}</p>
                <ul>
                  {item.description.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <h3 className="small-heading">Training topics</h3>
                <div className="tag-row">
                  {item.techStack.map((tool) => (
                    <span key={tool}>
                      {tool === "CISSP" ? "CISSP curriculum" : tool}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
        {!loading && !error && !items.length && (
          <DataEmpty
            title={settings.ui.experienceEmptyTitle}
            body={settings.ui.experienceEmptyBody}
          />
        )}
      </section>
      <section className="content-section next-route">
        <h2>See the work behind the learning.</h2>
        <Link className="text-link" to="/projects/">
          Explore projects
          <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
