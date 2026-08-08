import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, GraduationCap } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { Reveal } from '../components/ui/Reveal';
import { IssuerBadge } from '../components/ui/IssuerBadge';
import { DataEmpty, DataLoading } from '../components/ui/DataState';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getPublicCertificates } from '../services/db';
import { learningEntryType, type Certificate } from '../types/database';

const resolveCredentialUrl = (cert: Certificate) => {
  const path = cert.credentialUrl || cert.imageUrl || cert.image || cert.url;
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path)) return path;
  const clean = path.replace(/^\.\//, '').replace(/^\//, '').replace(/^public\//, '');
  return `/${clean}`;
};

const formatEducationPeriod = (entry: Certificate) => {
  const start = entry.startDate?.trim();
  const end = entry.endDate?.trim();
  if (!start && !end) return entry.educationStatus === 'in_progress' ? 'Current' : '—';
  if (entry.educationStatus === 'in_progress') return `${start || 'Started'} — Present`;
  if (start && end) return `${start} — ${end}`;
  return start || end || '—';
};

const Achievements = () => {
  const { settings } = useSiteSettings();
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicCertificates().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const { certificates, education } = useMemo(() => ({
    certificates: items.filter((item) => learningEntryType(item) === 'certificate'),
    education: items.filter((item) => learningEntryType(item) === 'education'),
  }), [items]);

  return (
    <>
      <SEO title={`Credentials & Education — ${settings.shortName}`} description={settings.credentialsIntro} path="/credentials" />
      <PageIntro eyebrow={settings.ui.credentialsIntroEyebrow} title={settings.credentialsTitle} intro={settings.credentialsIntro} />

      <section className="content-section learning-section learning-certifications">
        <Reveal className="learning-section-head">
          <div>
            <p className="eyebrow">{settings.ui.credentialsCertificatesEyebrow}</p>
            <h2>{settings.ui.credentialsCertificatesTitle}</h2>
          </div>
          <p>{settings.ui.credentialsCertificatesIntro}</p>
        </Reveal>

        <div className="credential-grid">
          {loading ? <DataLoading label="Loading credentials…" variant="cards" /> : certificates.map((cert, index) => {
            const credentialUrl = resolveCredentialUrl(cert);
            return (
              <Reveal className="credential-card" key={cert.id ?? cert.name} delay={index * 0.05}>
                <div className="credential-top">
                  <IssuerBadge issuer={cert.issuer || 'Credential authority'} />
                  <span className="micro-label">{cert.category || 'Credential'}</span>
                </div>
                <div className="credential-main">
                  <span className="credential-index">{String(index + 1).padStart(2, '0')}</span>
                  <h2>{cert.name}</h2>
                  <IssuerBadge issuer={cert.issuer || 'Credential authority'} compact withLabel />
                </div>
                <dl>
                  <div><dt>Date</dt><dd>{cert.date || '—'}</dd></div>
                  {cert.credentialId && <div><dt>ID</dt><dd>{cert.credentialId}</dd></div>}
                </dl>
                {credentialUrl ? (
                  <a href={credentialUrl} target="_blank" rel="noopener noreferrer" className="text-link credential-link">
                    {settings.ui.credentialViewCta} <ArrowUpRight size={16} />
                  </a>
                ) : <span className="credential-unavailable">{settings.ui.credentialUnavailable}</span>}
              </Reveal>
            );
          })}
          {!loading && !certificates.length && <DataEmpty title={settings.ui.certificateEmptyTitle} body={settings.ui.certificateEmptyBody} />}
        </div>
      </section>

      <section className="content-section learning-section education-section">
        <Reveal className="learning-section-head education-heading">
          <div>
            <p className="eyebrow">{settings.ui.credentialsEducationEyebrow}</p>
            <h2>{settings.ui.credentialsEducationTitle}</h2>
          </div>
          <p>{settings.ui.credentialsEducationIntro}</p>
        </Reveal>

        <div className="education-timeline">
          {loading ? <DataLoading label="Loading education…" variant="list" /> : education.map((entry, index) => {
            const inProgress = entry.educationStatus === 'in_progress';
            const institution = entry.institution || entry.issuer || 'Academic institution';
            return (
              <Reveal className={`education-entry ${inProgress ? 'is-active' : 'is-complete'}`} key={entry.id ?? entry.name} delay={index * 0.06}>
                <div className="education-rail" aria-hidden="true"><span /><i /></div>
                <div className="education-card">
                  <div className="education-card-top">
                    <IssuerBadge issuer={institution} compact />
                    <span className={`education-status ${inProgress ? 'is-active' : ''}`}>
                      {inProgress ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}
                      {inProgress ? settings.ui.educationInProgress : settings.ui.educationCompleted}
                    </span>
                  </div>
                  <div className="education-copy">
                    <span className="credential-index">{String(index + 1).padStart(2, '0')}</span>
                    <h3>{entry.name}</h3>
                    <div className="education-institution"><GraduationCap size={17} /><strong>{institution}</strong></div>
                    {entry.details && <p>{entry.details}</p>}
                  </div>
                  <dl className="education-meta">
                    {entry.field && <div><dt>{settings.ui.educationFieldLabel}</dt><dd>{entry.field}</dd></div>}
                    <div><dt>{settings.ui.educationPeriodLabel}</dt><dd>{formatEducationPeriod(entry)}</dd></div>
                  </dl>
                </div>
              </Reveal>
            );
          })}
          {!loading && !education.length && <DataEmpty title={settings.ui.educationEmptyTitle} body={settings.ui.educationEmptyBody} />}
        </div>
      </section>
    </>
  );
};

export default Achievements;
