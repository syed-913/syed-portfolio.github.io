import { useState } from 'react';
import { ArrowUpRight, Check, Github, Linkedin, LoaderCircle, Send } from 'lucide-react';
import { SEO } from '../components/features/SEO';
import { PageIntro } from '../components/ui/PageIntro';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { addItem } from '../services/db';

const Contact = () => {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('sending'); setError('');
    const webhookUrl = import.meta.env.VITE_WEBHOOK_PROXY_URL || import.meta.env.VITE_DISCORD_WEBHOOK_URL || 'https://discord-webhook-proxy.syedammar06.workers.dev/';
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `New Message from ${form.name}`,
            color: 0xb9ff66,
            fields: [
              { name: 'Email', value: form.email, inline: true },
              { name: 'Subject', value: form.subject, inline: true },
              { name: 'Message', value: form.message },
            ],
            footer: { text: 'Portfolio Contact Form' },
            timestamp: new Date().toISOString(),
          }],
        }),
      });
      if (!response.ok) {
        const message = response.status === 429 ? 'Too many messages were sent recently. Please try again later.' : 'The message gateway did not accept the request.';
        throw new Error(message);
      }
      addItem('messages', { ...form, createdAt: new Date().toISOString(), read: false }).catch(() => undefined);
      setForm({ name: '', email: '', subject: '', message: '' });
      setStatus('success');
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Unable to send the message.');
      setStatus('error');
    }
  };

  return (
    <>
      <SEO title={`Contact — ${settings.shortName}`} description={settings.contactIntro} path="/contact" />
      <PageIntro eyebrow={settings.ui.contactIntroEyebrow} title={settings.contactTitle} intro={settings.contactIntro} />
      <section className="content-section contact-layout">
        <form className="contact-form" onSubmit={submit}>
          <div className="field-row">
            <label><span>Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
            <label><span>Email</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          </div>
          <label><span>Subject</span><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Role, project, question…" /></label>
          <label><span>Message</span><textarea required rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="What would you like to discuss?" /></label>
          <button className="button button-primary" disabled={status === 'sending'}>
            {status === 'sending' ? <><LoaderCircle className="spin" size={17} /> Sending</> : <><Send size={17} /> Send message</>}
          </button>
          {status === 'success' && <p className="form-success"><Check size={16} /> Message delivered. I’ll see it in my private channel.</p>}
          {status === 'error' && <p className="form-error">{error}</p>}
        </form>
        <aside className="contact-side">
          <div><p className="micro-label">Location</p><strong>{settings.location}</strong></div>
          <div><p className="micro-label">Availability</p><strong>{settings.availability}</strong></div>
          <div><p className="micro-label">{settings.ui.contactPublicProfiles}</p><div className="contact-socials"><a href={settings.socials.github} target="_blank" rel="noreferrer"><Github /> GitHub <ArrowUpRight /></a><a href={settings.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin /> LinkedIn <ArrowUpRight /></a></div></div>
          <p className="privacy-note">{settings.ui.contactPrivacy}</p>
        </aside>
      </section>
    </>
  );
};
export default Contact;
