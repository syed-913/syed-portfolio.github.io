import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();
  const links = [
    { to: '/about', label: settings.ui.navProfile },
    { to: '/projects', label: settings.ui.navWork },
    { to: '/experience', label: settings.ui.navExperience },
    { to: '/credentials', label: settings.ui.navCredentials },
    { to: '/writing', label: settings.ui.navWriting },
  ];

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link to="/" className="brand" aria-label={`${settings.shortName} home`}>
          <span className="brand-mark"><img src="/profile-avatar.webp" alt="" aria-hidden="true" /></span>
          <span className="brand-copy">
            <strong>{settings.shortName}</strong>
            <small>{settings.ui.navTagline}</small>
          </span>
        </Link>

        <div className="desktop-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle className="nav-theme-toggle" />
          <Link to="/contact" className="nav-cta">{settings.ui.navConnect} <span aria-hidden="true">↗</span></Link>
        </div>

        <div className="nav-controls">
          <ThemeToggle className="mobile-theme-toggle" />
          <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="mobile-panel">
          {links.map((link, index) => (
            <NavLink key={link.to} to={link.to} className="mobile-link">
              <span>0{index + 1}</span>{link.label}
            </NavLink>
          ))}
          <Link to="/contact" className="mobile-link"><span>06</span>{settings.ui.navConnect}</Link>
        </div>
      )}
    </header>
  );
};
