import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDeploymentEnv } from '../scripts/deployment-env.mjs';

const valid = {
  VITE_FIREBASE_API_KEY: `AIza${'x'.repeat(35)}`,
  VITE_FIREBASE_AUTH_DOMAIN: 'project-id.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'project-id',
  VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef123',
  VITE_WEBHOOK_PROXY_URL: 'https://contact.workers.dev',
  VITE_GEMINI_PROXY_URL: 'https://assistant.workers.dev',
  VITE_MEDIA_WORKER_URL: 'https://media.workers.dev',
};

test('release accepts the existing three HTTPS proxies and legacy contact-proxy alias', () => {
  assert.deepEqual(validateDeploymentEnv(valid, 'project-id'), []);
  const { VITE_WEBHOOK_PROXY_URL, ...legacy } = valid;
  assert.deepEqual(validateDeploymentEnv({ ...legacy, VITE_DISCORD_WEBHOOK_URL: VITE_WEBHOOK_PROXY_URL }, 'project-id'), []);
});

test('release stops for missing integration settings, malformed Firebase config or a different data project', () => {
  for (const name of ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID', 'VITE_GEMINI_PROXY_URL', 'VITE_MEDIA_WORKER_URL', 'VITE_WEBHOOK_PROXY_URL']) {
    assert.ok(validateDeploymentEnv({ ...valid, [name]: '' }, 'project-id').length, name);
  }
  assert.ok(validateDeploymentEnv(valid, 'different-project').some(error => error.includes('live data project')));
  assert.ok(validateDeploymentEnv({ ...valid, VITE_FIREBASE_APP_ID: 'not-an-app-id' }, 'project-id').length);
  assert.ok(validateDeploymentEnv({ ...valid, VITE_FIREBASE_API_KEY: 'your-api-key' }, 'project-id').length);
});

test('release rejects local, placeholder, insecure and credential-bearing endpoint URLs', () => {
  for (const url of ['http://contact.workers.dev', 'https://localhost/api', 'https://127.0.0.1/api', 'https://[::1]/api', 'https://user:password@contact.workers.dev', 'https://example.com/api', 'REPLACE_WITH_URL']) {
    assert.ok(validateDeploymentEnv({ ...valid, VITE_WEBHOOK_PROXY_URL: url }, 'project-id').length, url);
  }
});

test('a raw Discord webhook or private provider credential cannot enter browser configuration', () => {
  const webhook = 'https://discord.com/api/webhooks/123456789/fake-test-value';
  assert.ok(validateDeploymentEnv({ ...valid, VITE_WEBHOOK_PROXY_URL: webhook }, 'project-id').length);
  assert.ok(validateDeploymentEnv({ ...valid, VITE_DISCORD_WEBHOOK_URL: webhook }, 'project-id').length);
  for (const name of ['VITE_GEMINI_API_KEY', 'VITE_IMAGEKIT_PRIVATE_KEY', 'VITE_CLOUDFLARE_API_TOKEN']) {
    const errors = validateDeploymentEnv({ ...valid, [name]: 'fake-test-credential' }, 'project-id');
    assert.ok(errors.some(error => error.includes(name)));
    assert.ok(errors.every(error => !error.includes('fake-test-credential')));
  }
});
