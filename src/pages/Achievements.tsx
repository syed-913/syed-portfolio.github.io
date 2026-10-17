import { useMemo } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, Clock3, GraduationCap } from "lucide-react";
import { SEO } from "../components/features/SEO";
import { PageIntro } from "../components/ui/PageIntro";
import { IssuerBadge } from "../components/ui/IssuerBadge";
import { DataEmpty, DataError, DataLoading } from "../components/ui/DataState";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { usePublicData } from "../hooks/usePublicData";
import { getPublicCertificates } from "../services/db";
import { learningEntryType, type Certificate } from "../types/database";
import { EducationProgress } from "../components/ui/EducationProgress";
import { readableEducationDate } from "../lib/education";

const resolveCredentialUrl = (cert: Certificate) => {
  const path = cert.credentialUrl || cert.imageUrl || cert.image || cert.url;
  if (!path) return undefined;
  if (/^(https?:)?\/\//.test(path)) return path;
  return `/${path.replace(/^\.\//, "").replace(/^\//, "").replace(/^public\//, "")}`;
};
const educationPeriod = (entry: Certificate) => {
  const start = readableEducationDate(entry.startDate);
  const end = readableEducationDate(entry.endDate);
  if (entry.educationStatus === "in_progress") return `${start || "Started"} — Present`;
  return start && end ? `${start} — ${end}` : start || end || "—";
};

export default function Achievements() {
  const { settings } = useSiteSettings();
  const { items, loading, error, retry } = usePublicData(getPublicCertificates);
  const { certificates, education } = useMemo(() => ({
    certificates: items.filter(item => learningEntryType(item) === "certificate"),
    education: items.filter(item => learningEntryType(item) === "education"),
  }), [items]);

  return <div className="credentials-index">
    <SEO title={`Credentials & Education — ${settings.shortName}`} description={settings.credentialsIntro} path="/credentials" />
    <PageIntro title={settings.credentialsTitle} intro={settings.credentialsIntro} />
    <div className="content-section learning-register">
      <section aria-labelledby="certifications-heading" className="learning-register-section">
        <h2 id="certifications-heading">{settings.ui.credentialsCertificatesTitle}</h2>
        {loading ? <DataLoading label="Loading credentials…" variant="list" /> : error ? <DataError retry={retry} /> : <div className="credential-grid">{certificates.map(cert => {
          const url = resolveCredentialUrl(cert);
          return <article className="credential-card" key={cert.id ?? cert.name}>
            <div className="credential-card-top"><IssuerBadge issuer={cert.issuer || "Credential authority"} /><span className="credential-year">{cert.date || "—"}</span></div>
            <div className="credential-card-copy">
              <h3>{cert.name}</h3>
              <p>{cert.issuer || "Credential authority"}</p>
              <div className="credential-card-actions">
                {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-link">{settings.ui.credentialViewCta}<ArrowUpRight size={16} /></a> : <span className="credential-unavailable">{settings.ui.credentialUnavailable}</span>}
                {cert.credentialId && <details className="credential-record">
                  <summary>Credential ID<ChevronDown size={14} aria-hidden="true" /></summary>
                  <code>{cert.credentialId}</code>
                </details>}
              </div>
            </div>
          </article>;
        })}</div>}
        {!loading && !error && !certificates.length && <DataEmpty title={settings.ui.certificateEmptyTitle} body={settings.ui.certificateEmptyBody} />}
      </section>
      <section aria-labelledby="education-heading" className="learning-register-section">
        <h2 id="education-heading">{settings.ui.credentialsEducationTitle}</h2>
        {loading ? <DataLoading label="Loading education…" variant="list" /> : error ? <DataError retry={retry} /> : education.map(entry => {
          const active = entry.educationStatus === "in_progress";
          return <article className="education-record" key={entry.id ?? entry.name}>
            <GraduationCap className="education-mark" size={24} aria-hidden="true" />
            <div>
              <h3>{entry.name}</h3>
              <p className="education-record-institution">{entry.institution || entry.issuer || "Academic institution"}</p>
              <dl className="education-record-meta">
                <div><dt>{settings.ui.educationPeriodLabel}</dt><dd>{educationPeriod(entry)}</dd></div>
                {entry.field && <div><dt>{settings.ui.educationFieldLabel}</dt><dd>{entry.field}</dd></div>}
              </dl>
              {entry.details && <p className="education-record-details">{entry.details}</p>}
              <EducationProgress entry={entry} />
            </div>
            <span className="education-status">{active ? <Clock3 size={13} /> : <CheckCircle2 size={13} />}{active ? settings.ui.educationInProgress : settings.ui.educationCompleted}</span>
          </article>;
        })}
        {!loading && !error && !education.length && <DataEmpty title={settings.ui.educationEmptyTitle} body={settings.ui.educationEmptyBody} />}
      </section>
    </div>
  </div>;
}
