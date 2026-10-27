import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { siteDefaults as defaults } from '../src/data/siteDefaults.ts';
import { plainInlineCopy } from '../src/lib/inlineCopy.ts';
import { canonicalPath, SITE_ORIGIN } from '../src/lib/siteUrl.ts';
import { safeLink } from '../src/lib/safeLink.ts';
import { normalizeHeroCanvas, publicCanvasScenes } from '../src/lib/heroCanvas.ts';
import { secureHtml } from './html-security.mjs';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { richTextPolicy } from '../src/lib/richTextPolicy.ts';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const { origin: ORIGIN } = JSON.parse(await fs.readFile(new URL('../deployment.config.json', import.meta.url), 'utf8'));

if (ORIGIN !== SITE_ORIGIN) throw new Error('[seo] Deployment and browser canonical origins must match.');

const implementationDetail = /firebase|cloudflare|webhook|discord webhook|backend|database collection|private dashboard/i;

const readEnvFile = async (filename) => {
  try {
    const raw = await fs.readFile(path.join(ROOT, filename), 'utf8');
    const out = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
};

const localEnv = {
  ...(await readEnvFile('.env')),
  ...(await readEnvFile('.env.local')),
  ...(await readEnvFile('.env.production')),
  ...(await readEnvFile('.env.production.local')),
};

const env = (key) => process.env[key] || localEnv[key] || '';
const projectId = env('VITE_FIREBASE_PROJECT_ID');
const apiKey = env('VITE_FIREBASE_API_KEY');

const decodeValue = (value) => {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
};

const decodeFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, decodeValue(value)]));

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};

const fetchSiteSettings = async () => {
  if (!projectId || !apiKey) return defaults;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/siteSettings/main?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    // This optional document may legitimately not exist yet.
    if (response.status === 404) return defaults;
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const document = await response.json();
    const remote = decodeFields(document.fields || {});
    const settings = {
      ...defaults,
      ...remote,
      socials: Object.fromEntries([...Object.keys(defaults.socials), 'medium'].map(key => [key, safeLink(remote.socials?.[key] ?? defaults.socials[key]) || ''])),
      seo: { ...defaults.seo, ...(remote.seo || {}) },
      ui: Object.fromEntries(Object.keys(defaults.ui).map(key => [key, typeof remote.ui?.[key] === 'string' ? remote.ui[key] : defaults.ui[key]])),
      heroCanvas: normalizeHeroCanvas(remote.heroCanvas),
      capabilities: Array.isArray(remote.capabilities) && remote.capabilities.length ? remote.capabilities : defaults.capabilities,
    };
    if (implementationDetail.test(settings.contactIntro || '')) settings.contactIntro = defaults.contactIntro;
    if (/(?:about\s+)?(?:~?\s*)?(?:1|one)\s+year.*professional experience/i.test(settings.aboutBody || '')) settings.aboutBody = defaults.aboutBody;
    // Settings are public, but do not serialize unexpected administrative fields.
    return Object.fromEntries([...Object.keys(defaults), 'heroCanvas'].map(key => [key, settings[key]]));
  } catch (error) {
    if (process.env.SEO_STRICT === '1') throw new Error(`[seo] Public site settings read failed (${error.message}).`);
    console.warn(`[seo] Site settings could not be read; using local defaults (${error.message}).`);
    return defaults;
  }
};

const publicFields = {
  posts: ['title', 'slug', 'date', 'tags', 'content', 'readTime', 'upvotes', 'order', 'visible'],
  projects: ['name', 'repoPath', 'command', 'description', 'problem', 'built', 'decisions', 'outcome', 'learnings', 'stack', 'url', 'output', 'order', 'visible'],
  certificates: ['name', 'entryType', 'issuer', 'date', 'imageUrl', 'credentialUrl', 'image', 'url', 'credentialId', 'category', 'institution', 'field', 'startDate', 'endDate', 'endDatePrecision', 'educationStatus', 'details', 'order', 'visible'],
  experience: ['role', 'company', 'duration', 'startDate', 'endDate', 'description', 'techStack', 'order', 'visible'],
};

const fetchVisibleRecords = async (collectionId) => {
  if (!projectId || !apiKey) {
    if (process.env.SEO_STRICT === '1') throw new Error('[seo] Firebase configuration is required for release route generation.');
    console.warn(`[seo] Firebase variables are unavailable; ${collectionId} uses an empty public snapshot.`);
    return [];
  }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(apiKey)}`;
    const rows = await fetchJson(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'visible' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
          select: {
            fields: publicFields[collectionId].map(fieldPath => ({ fieldPath })),
          },
          limit: 500,
        },
      }),
    });
    return rows
      .filter((row) => row.document?.fields)
      .map((row) => ({
        ...decodeFields(row.document.fields),
        id: row.document.name?.split('/').pop(),
        visible: true,
        updateTime: row.document.updateTime,
        createTime: row.document.createTime,
      }))
      .filter(item => collectionId !== 'posts' || typeof item.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) && typeof item.title === 'string')
      .sort((a, b) => collectionId === 'posts' ? String(b.date ?? '').localeCompare(String(a.date ?? '')) : (a.order ?? 999) - (b.order ?? 999));
  } catch (error) {
    const label = collectionId === 'posts' ? 'writing' : collectionId;
    if (process.env.SEO_STRICT === '1') throw new Error(`[seo] Public ${label} read failed (${error.message}).`);
    console.warn(`[seo] Visible ${label} could not be read; using an empty public snapshot (${error.message}).`);
    return [];
  }
};

const canonicalUrl = (route = '/') => `${ORIGIN}${canonicalPath(route)}`;
const htmlEscape = (value = '') => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xmlEscape = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const jsonForHtml = (value) => JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
const stripMarkdown = (value = '') => String(value)
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/[#*_>~|\-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const excerpt = (value, limit = 155) => {
  const clean = stripMarkdown(value);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1).trimEnd()}…`;
};
const isoDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const upsertMeta = (html, keyType, key, content) => {
  const attr = keyType === 'property' ? 'property' : 'name';
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+[^>]*${attr}=["']${escapedKey}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${htmlEscape(key)}" content="${htmlEscape(content)}" />`;
  if (regex.test(html)) return html.replace(regex, () => tag);
  return html.replace('</head>', () => `  ${tag}\n</head>`);
};

const upsertCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${htmlEscape(url)}" />`;
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  if (regex.test(html)) return html.replace(regex, () => tag);
  return html.replace('</head>', () => `  ${tag}\n</head>`);
};

const upsertTitle = (html, title) => {
  const tag = `<title>${String(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i, () => tag) : html.replace('</head>', () => `  ${tag}\n</head>`);
};

const upsertJsonLd = (html, id, data) => {
  const tag = `<script id="${id}" type="application/ld+json">\n${jsonForHtml(data)}\n  </script>`;
  const regex = new RegExp(`<script\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'i');
  if (regex.test(html)) return html.replace(regex, () => tag);
  return html.replace('</head>', () => `  ${tag}\n</head>`);
};

const removeJsonLd = (html, id) => {
  const regex = new RegExp(`\\s*<script\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'i');
  return html.replace(regex, '');
};

const pageHtml = (baseHtml, { title, description, route, type = 'website', robots = 'index,follow', siteSchema, routeSchema }) => {
  title = plainInlineCopy(title);
  description = plainInlineCopy(description);
  const url = canonicalUrl(route);
  let html = baseHtml;
  html = upsertTitle(html, title);
  html = upsertMeta(html, 'name', 'description', description);
  html = upsertMeta(html, 'name', 'robots', robots);
  html = upsertMeta(html, 'property', 'og:title', title);
  html = upsertMeta(html, 'property', 'og:description', description);
  html = upsertMeta(html, 'property', 'og:type', type);
  html = upsertMeta(html, 'property', 'og:url', url);
  html = upsertMeta(html, 'name', 'twitter:title', title);
  html = upsertMeta(html, 'name', 'twitter:description', description);
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = upsertCanonical(html, url);
  html = upsertJsonLd(html, 'site-structured-data', siteSchema);
  html = routeSchema ? upsertJsonLd(html, 'route-structured-data', routeSchema) : removeJsonLd(html, 'route-structured-data');
  return html;
};

const siteSchemaFor = (settings) => {
  const sameAs = [settings.socials?.github, settings.socials?.linkedin, settings.socials?.credly, settings.socials?.medium].filter(Boolean);
  const knowsAbout = [...new Set([
    'Linux', 'Cloud Infrastructure', 'Security', 'Compliance foundations',
    ...(settings.capabilities || []).flatMap((item) => [item?.title, ...(item?.tools || [])]).filter(Boolean),
  ])];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${ORIGIN}/#person`,
        name: settings.name || defaults.name,
        url: `${ORIGIN}/`,
        sameAs,
        knowsAbout,
      },
      {
        '@type': 'WebSite',
        '@id': `${ORIGIN}/#website`,
        url: `${ORIGIN}/`,
        name: settings.shortName || defaults.shortName,
        description: settings.seo?.description || defaults.seo.description,
        publisher: { '@id': `${ORIGIN}/#person` },
        inLanguage: 'en',
      },
      {
        '@type': 'ProfilePage',
        '@id': `${ORIGIN}/#profile`,
        url: `${ORIGIN}/`,
        name: settings.seo?.title || defaults.seo.title,
        description: settings.seo?.description || defaults.seo.description,
        mainEntity: { '@id': `${ORIGIN}/#person` },
        isPartOf: { '@id': `${ORIGIN}/#website` },
        inLanguage: 'en',
      },
    ],
  };
};

const articleSchemaFor = (post, description) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    url: canonicalUrl(`/writing/${post.slug}`),
    mainEntityOfPage: canonicalUrl(`/writing/${post.slug}`),
    author: { '@id': `${ORIGIN}/#person` },
    publisher: { '@id': `${ORIGIN}/#person` },
    inLanguage: 'en',
  };
  const published = isoDate(post.date || post.createTime);
  if (published) schema.datePublished = published;
  if (Array.isArray(post.tags) && post.tags.length) schema.keywords = post.tags.join(', ');
  return schema;
};

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });
const writeRoute = async (route, html) => {
  const clean = route.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    await fs.writeFile(path.join(DIST, 'index.html'), secureHtml(html));
    return;
  }
  const dir = path.join(DIST, clean);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, 'index.html'), secureHtml(html));
};

const redirectHtml = (fromRoute, toRoute) => {
  const target = canonicalUrl(toRoute);
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<link rel="canonical" href="${htmlEscape(target)}" />\n<meta http-equiv="refresh" content="0; url=${htmlEscape(target)}" />\n<title>Redirecting…</title>\n</head>\n<body><p>This page moved to <a href="${htmlEscape(target)}">${htmlEscape(target)}</a>.</p></body>\n</html>\n`;
};

const buildSitemap = (posts) => {
  const staticRoutes = ['/', '/about', '/projects', '/experience', '/credentials', '/writing', '/contact'];
  const urls = staticRoutes.map((route) => ({ loc: canonicalUrl(route) }));
  for (const post of posts) {
    // Upvotes change Firestore updateTime without changing the article content.
    urls.push({ loc: canonicalUrl(`/writing/${post.slug}`) });
  }
  const body = urls.map(({ loc, lastmod }) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ''}\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

const validateGenerated = async (posts) => {
  const sitemap = await fs.readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  if (!sitemap.includes(`${ORIGIN}/`) || sitemap.includes('/dashboard/') || sitemap.includes('/journals/')) throw new Error('Generated sitemap failed URL validation.');
  const homepage = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  const schemaMatch = homepage.match(/<script\s+id=["']site-structured-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!schemaMatch) throw new Error('Site structured data is missing from the generated homepage.');
  JSON.parse(schemaMatch[1]);
  if (posts.length) {
    const first = posts[0];
    const article = await fs.readFile(path.join(DIST, 'writing', first.slug, 'index.html'), 'utf8');
    const articleMatch = article.match(/<script\s+id=["']route-structured-data["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!articleMatch) throw new Error('Article structured data is missing from a generated writing page.');
    JSON.parse(articleMatch[1]);
  }
};

await fs.access(path.join(DIST, 'index.html'));
const baseHtml = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
const [settings, posts, projects, certificates, experience] = await Promise.all([
  fetchSiteSettings(), fetchVisibleRecords('posts'), fetchVisibleRecords('projects'), fetchVisibleRecords('certificates'), fetchVisibleRecords('experience'),
]);
const siteSchema = siteSchemaFor(settings);
const publicScenes = publicCanvasScenes(settings.heroCanvas, projects);
settings.heroCanvas = publicScenes.length ? { ...settings.heroCanvas, scenes: publicScenes } : undefined;
const dom = new JSDOM('');
const purifier = createDOMPurify(dom.window);
const sanitizeHtml = html => purifier.sanitize(html, richTextPolicy);
for (const project of projects) if (project.output) project.output = sanitizeHtml(project.output);
const snapshot = { settings, posts, projects, certificates, experience };
const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  mode: 'production',
  ssr: { noExternal: ['react-syntax-highlighter'] },
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
  logLevel: 'error',
});
try {
const { renderPublicPage } = await server.ssrLoadModule('/src/prerender.tsx');
const renderHtml = async (html, route, includeData = true) => {
  const content = await renderPublicPage(canonicalPath(route), snapshot, sanitizeHtml);
  html = html.replace(/<div id="root"><\/div>/, () => `<div id="root">${content}</div>`);
  if (includeData) html = html.replace('</body>', () => `<script id="portfolio-public-data" type="application/json">${jsonForHtml(snapshot)}</script>\n</body>`);
  return html;
};

const staticPages = [
  { route: '/', title: settings.seo?.title || defaults.seo.title, description: settings.seo?.description || defaults.seo.description },
  { route: '/about', title: `Profile — ${settings.shortName || defaults.shortName}`, description: settings.aboutBody || defaults.aboutBody },
  { route: '/projects', title: `Selected work — ${settings.shortName || defaults.shortName}`, description: settings.workIntro || defaults.workIntro },
  { route: '/experience', title: `Experience — ${settings.shortName || defaults.shortName}`, description: settings.experienceIntro || defaults.experienceIntro },
  { route: '/credentials', title: `Credentials & Education — ${settings.shortName || defaults.shortName}`, description: settings.credentialsIntro || defaults.credentialsIntro },
  { route: '/writing', title: `Writing — ${settings.shortName || defaults.shortName}`, description: settings.writingIntro || defaults.writingIntro },
  { route: '/contact', title: `Contact — ${settings.shortName || defaults.shortName}`, description: settings.contactIntro || defaults.contactIntro },
];

for (const page of staticPages) {
  const html = pageHtml(baseHtml, { ...page, siteSchema });
  await writeRoute(page.route, await renderHtml(html, page.route));
}

const dashboardHtml = pageHtml(baseHtml, {
  route: '/dashboard',
  title: 'Private portfolio workspace',
  description: 'Private portfolio management workspace.',
  robots: 'noindex,nofollow,noarchive,nosnippet',
  siteSchema,
});
await writeRoute('/dashboard', dashboardHtml);

for (const post of posts) {
  const description = excerpt(post.content || '') || `Technical field note by ${settings.shortName || defaults.shortName}.`;
  let html = pageHtml(baseHtml, {
    route: `/writing/${post.slug}`,
    title: `${post.title} — ${settings.shortName || defaults.shortName}`,
    description,
    type: 'article',
    siteSchema,
    routeSchema: articleSchemaFor(post, description),
  });
  const published = isoDate(post.date || post.createTime);
  if (published) html = upsertMeta(html, 'property', 'article:published_time', published);
  await writeRoute(`/writing/${post.slug}`, await renderHtml(html, `/writing/${post.slug}`));
}

// GitHub Pages preserves a real HTTP 404 while the normal app renders at the original URL.
const notFound = pageHtml(baseHtml, { route: '/404', title: 'Page not found — Syed Ammar', description: 'Page not found.', robots: 'noindex,follow', siteSchema });
const notFoundHtml = (await renderHtml(notFound, '/404', false)).replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, '');
await fs.writeFile(path.join(DIST, '404.html'), secureHtml(notFoundHtml));

await writeRoute('/achievements', redirectHtml('/achievements', '/credentials'));
await writeRoute('/journals', redirectHtml('/journals', '/writing'));
for (const post of posts) await writeRoute(`/journal/${post.slug}`, redirectHtml(`/journal/${post.slug}`, `/writing/${post.slug}`));

await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
await fs.writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(posts));
await validateGenerated(posts);

console.log(`[seo] Rendered ${staticPages.length} public pages and ${posts.length} writing page(s) with crawlable content, canonical metadata, sitemap.xml and structured data.`);
console.log('[seo] Dashboard stays noindex; missing URLs stay 404; only legacy aliases redirect to canonical pages.');
} finally { await server.close(); dom.window.close(); }
