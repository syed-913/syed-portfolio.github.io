const recoveryKey = 'portfolio:deployment-recovery';
const recoveryInterval = 60_000;

// A tab opened before a deployment may request a lazy chunk that no longer exists.
// Refresh once to pick up the new HTML; retain normal errors if recovery cannot help.
export function installDeploymentRecovery(browser: Window = window) {
  const recover = (event: Event) => {
    if (!browser.navigator.onLine) return;

    try {
      const previous = Number(browser.sessionStorage.getItem(recoveryKey));
      const now = Date.now();
      if (previous > 0 && now - previous < recoveryInterval) return;
      browser.sessionStorage.setItem(recoveryKey, String(now));
    } catch {
      // Without persistent state, reloading could create an endless retry loop.
      return;
    }

    event.preventDefault();
    browser.location.reload();
  };

  browser.addEventListener('vite:preloadError', recover);
  return () => browser.removeEventListener('vite:preloadError', recover);
}
