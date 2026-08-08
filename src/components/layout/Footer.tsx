import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Footer = () => {
  const { settings } = useSiteSettings();
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">{settings.ui.footerEyebrow}</p>
        <p className="footer-name">{settings.shortName}</p>
      </div>
      <div className="footer-links">
        <Link to="/contact">{settings.ui.navConnect}</Link>
        <a href={settings.socials.github} target="_blank" rel="noreferrer"><Github size={16} />GitHub</a>
        <a href={settings.socials.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} />LinkedIn</a>
      </div>
      <div className="footer-meta">{settings.ui.footerMeta} · {new Date().getFullYear()}</div>
    </footer>
  );
};
