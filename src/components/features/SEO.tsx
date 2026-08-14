import { useEffect } from 'react';
import { siteDefaults } from '../../data/siteDefaults';

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

type SEOProps = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: StructuredData;
};

const ORIGIN = 'https://syedammar.engineer';

const canonicalPath = (path?: string) => {
  const source = path ?? window.location.pathname ?? '/';
  if (!source || source === '/') return '/';
  return `/${source.replace(/^\/+|\/+$/g, '')}/`;
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

const removeMeta = (selector: string) => {
  document.head.querySelector(selector)?.remove();
};

const upsertStructuredData = (data?: StructuredData) => {
  const id = 'route-structured-data';
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!data) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
};

export const SEO = ({
  title,
  description,
  path,
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  structuredData,
}: SEOProps) => {
  useEffect(() => {
    const finalTitle = title ?? siteDefaults.seo.title;
    const finalDescription = description ?? siteDefaults.seo.description;
    const canonicalUrl = `${ORIGIN}${canonicalPath(path)}`;

    document.title = finalTitle;
    upsertMeta('meta[name="description"]', 'name', 'description', finalDescription);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow,noarchive,nosnippet' : 'index,follow');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', finalTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', finalDescription);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', type);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', finalTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', finalDescription);

    if (type === 'article' && publishedTime) upsertMeta('meta[property="article:published_time"]', 'property', 'article:published_time', publishedTime);
    else removeMeta('meta[property="article:published_time"]');

    if (type === 'article' && modifiedTime) upsertMeta('meta[property="article:modified_time"]', 'property', 'article:modified_time', modifiedTime);
    else removeMeta('meta[property="article:modified_time"]');

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
    upsertStructuredData(structuredData);
  }, [title, description, path, noIndex, type, publishedTime, modifiedTime, structuredData]);

  return null;
};
