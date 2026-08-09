import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduce = useReducedMotion();
  const { settings } = useSiteSettings();
  const links = [
    { to: '/about', label: settings.ui.navProfile },
    { to: '/projects', label: settings.ui.navWork },
    { to: '/experience', label: settings.ui.navExperience },
    { to: '/credentials', label: settings.ui.navCredentials },
    { to: '/writing', label: settings.ui.navWriting },
  ];

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const panelTransition = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.72 };

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary navigation">
        <Link to="/" className="brand">
          <span className="brand-mark"><img src="/profile-avatar-nav.webp" width="96" height="96" loading="eager" decoding="async" alt="" aria-hidden="true" /></span>
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
          <m.button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            whileTap={reduce ? undefined : { scale: 0.92 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={open ? 'close' : 'menu'}
                className="menu-icon"
                initial={reduce ? false : { opacity: 0, rotate: open ? -18 : 18, scale: 0.75 }}
                animate={reduce ? undefined : { opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, rotate: open ? 18 : -18, scale: 0.75 }}
                transition={{ duration: reduce ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </m.span>
            </AnimatePresence>
          </m.button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            className="mobile-menu-layer"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.24 }}
          >
            <m.button
              className="mobile-menu-backdrop"
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
            />
            <m.div
              id="mobile-navigation"
              className="mobile-panel"
              role="navigation"
              aria-label="Mobile navigation"
              initial={reduce ? false : { opacity: 0, y: -22, scale: 0.975, filter: 'blur(8px)' }}
              animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reduce ? undefined : { opacity: 0, y: -14, scale: 0.985, filter: 'blur(6px)' }}
              transition={panelTransition}
            >
              <div className="mobile-panel-signal" aria-hidden="true"><i /><i /><i /><b /></div>
              {links.map((link, index) => (
                <m.div
                  key={link.to}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.34, delay: reduce ? 0 : 0.055 + index * 0.045, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavLink to={link.to} className={({ isActive }) => `mobile-link ${isActive ? 'is-active' : ''}`}>
                    <span>0{index + 1}</span><strong>{link.label}</strong><em aria-hidden="true">↗</em>
                  </NavLink>
                </m.div>
              ))}
              <m.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.34, delay: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to="/contact" className="mobile-link mobile-link-cta"><span>06</span><strong>{settings.ui.navConnect}</strong><em aria-hidden="true">↗</em></Link>
              </m.div>
              <p className="mobile-panel-foot">{settings.ui.navTagline}</p>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
};
