import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { IssuerBadge } from '../components/ui/IssuerBadge';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicCertificates } from '../services/db';
import type { Certificate } from '../types/database';

const resolveAsset = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return path.replace(/^\/public/, '');
};

const Achievements = () => {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<Certificate[]>([]);
  useEffect(() => { getPublicCertificates().then(setItems).catch(() => setItems([])); }, []);

  return (
    <>
      <SEO title={`Credentials — ${settings.shortName}`} description={settings.credentialsIntro} path="/achievements" />
      <PageIntro eyebrow={settings.ui.credentialsIntroEyebrow} title={settings.credentialsTitle} intro={settings.credentialsIntro} />
      <section className="content-section credential-grid">
        {items.map((cert, index) => (
          <Reveal className="credential-card" key={cert.id ?? cert.name} delay={index * 0.05}>
            <div className="credential-top">
              <IssuerBadge issuer={cert.issuer} />
              <span className="micro-label">{cert.category || 'Credential'}</span>
            </div>
            <div className="credential-main">
              <span className="credential-index">{String(index + 1).padStart(2, '0')}</span>
              <h2>{cert.name}</h2>
              <IssuerBadge issuer={cert.issuer} compact withLabel />
            </div>
            <dl>
              <div><dt>Date</dt><dd>{cert.date}</dd></div>
              {cert.credentialId && <div><dt>ID</dt><dd>{cert.credentialId}</dd></div>}
            </dl>
            {cert.imageUrl && (
              <a href={resolveAsset(cert.imageUrl)} target="_blank" rel="noreferrer" className="text-link">
                {settings.ui.credentialViewCta} <ArrowUpRight size={16} />
              </a>
            )}
          </Reveal>
        ))}
      </section>
    </>
  );
};
export default Achievements;
