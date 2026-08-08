import { useState, type ReactNode } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LockKeyhole, LoaderCircle } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../features/SEO';

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="admin-loading">Checking session…</div>;
  if (user) return <>{children}</>;

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setSubmitting(true); setError('');
    try {
      const email = import.meta.env.VITE_ADMIN_EMAIL || 'syedammar06@proton.me';
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Access denied. Check the credential and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <SEO title="Private workspace" description="Private portfolio management workspace." path="/dashboard" noIndex />
      <form className="admin-login-card" onSubmit={login}>
        <span className="admin-lock"><LockKeyhole size={22} /></span>
        <p className="eyebrow">Private workspace</p>
        <h1>Portfolio control room</h1>
        <p>This route is intentionally absent from public navigation and excluded from indexing. Authentication is still enforced by Firebase.</p>
        <label><span>Access key</span><input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="button button-primary" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={16} /> Authenticating</> : 'Enter workspace'}</button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  );
};
