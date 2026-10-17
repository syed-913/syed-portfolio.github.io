import fs from 'node:fs/promises';
import { loadEnv } from 'vite';
import { validateDeploymentEnv } from './deployment-env.mjs';

const env = loadEnv('production', process.cwd(), 'VITE_');
const config = JSON.parse(await fs.readFile('deployment.config.json', 'utf8'));
const errors = validateDeploymentEnv(env, config.firebaseProjectId);
if (errors.length) {
  console.error('[release] Deployment configuration is incomplete:');
  for (const error of errors) console.error(`- ${error}`);
  console.error('[release] Set the existing public client configuration/proxy URLs in GitHub Actions secrets or an ignored local env file. No values were printed.');
  process.exitCode = 1;
} else {
  console.log('[release] Firebase project, dashboard configuration and all three HTTPS proxy settings pass. No values were printed.');
}
