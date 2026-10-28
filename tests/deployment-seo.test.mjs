import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const generator = fileURLToPath(new URL('../scripts/generate-seo.mjs', import.meta.url));
const document = fields => ({ fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, { stringValue: value }])) });

async function generate(t, { strict = false, failPosts = false } = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-seo-test-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.mkdir(path.join(directory, 'dist'));
  await fs.writeFile(path.join(directory, 'dist/index.html'), '<!doctype html><html><head><meta charset="UTF-8" /><title>Base</title><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>');
  const title = 'A title </script><script>alert("fixture")</script> & evidence';
  const posts = [
    { document: { ...document({ title, slug: 'safe-article', content: 'A **public** article.', date: '2026-10-17' }), updateTime: '2026-10-17T00:00:00Z' } },
    { document: document({ title: 'Unsafe path', slug: '../../dashboard' }) },
  ];
  const hook = path.join(directory, 'transport.mjs');
  await fs.writeFile(hook, `globalThis.fetch=async(url,options={})=>{if(String(url).includes(':runQuery')){const query=JSON.parse(options.body).structuredQuery;if(query.where.fieldFilter.field.fieldPath!=='visible'||query.where.fieldFilter.value.booleanValue!==true)throw new Error('Public visibility filter is required');if(query.select.fields.some(field=>/mediaFileId|password|email|private/i.test(field.fieldPath)))throw new Error('A private field entered the public build');return new Response(JSON.stringify(query.from[0].collectionId==='posts'?${failPosts ? '{error:"unavailable"}' : JSON.stringify(posts)}:[]),{status:${failPosts ? 503 : 200}})}return new Response('{}',{status:404})};`);
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--import', hook, generator], {
    cwd: directory,
    encoding: 'utf8',
    env: { ...process.env, VITE_FIREBASE_PROJECT_ID: 'fixture-project', VITE_FIREBASE_API_KEY: 'fixture-public-key', SEO_STRICT: strict ? '1' : '' },
    timeout: 20_000,
  });
  return { directory, result, title };
}

test('production route generation keeps direct pages, noindex dashboard and safe public article paths', async t => {
  const { directory, result, title } = await generate(t, { strict: true });
  assert.equal(result.status, 0, result.stderr);
  for (const route of ['about', 'projects', 'experience', 'credentials', 'writing', 'contact', 'dashboard']) {
    await fs.access(path.join(directory, 'dist', route, 'index.html'));
  }
  const dashboard = await fs.readFile(path.join(directory, 'dist/dashboard/index.html'), 'utf8');
  assert.match(dashboard, /content="noindex,nofollow,noarchive,nosnippet"/);
  const sitemap = await fs.readFile(path.join(directory, 'dist/sitemap.xml'), 'utf8');
  assert.match(sitemap, /writing\/safe-article\//);
  assert.doesNotMatch(sitemap, /dashboard|\.\.\//);
  const article = await fs.readFile(path.join(directory, 'dist/writing/safe-article/index.html'), 'utf8');
  const json = article.match(/<script id="route-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json).headline, title);
  assert.doesNotMatch(json, /<\/script>/);
  assert.match(article, /&lt;\/script&gt;/);
  assert.match(article, /<h1[^>]*>A title/);
  assert.match(article, /A <strong>public<\/strong> article/);
  assert.match(article, /id="portfolio-public-data"/);
  assert.match(article, /Content-Security-Policy/);
  assert.doesNotMatch(article, /script-src[^";]*'unsafe-inline'/);
  const home = await fs.readFile(path.join(directory, 'dist/index.html'), 'utf8');
  assert.match(home, /Linux.*Cloud.*Security/);
  assert.doesNotMatch(home, /<div id="root"><\/div>/);
  assert.match(home, /href="\/about\/"/);
  const notFound = await fs.readFile(path.join(directory, 'dist/404.html'), 'utf8');
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /content="noindex,follow"/);
  assert.doesNotMatch(notFound, /location\.replace|sessionStorage\.redirect|http-equiv="refresh"|rel="canonical"/);
  const alias = await fs.readFile(path.join(directory, 'dist/journals/index.html'), 'utf8');
  assert.match(alias, /http-equiv="refresh" content="0; url=https:\/\/syedammar.engineer\/writing\/"/);
  assert.doesNotMatch(alias, /noindex/);
});

test('release SEO fails closed on backend read failure; optional local builds retain static routes', async t => {
  const strict = await generate(t, { strict: true, failPosts: true });
  assert.notEqual(strict.result.status, 0);
  assert.match(strict.result.stderr, /Public writing read failed/);
  const optional = await generate(t, { failPosts: true });
  assert.equal(optional.result.status, 0, optional.result.stderr);
  await fs.access(path.join(optional.directory, 'dist/dashboard/index.html'));
  assert.doesNotMatch(await fs.readFile(path.join(optional.directory, 'dist/sitemap.xml'), 'utf8'), /writing\/safe-article/);
});
