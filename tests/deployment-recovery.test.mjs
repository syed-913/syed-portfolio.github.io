import assert from 'node:assert/strict';
import test from 'node:test';
import { installDeploymentRecovery } from '../src/lib/deploymentRecovery.ts';

function browserFixture({ online = true, storage = new Map(), storageError = false } = {}) {
  const events = new EventTarget();
  let reloads = 0;
  const browser = {
    navigator: { onLine: online },
    sessionStorage: {
      getItem(key) { if (storageError) throw new Error('Storage unavailable'); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageError) throw new Error('Storage unavailable'); storage.set(key, value); },
    },
    location: { reload() { reloads += 1; } },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
  };
  return {
    browser,
    reloads: () => reloads,
    fail() { const event = new Event('vite:preloadError', { cancelable: true }); events.dispatchEvent(event); return event; },
  };
}

test('an online stale-chunk error refreshes once, including across page reloads', () => {
  const storage = new Map();
  const first = browserFixture({ storage });
  installDeploymentRecovery(first.browser);
  assert.equal(first.fail().defaultPrevented, true);
  assert.equal(first.reloads(), 1);
  assert.equal(first.fail().defaultPrevented, false);
  assert.equal(first.reloads(), 1);
  const reloaded = browserFixture({ storage });
  installDeploymentRecovery(reloaded.browser);
  assert.equal(reloaded.fail().defaultPrevented, false);
  assert.equal(reloaded.reloads(), 0);
});

test('offline errors and unavailable storage keep normal errors without refresh loops', () => {
  for (const fixture of [browserFixture({ online: false }), browserFixture({ storageError: true })]) {
    installDeploymentRecovery(fixture.browser);
    assert.equal(fixture.fail().defaultPrevented, false);
    assert.equal(fixture.reloads(), 0);
  }
});

test('recovery can retry after its cooldown and its listener can be removed', () => {
  const fixture = browserFixture({ storage: new Map([['portfolio:deployment-recovery', String(Date.now() - 61_000)]]) });
  const remove = installDeploymentRecovery(fixture.browser);
  assert.equal(fixture.fail().defaultPrevented, true);
  assert.equal(fixture.reloads(), 1);
  remove();
  assert.equal(fixture.fail().defaultPrevented, false);
  assert.equal(fixture.reloads(), 1);
});
