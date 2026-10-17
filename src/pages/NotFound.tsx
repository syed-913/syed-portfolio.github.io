import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SEO } from "../components/features/SEO";
import { useSiteSettings } from "../hooks/useSiteSettings";

const NotFound = () => {
  const { settings } = useSiteSettings();
  return (
    <section className="not-found">
      <SEO
        title={`404 — ${settings.shortName}`}
        description="Page not found."
        noIndex
      />
      <p className="eyebrow">404 / route unavailable</p>
      <h1>Page not found.</h1>
      <p>The link may have changed. Return home to explore the portfolio.</p>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={16} /> Return home
      </Link>
    </section>
  );
};
export default NotFound;
