import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import contact from '../cloudflare-worker.js';
import assistant from '../cloudflare_worker.js';
import { secureHtml } from '../scripts/html-security.mjs';
import { canonicalPath, publicPageLink } from '../src/lib/siteUrl.ts';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { richTextPolicy } from '../src/lib/richTextPolicy.ts';

const origin = 'https://syedammar.engineer';
const message = { embeds: [{ title: 'New Message from Visitor', fields: [{ name: 'Email', value: 'visitor@example.test' }, { name: 'Subject', value: 'A role' }, { name: 'Message', value: 'Hello @everyone' }] }] };
const question = { contents: [{ role: 'user', parts: [{ text: 'What should I read?' }] }], system_instruction: { parts: [{ text: 'Visitor portfolio context' }] } };
const request = (body, source = origin) => new Request('https://proxy.example.test', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: source, 'CF-Connecting-IP': '192.0.2.1' }, body: JSON.stringify(body) });

function transport(t) {
  const originalFetch = globalThis.fetch, originalCaches = globalThis.caches;
  const sent = [], stored = new Map(), work = [];
  globalThis.caches = { default: { match: async url => stored.get(String(url))?.clone(), put: async (url, response) => { stored.set(String(url), response.clone()); } } };
  globalThis.fetch = async (url, options) => {
    sent.push({ url, body: JSON.parse(options.body) });
    return String(url).includes('discord') ? new Response(null, { status: 204 }) : Response.json({ candidates: [{ content: { parts: [{ text: `Reply ${sent.length}` }] } }] });
  };
  t.after(() => { globalThis.fetch = originalFetch; globalThis.caches = originalCaches; });
  const values = new Map();
  return {
    sent, stored, values,
    ctx: { waitUntil: promise => work.push(promise) },
    settle: () => Promise.all(work),
    env: { DISCORD_WEBHOOK_URL: 'https://discord.example.test/delivery', GEMINI_API_KEY: 'fixture-key', GEMINI_CACHE: { get: async key => values.get(key), put: async (key, value) => { values.set(key, value); } } },
  };
}

test('contact reconstructs the form, disables Discord mentions and retains its cooldown', async t => {
  const f = transport(t);
  const body = { ...message, content: '@everyone', allowed_mentions: { parse: ['everyone'] }, username: 'Impersonated sender', attachments: [{ url: 'https://example.test/file' }] };
  const result = await contact.fetch(request(body), f.env);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), origin);
  assert.deepEqual(f.sent[0].body.allowed_mentions, { parse: [] });
  assert.equal(f.sent[0].body.content, undefined);
  assert.equal(f.sent[0].body.username, undefined);
  assert.equal(f.sent[0].body.attachments, undefined);
  assert.equal(f.sent[0].body.embeds[0].fields[2].value, 'Hello @everyone');
  const limited = await contact.fetch(request(message), f.env);
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  assert.equal(f.sent.length, 1);
});

test('contact rejects malformed or oversized payloads before calling Discord', async t => {
  const f = transport(t);
  for (const body of [null, {}, { content: 'Arbitrary webhook use' }, { embeds: [{ ...message.embeds[0], fields: [{ name: 'Message', value: 'x'.repeat(1025) }] }] }]) {
    assert.equal((await contact.fetch(request(body), f.env)).status, 400);
  }
  assert.equal((await contact.fetch(request({ value: 'x'.repeat(17 * 1024) }), f.env)).status, 413);
  assert.equal(f.sent.length, 0);
});

test('both proxies reject unrelated browser origins, accept the site and support local preview', async t => {
  const f = transport(t);
  for (const worker of [contact, assistant]) {
    const blocked = await worker.fetch(request({}, 'https://unrelated.example'), f.env, f.ctx);
    assert.equal(blocked.status, 403);
    assert.equal(blocked.headers.get('Access-Control-Allow-Origin'), null);
    const preflight = await worker.fetch(new Request('https://proxy.example', { method: 'OPTIONS', headers: { Origin: 'http://127.0.0.1:5173' } }), f.env, f.ctx);
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://127.0.0.1:5173');
  }
  assert.equal(f.sent.length, 0);
});

test('assistant cache separates conversations and instructions, with no raw prompt in its keys', async t => {
  const f = transport(t);
  assert.equal((await assistant.fetch(request(question), f.env, f.ctx)).status, 200);
  await f.settle();
  assert.equal(f.sent.length, 1);
  await assistant.fetch(request(question), f.env, f.ctx);
  assert.equal(f.sent.length, 1, 'An identical full request can reuse its response');
  const otherMode = { ...question, system_instruction: { parts: [{ text: 'Recruiter portfolio context' }] } };
  await assistant.fetch(request(otherMode), f.env, f.ctx);
  const otherHistory = { ...question, contents: [{ role: 'model', parts: [{ text: 'A different prior exchange' }] }, ...question.contents] };
  await assistant.fetch(request(otherHistory), f.env, f.ctx);
  await f.settle();
  assert.equal(f.sent.length, 3, 'Same last question does not reuse another context');
  assert.equal(f.values.size, 3);
  for (const key of f.values.keys()) assert.match(key, /^gemini_v2_[a-f0-9]{64}$/);
  assert.equal(f.sent[0].body.generationConfig.maxOutputTokens, 500);
});

test('assistant rejects invalid envelopes and does not reveal internal exception messages', async t => {
  const f = transport(t);
  for (const body of [null, {}, { contents: [] }, { contents: [{ role: 'admin', parts: [{ text: 'hello' }] }] }, { ...question, system_instruction: { parts: [{ text: 'x'.repeat(64_001) }] } }]) {
    assert.equal((await assistant.fetch(request(body), f.env, f.ctx)).status, 400);
  }
  assert.equal((await assistant.fetch(request({ content: 'x'.repeat(130 * 1024) }), f.env, f.ctx)).status, 413);
  assert.equal(f.sent.length, 0);
  globalThis.fetch = async () => { throw new Error('private-provider-detail'); };
  const failed = await assistant.fetch(request(question), f.env, f.ctx);
  assert.equal(failed.status, 500);
  assert.doesNotMatch(await failed.text(), /private-provider-detail/);
});

test('assistant enforces a server budget before paid upstream work and still serves cached answers', async t => {
  const f = transport(t);
  f.env.AI_DAILY_REQUEST_LIMIT = '1';
  assert.equal((await assistant.fetch(request(question), f.env, f.ctx)).status, 200);
  await f.settle();
  const different = { ...question, contents: [{ role: 'user', parts: [{ text: 'Another question' }] }] };
  const limited = await assistant.fetch(request(different), f.env, f.ctx);
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);
  assert.equal(f.sent.length, 1);
  assert.equal((await assistant.fetch(request(question), f.env, f.ctx)).status, 200);
  assert.equal(f.sent.length, 1);
});

test('assistant forwards only the supported text contract, not injected tools or file payloads', async t => {
  const f = transport(t);
  const body = { ...question, contents: [{ role: 'user', parts: [{ text: 'Evidence?', fileData: { fileUri: 'https://unrelated.example/private' } }] }], tools: [{ functionDeclarations: [{ name: 'untrusted-tool' }] }] };
  assert.equal((await assistant.fetch(request(body), f.env, f.ctx)).status, 200);
  assert.deepEqual(f.sent[0].body.contents, [{ role: 'user', parts: [{ text: 'Evidence?' }] }]);
  assert.equal(f.sent[0].body.tools, undefined);
  assert.equal(f.sent[0].body.system_instruction.role, 'system');
  await f.settle();
});

test('deployed HTML hashes exact inline scripts while blocking untrusted script and object execution', () => {
  const script = 'document.documentElement.dataset.theme="dark";';
  const html = secureHtml(`<!doctype html><head><meta charset="UTF-8"><script>${script}</script></head>`);
  const hash = createHash('sha256').update(script).digest('base64');
  assert.ok(html.includes(`'sha256-${hash}'`));
  assert.match(html, /object-src 'none'; base-uri 'none'; form-action 'self'/);
  assert.doesNotMatch(html, /script-src[^;]*'unsafe-inline'|'unsafe-eval'/);
  assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script>'));
  assert.match(html, /strict-origin-when-cross-origin/);
});

test('canonical links preserve anchors and files while pointing pages at their final URLs', () => {
  assert.equal(canonicalPath('/writing/note?source=a#part'), '/writing/note/');
  assert.equal(publicPageLink('/projects#console'), '/projects/#console');
  assert.equal(publicPageLink('/writing/a-note?source=a#part'), '/writing/a-note/?source=a#part');
  for (const value of ['/fonts/body.woff2', '/images/photo.webp', '#part', 'https://example.test/about']) assert.equal(publicPageLink(value), value);
});

test('technical trace sanitization preserves code and tables while removing executable markup', () => {
  const dom = new JSDOM('');
  try {
    const purify = createDOMPurify(dom.window);
    const dirty = '<pre><code class="language-bash">id visitor</code></pre><table><tr><td>Passed</td></tr></table><script>alert(1)</script><svg onload="alert(2)"></svg><iframe src="https://unrelated.example"></iframe><a href="javascript:alert(3)" target="_blank" style="position:fixed" id="main-content">Click</a><form action="https://unrelated.example"><input name="password"></form>';
    const clean = purify.sanitize(dirty, richTextPolicy);
    assert.match(clean, /<pre><code class="language-bash">id visitor<\/code><\/pre>/);
    assert.match(clean, /<td>Passed<\/td>/);
    assert.doesNotMatch(clean, /<script|<svg|<iframe|javascript:|onload=|style=|id=|target=|<form|<input/i);
  } finally { dom.window.close(); }
});
