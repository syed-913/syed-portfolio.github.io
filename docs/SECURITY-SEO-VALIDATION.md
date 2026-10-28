# Security, SEO and documentation validation — 28 October 2026

This release was prepared on `codex/security-seo-docs` from merged main `ade6dbb`. The existing visual identity and layouts are preserved. Deployment remains through the existing GitHub Pages workflow; no Worker, database rule, credential or production account setting was deployed or changed.

| Check | Result |
| --- | --- |
| Clean `npm ci` using the updated lockfile | Passed |
| `npm audit` over the installed dependency tree | 0 known advisories at review time; initially 39 vulnerable dependency entries |
| Strict `npm run release:check` | Passed configuration validation, 45 tests, TypeScript, build, public data generation and artifact checks |
| Final production build after canonical-link cleanup | Passed |
| Artifact validation | 73 files; canonical direct routes, rendered public content, sitemap consistency, noindex dashboard/404, snapshot field boundaries, scripts, fonts/images, asset paths and credential-pattern hygiene |
| Focused ESLint on new/changed helpers, renderer, sanitizer and SEO/security test scripts | Passed; this is not a claim of repository-wide lint cleanliness |
| Headless Chrome browser checks | 66 passed; no uncaught browser exceptions or unexpected CSP violations |
| `git diff --check` | Passed |

The browser checks ran against the actual production artifact on a local server that models GitHub Pages directory redirects and 404 behavior. They covered direct HTTP 200 responses and matching canonical tags for all ten sitemap URLs, desktop and mobile overflow, canonical mobile navigation, project disclosure, the private password/noindex gate, real 404 status without URL replacement, and initial content with JavaScript disabled. Six public routes were explicitly checked in JavaScript-disabled Chrome. Dark and light captures were visually inspected; case-detail metadata was checked against desktop/mobile computed styles.

Normal assistant opening and a mocked reply, plus a mocked contact submission, verified the existing frontend request contracts. These tests intercepted delivery and private write transports; they did not send a real Discord message, invoke Gemini or exercise authenticated content/media mutations. Separate Worker unit tests use local mock transports for sanitization, streaming limits, origin checks, contact cooldown, mention suppression, full-context cache keys, AI budget and the text-only upstream envelope.

The browser intentionally attempted one untrusted inline script. CSP blocked it, producing the expected `script-src-elem` violation. The normal application had no policy violations before that test. The policy still allows the existing Firebase, Worker and ImageKit HTTPS paths and the inline styles used by motion.

Anonymous read-only Firestore queries for identifiers in `messages`, `chatLogs` and `visits` returned 403. No private content was requested. Live public HTTP checks confirmed the expected HTTP→HTTPS, www→apex and slashless→directory redirects. Exact examples from the private Search Console report were unavailable, so this release does not claim that every reported example was individually verified or that Google has already indexed the pages.

Local review evidence remains ignored under `.impeccable/review/security-seo/`. The initial harness used an incorrect assistant input selector; it was corrected. A computed-style check then corrected the documentation's mobile case-prose value to the actual 14px. The final 66-check pass is green. An assistant arrival frame is labeled separately from its settled capture, and screenshots are named for their actual theme.

After merge and a successful Pages deployment, follow [Search Console steps](SEARCH-CONSOLE.md). Apply [the existing Worker source updates](SECURITY-REVIEW.md#deploy-the-two-existing-worker-sources-separately) separately for the backend mitigations to become active. Google indexing and live authenticated media/save flows remain deployment/account-level checks.
