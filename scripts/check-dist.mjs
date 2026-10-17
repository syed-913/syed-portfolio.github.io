import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const { origin } = JSON.parse(await fs.readFile(new URL('../deployment.config.json', import.meta.url), 'utf8'));
const routes = ['/', '/about/', '/projects/', '/experience/', '/credentials/', '/writing/', '/contact/', '/dashboard/'];
const errors = [];
const files = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) errors.push(`Symbolic link in artifact: ${path.relative(root, file)}`);
    else if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}
await walk(root);
const exists = async file => { try { await fs.access(path.join(root, file)); return true; } catch { return false; } };
for (const file of ['index.html', '404.html', '.nojekyll', 'sitemap.xml', 'robots.txt', 'favicon.svg', 'profile-avatar.webp', 'profile-avatar-nav.webp', 'images/profile-portrait.webp', 'images/profile-portrait.png', 'fonts/catamaran-latin.woff2', 'fonts/public-sans-latin.woff2', 'fonts/jetbrains-mono-latin.woff2']) {
  if (!await exists(file)) errors.push(`Required production file is missing: ${file}`);
}
const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
for (const route of routes) {
  const file = path.join(root, route, 'index.html');
  let html;
  try { html = await fs.readFile(file, 'utf8'); } catch { errors.push(`Direct-entry route shell is missing: ${route}`); continue; }
  if (!html.includes(`${origin}${route}`)) errors.push(`Canonical metadata is missing for ${route}`);
  if (route === '/dashboard/' && !/<meta[^>]+name=["']robots["'][^>]+content=["']noindex/i.test(html)) errors.push('Dashboard must be noindex before JavaScript loads.');
}
for (const url of urls) {
  const parsed = new URL(url);
  if (parsed.origin !== origin || /^\/(?:dashboard|journal|journals|achievements|resume)(?:\/|$)/.test(parsed.pathname)) errors.push('Sitemap contains a non-canonical or private route.');
  if (!await exists(path.join(parsed.pathname, 'index.html'))) errors.push(`Sitemap route has no static shell: ${parsed.pathname}`);
}
for (const route of routes.filter(route => route !== '/dashboard/')) if (!urls.includes(`${origin}${route}`)) errors.push(`Public route missing from sitemap: ${route}`);

for (const file of files) {
  const relative = path.relative(root, file);
  if (/(?:^|[/\\])(?:\.env(?:\..*)?|node_modules|\.git|\.impeccable|workers|tests)(?:[/\\]|$)|\.(?:png|webp|jpe?g|avif)\.json$/i.test(relative)) errors.push(`Source/local file leaked into artifact: ${relative}`);
  if (!/\.(?:js|css|html|json|xml|txt)$/.test(file)) continue;
  const text = await fs.readFile(file, 'utf8');
  if (/https?:\/\/(?:discord|discordapp)\.com\/api\/webhooks\/\d+\//.test(text) || /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]{40,}?-----END (?:RSA |EC )?PRIVATE KEY-----/.test(text)) errors.push(`Server credential pattern in ${relative}`);
  if (/\/tmp\/(?:portfolio|syed-portfolio)|__fixtureWrites|http:\/\/127\.0\.0\.1:517[34]|local-published-content-preview/.test(text)) errors.push(`Local QA code leaked into ${relative}`);
  if (/\.(?:html|css)$/.test(file)) {
    const references = /\.html$/.test(file)
      ? [...text.matchAll(/(?:src|href)=["'](\/(?!\/)[^"'#?]+\.(?:js|css|woff2|png|webp|svg))["']/g)].map(match => match[1])
      : [...text.matchAll(/url\(["']?(\/(?!\/)[^)"'#?]+)["']?\)/g)].map(match => match[1]);
    for (const reference of references) if (!await exists(reference)) errors.push(`Missing asset ${reference} referenced by ${relative}`);
  }
}
if (errors.length) {
  for (const error of [...new Set(errors)]) console.error(`[dist] ${error}`);
  process.exitCode = 1;
} else console.log(`[dist] ${files.length} files validated: direct routes, sitemap, dashboard noindex, fonts/images, asset paths and release hygiene pass.`);
