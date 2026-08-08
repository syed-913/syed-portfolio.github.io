import { useEffect } from 'react';
import { siteDefaults } from '../../data/siteDefaults';

type SEOProps = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

const upsertMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const SEO = ({ title, description, path = '/', noIndex = false, type = 'website' }: SEOProps) => {
  useEffect(() => {
    const finalTitle = title ?? siteDefaults.seo.title;
    const finalDescription = description ?? siteDefaults.seo.description;
    const canonicalUrl = `https://syedammar.engineer${path === '/' ? '' : path}`;

    document.title = finalTitle;
    upsertMeta('meta[name="description"]', 'name', 'description', finalDescription);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', finalDescription);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description, path, noIndex, type]);

  return null;
};
