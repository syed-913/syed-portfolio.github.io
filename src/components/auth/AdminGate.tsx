import { useEffect, useState, type ReactNode } from 'react';
import { browserSessionPersistence, setPersistence, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { LockKeyhole, LoaderCircle, ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { clearAdminSession, hasAdminSession, markAdminSession } from '../../lib/adminSession';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../features/SEO';

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingRestoredSession, setCheckingRestoredSession] = useState(true);

  useEffect(() => {
    if (loading || submitting) return;
    if (user && !hasAdminSession()) {
      // Firebase defaults to persistent auth. Never trust a restored browser login for this hidden workspace.
      signOut(auth).finally(() => {
        clearAdminSession();
        setCheckingRestoredSession(false);
      });
      return;
    }
    setCheckingRestoredSession(false);
  }, [loading, user, submitting]);

  if (loading || checkingRestoredSession) return <div className="admin-loading"><LoaderCircle className="spin" size={16}/> Verifying private session…</div>;
  if (user && hasAdminSession()) return <>{children}</>;

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const email = import.meta.env.VITE_ADMIN_EMAIL || 'syedammar06@proton.me';
      await setPersistence(auth, browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (credential.user.email?.toLowerCase() !== email.toLowerCase()) {
        await signOut(auth);
        throw new Error('Unauthorized account.');
      }
      markAdminSession();
      setPassword('');
    } catch {
      clearAdminSession();
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
        <p>Enter the dashboard URL manually, then authenticate. A previous browser login is not accepted automatically.</p>
        <div className="admin-security-note"><ShieldCheck size={15}/><span>Authentication is required again in each new browser session.</span></div>
        <label><span>Password</span><input type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="button button-primary" disabled={submitting}>{submitting ? <><LoaderCircle className="spin" size={16} /> Authenticating</> : 'Enter workspace'}</button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </main>
  );
};
