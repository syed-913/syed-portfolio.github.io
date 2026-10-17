import { spawnSync } from 'node:child_process';

if (!process.env.npm_execpath) throw new Error('Run this check with npm run release:check.');

for (const args of [['run', 'check:deploy-env'], ['test'], ['run', 'build']]) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
    stdio: 'inherit',
    env: { ...process.env, SEO_STRICT: '1' },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
