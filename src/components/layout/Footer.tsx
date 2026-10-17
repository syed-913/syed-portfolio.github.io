import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useSiteSettings } from "../../hooks/useSiteSettings";
export const Footer = () => {
  const { settings } = useSiteSettings();
  return (
    <footer className="site-footer">
      <Link to="/" className="footer-name">
        {settings.shortName}
        <span>Linux / Cloud / Security</span>
      </Link>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link to="/about">Profile</Link>
        <Link to="/contact">Contact</Link>
        <a href={settings.socials.github} target="_blank" rel="noreferrer">
          GitHub
          <ArrowUpRight size={14} />
        </a>
        <a href={settings.socials.credly} target="_blank" rel="noreferrer">
          Credly
          <ArrowUpRight size={14} />
        </a>
        {settings.socials.medium && (
          <a href={settings.socials.medium} target="_blank" rel="noreferrer">
            Medium
            <ArrowUpRight size={14} />
          </a>
        )}
      </nav>
      <p className="footer-meta">
        © {new Date().getFullYear()} {settings.name}
      </p>
    </footer>
  );
};
