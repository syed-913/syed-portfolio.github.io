const hasValue = value => typeof value === 'string' && value.trim() !== '';
const placeholder = value => /^(?:undefined|null|replace.*|your[-_ ].*|<.*>)$/i.test(value.trim());

export function validateDeploymentEnv(env, expectedProjectId) {
  const errors = [];
  const required = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
  for (const name of required) {
    if (!hasValue(env[name]) || placeholder(env[name])) errors.push(`${name} is missing or still a placeholder.`);
  }
  if (hasValue(env.VITE_FIREBASE_API_KEY) && !/^AIza[0-9A-Za-z_-]{35}$/.test(env.VITE_FIREBASE_API_KEY)) {
    errors.push('VITE_FIREBASE_API_KEY is not a Firebase web API key.');
  }
  if (hasValue(env.VITE_FIREBASE_PROJECT_ID) && expectedProjectId && env.VITE_FIREBASE_PROJECT_ID !== expectedProjectId) {
    errors.push('VITE_FIREBASE_PROJECT_ID differs from the existing live data project in deployment.config.json.');
  }
  if (hasValue(env.VITE_FIREBASE_AUTH_DOMAIN) && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(env.VITE_FIREBASE_AUTH_DOMAIN)) {
    errors.push('VITE_FIREBASE_AUTH_DOMAIN must be a hostname, without a protocol or path.');
  }
  if (hasValue(env.VITE_FIREBASE_APP_ID) && !/^1:\d+:web:[a-z0-9]+$/i.test(env.VITE_FIREBASE_APP_ID)) {
    errors.push('VITE_FIREBASE_APP_ID must be the existing Firebase web app ID.');
  }

  const urls = {
    contact: env.VITE_WEBHOOK_PROXY_URL || env.VITE_DISCORD_WEBHOOK_URL,
    chatbot: env.VITE_GEMINI_PROXY_URL,
    media: env.VITE_MEDIA_WORKER_URL,
  };
  const names = { contact: 'VITE_WEBHOOK_PROXY_URL (or legacy VITE_DISCORD_WEBHOOK_URL)', chatbot: 'VITE_GEMINI_PROXY_URL', media: 'VITE_MEDIA_WORKER_URL' };
  for (const [service, value] of Object.entries(urls)) {
    if (!hasValue(value) || placeholder(value)) {
      errors.push(`${names[service]} is missing or still a placeholder.`);
      continue;
    }
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password || /^(?:localhost|127\.|0\.0\.0\.0|\[::1\])/.test(url.hostname) || /(?:^|\.)example\.(?:com|invalid|org|net)$/.test(url.hostname)) {
        errors.push(`${names[service]} must be a production HTTPS proxy URL without embedded credentials.`);
      }
      if (service === 'contact' && /(?:^|\.)(?:discord|discordapp)\.com$/i.test(url.hostname)) {
        errors.push('The contact URL points directly to Discord. Keep the real webhook in the Cloudflare Worker secret and expose only its proxy URL.');
      }
    } catch {
      errors.push(`${names[service]} is not a valid URL.`);
    }
  }
  for (const [name, value] of Object.entries(env)) {
    if (['VITE_WEBHOOK_PROXY_URL', 'VITE_DISCORD_WEBHOOK_URL'].includes(name) && hasValue(value) && /^https?:\/\/(?:[^/]+\.)?(?:discord|discordapp)\.com\//i.test(value)) {
      errors.push(`${name} must contain a proxy URL, never the real Discord webhook.`);
    }
    if (name.startsWith('VITE_') && hasValue(value) && /SECRET|PRIVATE|PASSWORD|API_TOKEN|ACCESS_TOKEN|GEMINI_API_KEY/.test(name)) {
      errors.push(`${name} is a server credential name. VITE_ variables are public browser configuration.`);
    }
  }
  return errors;
}
