import { RefreshCw } from "lucide-react";
export const DataLoading = ({
  label = "Loading portfolio content…",
  variant = "cards",
}: {
  label?: string;
  variant?: "cards" | "list" | "timeline" | "article";
}) => (
  <div
    className={`data-loading data-loading-${variant}`}
    role="status"
    aria-live="polite"
  >
    <p>{label}</p>
    <div className="data-skeleton-wrap">
      {Array.from({ length: variant === "article" ? 1 : 3 }).map((_, i) => (
        <div className="data-skeleton" key={i}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  </div>
);
export const DataEmpty = ({ title, body }: { title: string; body: string }) => (
  <div className="empty-state-card">
    <h3>{title}</h3>
    <p>{body}</p>
  </div>
);
export const DataError = ({ retry }: { retry: () => void }) => (
  <div className="data-error" role="alert">
    <h3>This content couldn’t load.</h3>
    <p>Please try again to load the published portfolio records.</p>
    <button className="button button-ghost" onClick={retry}>
      <RefreshCw size={16} />
      Try again
    </button>
  </div>
);
