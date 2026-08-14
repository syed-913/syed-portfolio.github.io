import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const ORIGIN = 'https://syedammar.engineer';

const defaults = {
  name: 'Syed Ammar Hussain',
  shortName: 'Syed Ammar',
  aboutBody: 'I learn by running real systems: breaking things in a homelab, automating repetitive work, reading logs, tracing failures and turning the result into something more reliable. I’m intentionally building breadth toward DevOps, cloud engineering, Kubernetes administration and SRE-oriented work.',
  workIntro: 'Projects are where I turn infrastructure concepts into something I can run, inspect and improve.',
  experienceIntro: 'Professional work, responsibilities and the tools I used along the way.',
  credentialsIntro: 'Certifications, academic learning and formal milestones that document how I keep building depth across infrastructure and technology.',
  writingIntro: 'What I learn becomes easier to keep when I write it down. These are my notes, experiments and technical reflections.',
  contactIntro: 'If you’re hiring, collaborating, or simply want to compare notes, send me a message and I’ll get back to you.',
  currentFocus: 'Kubernetes, Ansible, AWS, Terraform, Grafana, Podman and OPNsense',
  socials: {
    github: 'https://github.com/syed-913',
    linkedin: 'https://www.linkedin.com/in/syed-ammar-hussain/',
    credly: 'https://www.credly.com/users/syed-ammar-hussain.913',
  },
  seo: {
    title: 'Syed Ammar — Infrastructure, Cloud & Operations',
    description: 'Portfolio of Syed Ammar Hussain: Linux systems, cloud infrastructure, DevOps, automation, homelab projects, certifications, education and technical writing.',
  },
  capabilities: [
    { title: 'Linux & systems', tools: ['RHEL', 'Linux', 'Bash', 'systemd', 'Podman'] },
    { title: 'Cloud & infrastructure', tools: ['AWS', 'Terraform', 'Ansible', 'Networking'] },
    { title: 'Containers & platform', tools: ['Docker', 'Podman', 'Kubernetes', 'Helm'] },
    { title: 'Observability & reliability', tools: ['Grafana', 'Prometheus', 'Logs', 'OPNsense'] },
  ],
};

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
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};

const fetchSiteSettings = async () => {
  if (!projectId || !apiKey) return defaults;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/siteSettings/main?key=${encodeURIComponent(apiKey)}`;
    const document = await fetchJson(url);
    const remote = decodeFields(document.fields || {});
    const settings = {
      ...defaults,
      ...remote,
      socials: { ...defaults.socials, ...(remote.socials || {}) },
      seo: { ...defaults.seo, ...(remote.seo || {}) },
      capabilities: Array.isArray(remote.capabilities) && remote.capabilities.length ? remote.capabilities : defaults.capabilities,
    };
    if (implementationDetail.test(settings.contactIntro || '')) settings.contactIntro = defaults.contactIntro;
    if (/(?:about\s+)?(?:~?\s*)?(?:1|one)\s+year.*professional experience/i.test(settings.aboutBody || '')) settings.aboutBody = defaults.aboutBody;
    return settings;
  } catch (error) {
    console.warn(`[seo] Site settings could not be read; using local defaults (${error.message}).`);
    return defaults;
  }
};

const fetchVisiblePosts = async () => {
  if (!projectId || !apiKey) {
    console.warn('[seo] Firebase variables are unavailable; generating static-route SEO only.');
    return [];
  }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(apiKey)}`;
    const rows = await fetchJson(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'posts' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'visible' },
              op: 'EQUAL',
              value: { booleanValue: true },
            },
          },
          select: {
            fields: [
              { fieldPath: 'title' },
              { fieldPath: 'slug' },
              { fieldPath: 'date' },
              { fieldPath: 'tags' },
              { fieldPath: 'content' },
            ],
          },
          limit: 500,
        },
      }),
    });
    return rows
      .filter((row) => row.document?.fields)
      .map((row) => ({
        ...decodeFields(row.document.fields),
        updateTime: row.document.updateTime,
        createTime: row.document.createTime,
      }))
      .filter((post) => typeof post.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) && typeof post.title === 'string');
  } catch (error) {
    console.warn(`[seo] Visible writing entries could not be read; sitemap will contain static routes only (${error.message}).`);
    return [];
  }
};

const canonicalPath = (route = '/') => {
  if (!route || route === '/') return '/';
  return `/${route.replace(/^\/+|\/+$/g, '')}/`;
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
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
};

const upsertCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${htmlEscape(url)}" />`;
  const regex = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
};

const upsertTitle = (html, title) => {
  const tag = `<title>${String(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>`;
  return /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i, tag) : html.replace('</head>', `  ${tag}\n</head>`);
};

const upsertJsonLd = (html, id, data) => {
  const tag = `<script id="${id}" type="application/ld+json">\n${jsonForHtml(data)}\n  </script>`;
  const regex = new RegExp(`<script\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'i');
  if (regex.test(html)) return html.replace(regex, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
};

const removeJsonLd = (html, id) => {
  const regex = new RegExp(`\\s*<script\\s+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`, 'i');
  return html.replace(regex, '');
};

const pageHtml = (baseHtml, { title, description, route, type = 'website', robots = 'index,follow', siteSchema, routeSchema }) => {
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
  const sameAs = [settings.socials?.github, settings.socials?.linkedin, settings.socials?.credly].filter(Boolean);
  const knowsAbout = [...new Set([
    'Linux', 'System Administration', 'DevOps', 'Cloud Infrastructure', 'AWS', 'Terraform', 'Ansible', 'Kubernetes', 'Observability',
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
  const modified = isoDate(post.updateTime);
  if (published) schema.datePublished = published;
  if (modified) schema.dateModified = modified;
  if (Array.isArray(post.tags) && post.tags.length) schema.keywords = post.tags.join(', ');
  return schema;
};

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });
const writeRoute = async (route, html) => {
  const clean = route.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    await fs.writeFile(path.join(DIST, 'index.html'), html);
    return;
  }
  const dir = path.join(DIST, clean);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, 'index.html'), html);
};

const redirectHtml = (fromRoute, toRoute) => {
  const target = canonicalUrl(toRoute);
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<meta name="robots" content="noindex,follow" />\n<link rel="canonical" href="${htmlEscape(target)}" />\n<meta http-equiv="refresh" content="0; url=${htmlEscape(target)}" />\n<title>Redirecting…</title>\n<script>location.replace(${JSON.stringify(target)});</script>\n</head>\n<body><p>This page moved to <a href="${htmlEscape(target)}">${htmlEscape(target)}</a>.</p></body>\n</html>\n`;
};

const buildSitemap = (posts) => {
  const staticRoutes = ['/', '/about', '/projects', '/experience', '/credentials', '/writing', '/contact'];
  const urls = staticRoutes.map((route) => ({ loc: canonicalUrl(route) }));
  for (const post of posts) {
    urls.push({ loc: canonicalUrl(`/writing/${post.slug}`), lastmod: isoDate(post.updateTime)?.slice(0, 10) });
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
const [settings, posts] = await Promise.all([fetchSiteSettings(), fetchVisiblePosts()]);
const siteSchema = siteSchemaFor(settings);

const staticPages = [
  { route: '/', title: settings.seo?.title || defaults.seo.title, description: settings.seo?.description || defaults.seo.description },
  { route: '/about', title: `Profile — ${settings.shortName || defaults.shortName}`, description: settings.aboutBody || defaults.aboutBody },
  { route: '/projects', title: `Work — ${settings.shortName || defaults.shortName}`, description: settings.workIntro || defaults.workIntro },
  { route: '/experience', title: `Experience — ${settings.shortName || defaults.shortName}`, description: settings.experienceIntro || defaults.experienceIntro },
  { route: '/credentials', title: `Credentials & Education — ${settings.shortName || defaults.shortName}`, description: settings.credentialsIntro || defaults.credentialsIntro },
  { route: '/writing', title: `Writing — ${settings.shortName || defaults.shortName}`, description: settings.writingIntro || defaults.writingIntro },
  { route: '/contact', title: `Contact — ${settings.shortName || defaults.shortName}`, description: settings.contactIntro || defaults.contactIntro },
];

for (const page of staticPages) {
  const html = pageHtml(baseHtml, { ...page, siteSchema });
  await writeRoute(page.route, html);
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
  const modified = isoDate(post.updateTime);
  if (published) html = upsertMeta(html, 'property', 'article:published_time', published);
  if (modified) html = upsertMeta(html, 'property', 'article:modified_time', modified);
  await writeRoute(`/writing/${post.slug}`, html);
}

await writeRoute('/achievements', redirectHtml('/achievements', '/credentials'));
await writeRoute('/journals', redirectHtml('/journals', '/writing'));
for (const post of posts) await writeRoute(`/journal/${post.slug}`, redirectHtml(`/journal/${post.slug}`, `/writing/${post.slug}`));

await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
await fs.writeFile(path.join(DIST, 'sitemap.xml'), buildSitemap(posts));
await validateGenerated(posts);

console.log(`[seo] Generated ${staticPages.length} canonical route shells, ${posts.length} writing route shell(s), sitemap.xml, robots.txt and structured data.`);
console.log('[seo] Dashboard is noindex and excluded from the sitemap; legacy routes are noindex redirects.');
