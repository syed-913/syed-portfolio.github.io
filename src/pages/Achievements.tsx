import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { IssuerBadge } from '../components/ui/IssuerBadge';
import { DataEmpty, DataLoading } from '../components/ui/DataState';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicCertificates } from '../services/db';
import type { Certificate } from '../types/database';

const resolveCredentialUrl = (cert: Certificate) => {
  const path = cert.credentialUrl || cert.imageUrl || cert.image || cert.url;
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path)) return path;
  const clean = path.replace(/^\.\//, '').replace(/^\//, '').replace(/^public\//, '');
  return `/${clean}`;
};

const Achievements = () => {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPublicCertificates().then(setItems).catch(() => setItems([])).finally(() => setLoading(false)); }, []);

  return (
    <>
      <SEO title={`Credentials — ${settings.shortName}`} description={settings.credentialsIntro} path="/credentials" />
      <PageIntro eyebrow={settings.ui.credentialsIntroEyebrow} title={settings.credentialsTitle} intro={settings.credentialsIntro} />
      <section className="content-section credential-grid">
        {loading ? <DataLoading label="Loading credentials…" variant="cards" /> : items.map((cert, index) => {
          const credentialUrl = resolveCredentialUrl(cert);
          return (
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
              {credentialUrl ? (
                <a href={credentialUrl} target="_blank" rel="noopener noreferrer" className="text-link credential-link">
                  {settings.ui.credentialViewCta} <ArrowUpRight size={16} />
                </a>
              ) : <span className="credential-unavailable">Credential file not attached</span>}
            </Reveal>
          );
        })}
        {!loading && !items.length && <DataEmpty title="No public credentials yet." body="Credentials will appear here when published." />}
      </section>
    </>
  );
};
export default Achievements;
