import { useEffect, useState } from 'react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicExperience } from '../services/db';
import type { Experience as ExperienceType } from '../types/database';

const Experience = () => {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<ExperienceType[]>([]);
  useEffect(() => { getPublicExperience().then(setItems).catch(() => setItems([])); }, []);

  return (
    <>
      <SEO title={`Experience — ${settings.shortName}`} description={settings.experienceIntro} path="/experience" />
      <PageIntro eyebrow={settings.ui.experienceIntroEyebrow} title={settings.experienceTitle} intro={settings.experienceIntro} />
      <section className="content-section timeline">
        {items.map((item, index) => (
          <Reveal key={item.id ?? `${item.company}-${index}`} delay={index * 0.07} className="timeline-item">
            <div className="timeline-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
            <div className="timeline-card">
              <div className="timeline-head"><div><p className="micro-label">{item.company}</p><h2>{item.role}</h2></div><time>{item.duration}</time></div>
              <ul>{item.description.map((point) => <li key={point}>{point}</li>)}</ul>
              <div className="tag-row">{item.techStack.map((tool) => <span key={tool}>{tool}</span>)}</div>
            </div>
          </Reveal>
        ))}
        {!items.length && <div className="empty-state-card"><h3>{settings.ui.experienceEmptyTitle}</h3><p>{settings.ui.experienceEmptyBody}</p></div>}
      </section>
    </>
  );
};
export default Experience;
