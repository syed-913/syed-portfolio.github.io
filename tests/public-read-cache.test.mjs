import test from 'node:test';
import assert from 'node:assert/strict';
import { PublicReadCache } from '../src/lib/publicReadCache.ts';

const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('simultaneous homepage and assistant reads share one backend request', async () => {
  const cache = new PublicReadCache(storage), request = deferred(); let reads = 0;
  const load = () => { reads++; return request.promise; };
  const a = cache.get('projects', load), b = cache.get('projects', load), c = cache.get('projects', load);
  await Promise.resolve(); assert.equal(reads, 1);
  request.resolve([{ id: 'console' }]);
  assert.deepEqual(await Promise.all([a,b,c]), [[{id:'console'}],[{id:'console'}],[{id:'console'}]]);
});

test('an older request cannot overwrite settings published while it was in flight', async () => {
  const store = storage(), cache = new PublicReadCache(() => store), old = deferred();
  const previous = cache.get('settings', () => old.promise);
  cache.invalidate('settings');
  const current = await cache.get('settings', async () => ({ heroCanvas: { enabled: true, text: 'Updated' } }));
  old.resolve({ heroCanvas: { enabled: false, text: 'Old' } }); await previous;
  assert.deepEqual(cache.read('settings'), current);
  assert.deepEqual(new PublicReadCache(() => store).read('settings'), current);
});

test('a rejected read can retry and never poisons the shared pending request', async () => {
  const cache = new PublicReadCache(storage);
  await assert.rejects(cache.get('projects', async () => { throw new Error('offline'); }), /offline/);
  assert.deepEqual(await cache.get('projects', async () => ['recovered']), ['recovered']);
});

test('settings invalidation preserves unrelated cached portfolio data', async () => {
  const cache = new PublicReadCache(storage);
  await cache.get('projects', async () => ['console']); await cache.get('settings', async () => ['old']);
  cache.invalidate('settings');
  assert.deepEqual(cache.read('projects'), ['console']); assert.equal(cache.read('settings'), null);
});

test('blocked or malformed browser storage does not prevent content reads', async () => {
  const denied = new PublicReadCache(() => { throw new Error('denied'); });
  assert.deepEqual(await denied.get('settings', async () => ['valid']), ['valid']);
  const malformed = new PublicReadCache(() => ({ getItem: () => 'broken json', setItem: () => {} }));
  assert.deepEqual(await malformed.get('settings', async () => ['valid']), ['valid']);
});
