import { useEffect, useState } from 'react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { DataEmpty, DataLoading } from '../components/ui/DataState';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicExperience } from '../services/db';
import { displayExperienceDuration } from '../lib/experience';
import type { Experience as ExperienceType } from '../types/database';

const Experience = () => {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<ExperienceType[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPublicExperience().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  return (
    <>
      <SEO title={`Experience — ${settings.shortName}`} description={settings.experienceIntro} path="/experience" />
      <PageIntro eyebrow={settings.ui.experienceIntroEyebrow} title={settings.experienceTitle} intro={settings.experienceIntro} />
      <section className="content-section timeline">
        {loading ? <DataLoading label="Loading professional timeline…" variant="timeline" /> : items.map((item, index) => (
          <Reveal key={item.id ?? `${item.company}-${index}`} delay={index * 0.07} className="timeline-item">
            <div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="timeline-card">
              <div className="timeline-head"><div><p className="micro-label">{item.company}</p><h2>{item.role}</h2></div><time>{displayExperienceDuration(item)}</time></div>
              <ul>{item.description.map((point) => <li key={point}>{point}</li>)}</ul>
              <div className="tag-row">{item.techStack.map((tool) => <span key={tool}>{tool}</span>)}</div>
            </div>
          </Reveal>
        ))}
        {!loading && !items.length && <DataEmpty title={settings.ui.experienceEmptyTitle} body={settings.ui.experienceEmptyBody} />}
      </section>
    </>
  );
};
export default Experience;
