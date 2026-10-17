import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useSiteSettings } from "../../hooks/useSiteSettings";
import { ChatbotLauncher } from "../features/ChatbotLauncher";

const ease = [0.16, 1, 0.3, 1] as const;
export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const { settings } = useSiteSettings();
  const links = [
    { to: "/about", label: settings.ui.navProfile },
    { to: "/projects", label: settings.ui.navWork },
    { to: "/experience", label: settings.ui.navExperience },
    { to: "/credentials", label: settings.ui.navCredentials },
    { to: "/writing", label: settings.ui.navWriting },
    { to: "/contact", label: settings.ui.navConnect },
  ];
  const closeMenu = () => { setOpen(false); trigger.current?.focus({ preventScroll: true }); };
  const toggleMenu = () => {
    if (!open) window.dispatchEvent(new CustomEvent("portfolio:overlay-open", { detail: "navigation" }));
    setOpen(value => !value);
  };
  useEffect(() => {
    const otherOverlay = (event: Event) => { if ((event as CustomEvent).detail === "assistant") setOpen(false); };
    const wide = matchMedia("(min-width: 1001px)");
    const resize = () => { if (wide.matches) setOpen(false); };
    window.addEventListener("portfolio:overlay-open", otherOverlay);
    wide.addEventListener("change", resize);
    return () => { window.removeEventListener("portfolio:overlay-open", otherOverlay); wide.removeEventListener("change", resize); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus({ preventScroll: true }); }
      if (event.key !== "Tab") return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>("a,button") ?? []);
      const first = nodes[0]; const last = nodes[nodes.length - 1];
      if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) { event.preventDefault(); trigger.current?.focus(); }
      else if (document.activeElement === trigger.current) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
    };
    const routeChange = () => setOpen(false);
    window.addEventListener("popstate", routeChange); window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", key); window.removeEventListener("popstate", routeChange); };
  }, [open]);
  return <header className="site-nav-wrap">
    <nav className="site-nav" aria-label="Primary navigation">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>{settings.shortName}</Link>
      <div className="desktop-nav">
        <div className="nav-links">{links.slice(0, -1).map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}>{link.label}</NavLink>)}</div>
        <ThemeToggle /><Link to="/contact" className="nav-cta">{settings.ui.navConnect}<ArrowRight size={17} /></Link>
      </div>
      <div className="nav-controls">
        <ThemeToggle />
        <button ref={trigger} className={`menu-button ${open ? "is-open" : ""}`} type="button" onClick={toggleMenu} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation menu" : "Open navigation menu"}>
          <span className="menu-glyph" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
    </nav>
    <ChatbotLauncher />
    <AnimatePresence initial={false}>
      {open && <m.div key="mobile-menu" className="mobile-menu-layer" initial="closed" animate="open" exit="closed">
        <m.button className="mobile-menu-backdrop" aria-label="Close navigation menu" onClick={closeMenu} variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }} transition={{ duration: reduce ? 0.08 : 0.18 }} />
        <m.nav ref={panel} id="mobile-navigation" className="mobile-panel" aria-label="Mobile navigation"
          variants={{ closed: { clipPath: reduce ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", opacity: 0, transition: { duration: reduce ? 0.08 : 0.14 } }, open: { clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: reduce ? 0.08 : 0.26, ease, staggerChildren: reduce ? 0 : 0.02 } } }}>
          {links.map(link => <m.div key={link.to} variants={{ closed: { opacity: 0, x: reduce ? 0 : 10, transition: { duration: 0.08 } }, open: { opacity: 1, x: 0, transition: { duration: reduce ? 0.08 : 0.2, ease } } }}>
            <NavLink to={link.to} onClick={() => setOpen(false)} className={({ isActive }) => `mobile-link ${isActive ? "is-active" : ""}`}>{link.label}<ArrowRight size={20} /></NavLink>
          </m.div>)}
          <p>Linux / Cloud / Security</p>
        </m.nav>
      </m.div>}
    </AnimatePresence>
  </header>;
};
