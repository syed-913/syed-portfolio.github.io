type Props = { missing: string[] };

const envLabel: Record<string, string> = {
  VITE_FIREBASE_API_KEY: 'Firebase API key',
  VITE_FIREBASE_AUTH_DOMAIN: 'Firebase Auth domain',
  VITE_FIREBASE_PROJECT_ID: 'Firebase project ID',
  VITE_FIREBASE_STORAGE_BUCKET: 'Firebase storage bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'Firebase messaging sender ID',
  VITE_FIREBASE_APP_ID: 'Firebase app ID',
};

export default function ConfigurationRequired({ missing }: Props) {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px', background: 'var(--ink)', color: 'var(--paper)' }}>
      <section style={{ width: 'min(760px, 100%)', border: '1px solid var(--line)', borderRadius: 24, padding: 'clamp(24px, 5vw, 48px)', background: 'var(--panel)', boxShadow: '0 30px 90px rgba(0,0,0,.25)' }}>
        <p style={{ margin: '0 0 16px', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--signal)' }}>
          Local environment check
        </p>
        <h1 style={{ margin: 0, fontSize: 'clamp(34px, 6vw, 64px)', lineHeight: .96, letterSpacing: '-.055em' }}>
          Firebase config is missing locally.
        </h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 16, margin: '24px 0' }}>
          The repository keeps environment values out of Git. GitHub Actions recreates them during deployment, but a fresh clone does not have them on your computer. Create a <code>.env.local</code> file in the repository root, add your existing Firebase web configuration, then restart Vite.
        </p>
        <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
          {missing.map((key) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 18, padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
              <span style={{ color: 'var(--paper)' }}>{envLabel[key] ?? key}</span>
              <code style={{ color: 'var(--muted)', textAlign: 'right' }}>{key}</code>
            </div>
          ))}
        </div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 18, borderRadius: 16, background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--paper)', font: '12px/1.7 DM Mono, monospace' }}>{`cp .env.redesign.example .env.local\n# Fill the Firebase values in .env.local\nnpm run dev`}</pre>
        <p style={{ margin: '18px 0 0', color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>
          Do not commit <code>.env.local</code>. Your existing <code>.gitignore</code> already excludes it.
        </p>
      </section>
    </main>
  );
}
