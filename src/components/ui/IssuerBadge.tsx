import { getIssuerIdentity } from '../../lib/issuerIdentity';

type IssuerBadgeProps = {
  issuer: string;
  compact?: boolean;
  withLabel?: boolean;
  label?: string;
};

export const IssuerBadge = ({ issuer, compact = false, withLabel = false, label = 'Issuer' }: IssuerBadgeProps) => {
  const identity = getIssuerIdentity(issuer);

  return (
    <span
      className={`issuer-badge issuer-badge-${identity.key}${compact ? ' is-compact' : ''}${withLabel ? ' has-label' : ''}`}
      title={identity.canonical}
      aria-label={`${label}: ${identity.canonical}`}
    >
      <span className="issuer-badge-mark" aria-hidden="true">{identity.mark}</span>
      {withLabel && (
        <span className="issuer-badge-copy">
          <small>{label}</small>
          <strong>{identity.canonical}</strong>
        </span>
      )}
    </span>
  );
};
