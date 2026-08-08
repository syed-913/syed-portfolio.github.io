import type { ReactNode } from 'react';

export const AdminSection = ({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) => (
  <section className="admin-section">
    <div className="admin-section-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
    {children}
  </section>
);

export const AdminInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="admin-input" {...props} />;
export const AdminTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className="admin-input admin-textarea" {...props} />;
export const AdminSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className="admin-input" {...props} />;

export const AdminField = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
);
