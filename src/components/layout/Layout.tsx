import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CursorField } from "../features/CursorField";

export const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
  <div className="site-shell">
    <a className="skip-link" href="#main-content">
      Skip to content
    </a>
    <CursorField />
    <Navbar />
    <main id="main-content" className="site-main" tabIndex={-1}>
      <div className="route-view" key={pathname}>{children}</div>
    </main>
    <Footer />
  </div>
  );
};
