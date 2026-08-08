import { LoaderCircle } from 'lucide-react';

export const DataLoading = ({ label = 'Syncing portfolio data…', variant = 'cards' }: { label?: string; variant?: 'cards'|'list'|'timeline'|'article' }) => {
  const count = variant === 'article' ? 1 : variant === 'timeline' ? 3 : 4;
  return (
    <div className={`data-loading data-loading-${variant}`} role="status" aria-live="polite" aria-label={label}>
      <div className="data-loading-head"><LoaderCircle className="spin" size={14}/><span>{label}</span></div>
      <div className="data-skeleton-wrap">
        {Array.from({ length: count }).map((_, index) => (
          <div className="data-skeleton" key={index}>
            <span className="sk-line sk-short"/><span className="sk-line sk-title"/><span className="sk-line"/><span className="sk-line sk-mid"/>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DataEmpty = ({ title, body }: { title: string; body: string }) => (
  <div className="empty-state-card"><h3>{title}</h3><p>{body}</p></div>
);
