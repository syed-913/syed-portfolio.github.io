# Security review — 28 October 2026

This is a scoped source, dependency and public deployment review. It is not a penetration-test certificate or a claim that every account setting and live service is secure. Production data, authorization rules and server secrets were not changed.

## Remediations

| Finding | Change | Activation |
| --- | --- | --- |
| npm reported 39 vulnerable dependency entries, including transitive build tooling | Updated compatible packages in the lockfile, raised the Vite 7 minimum to 7.3.7, and applied narrow same-major transitive overrides for Firestore's gRPC dependency and Typography's selector parser | `npm ci` and the normal Pages build |
| Project technical-trace HTML was inserted without sanitization | DOMPurify removes executable markup and document-level controls while preserving prose, code, lists and tables. The browser and build share one policy; jsdom is build/test-only | Normal Pages deployment |
| Static pages lacked an explicit script policy | The build emits a meta Content Security Policy with hashes of the exact trusted inline scripts and JSON, same-origin scripts, no `unsafe-eval`, no objects, no base changes and same-origin form actions. The referrer policy restricts cross-origin referrers | Normal Pages deployment |
| Gemini cache keyed only the final question | Hash the complete upstream payload, including instructions and conversation history, with a new `gemini_v2_` namespace. Raw question text no longer appears in KV keys | Update the existing chatbot Worker |
| Contact endpoint forwarded arbitrary Discord webhook JSON | Reconstruct the known contact embed, disable automatic mentions, ignore caller-supplied identity/attachments/extra payload, and enforce field lengths | Update the existing contact Worker |
| Unbounded or malformed proxy requests, wildcard browser CORS, raw exception text and an AI limit enforced only in the browser | Bound streaming JSON reads, validate text-only envelopes, allow the existing public origins and loopback preview, time out upstream calls, add a server-side AI request budget, and return generic internal errors | Update the existing Workers |

The gRPC override stays in major version 1 and the selector parser stays in major version 6. Do not use `npm audit fix --force`: the suggested older Firebase and Typography versions would be a breaking downgrade. Reevaluate these two narrow overrides when upstream dependencies adopt patched versions. The gRPC Node transport is not shipped in the browser path, but patching the dependency still improves the installed/build dependency tree.

DOMPurify is lazy-loaded with the Projects route, not the homepage startup bundle. The trace policy rejects SVG/MathML, scripts, frames, forms, input controls, style elements, inline styles, document IDs/names and executable URLs. In an unsupported browser it falls back to escaped readable text. Existing published projects had no technical-trace HTML during this review; normal code/table formatting is covered with fixtures.

## Deploy the two existing Worker sources separately

GitHub Pages deployment does **not** deploy Workers. The frontend continues to use the existing endpoint URLs and request/response shapes, so the static-site merge can deploy independently. For the proxy remediations to become active:

1. In Cloudflare, identify the existing contact Worker referenced by `VITE_WEBHOOK_PROXY_URL` or its legacy proxy alias. Preserve its name, route, custom domain, `DISCORD_WEBHOOK_URL` secret and existing bindings. Deploy the updated `cloudflare-worker.js` to that service. It remains a standalone module with no new required secret or binding.
2. If scheduled education reminders have already been activated, retain their existing wrapper entry point and KV bindings. `workers/contact-with-reminders.js` still imports the contact handler and keeps its scheduled handler. Update that application's contact module instead of replacing its entry point with a fetch-only service.
3. Identify the existing chatbot Worker referenced by `VITE_GEMINI_PROXY_URL`. Preserve its name, route, `GEMINI_API_KEY`, `GEMINI_CACHE` and other existing settings. Deploy the updated `cloudflare_worker.js` there. The Gemini model, accepted frontend instruction aliases and response contract stay intact.
4. Both modules accept `https://syedammar.engineer`, its HTTPS `www` alias, and HTTP loopback preview by default. An optional comma-separated `ALLOWED_ORIGINS` setting can enumerate additional approved origins. CORS restricts browsers; it is not authentication and does not stop a non-browser client forging an Origin header.
5. Perform an owner-approved contact submission and one assistant request from the deployed website. Verify a rejected unrelated origin, normal preflight, existing cooldown and Worker error logs. Do not rotate or replace service keys simply to deploy these source fixes.

The new cache namespace ignores old Gemini cache entries immediately; old entries expire under their original TTL. New cache entries depend on the entire request, preventing a question from reusing a response generated for different instructions/history. This does not make an AI answer authoritative or eliminate the need for provider-side controls.

## Verified boundaries and retained limitations

- Anonymous, read-only Firestore queries requesting only document identifiers for `messages`, `chatLogs` and `visits` returned 403. No private document contents were requested. This verifies those query paths at review time, not every possible rule or write. Public records were read using `visible == true`.
- Existing Firebase Authentication, Firestore Security Rules, ImageKit upload-token authentication, Cloudflare bindings and GitHub Actions secrets remain the authorization boundaries. A browser session marker is an additional UI gate, not authorization. No live sign-in, unauthorized write, media mutation or real contact/AI submission was used to test this release.
- Meta CSP cannot enforce `frame-ancestors` or provide HSTS/`X-Content-Type-Options` response headers on GitHub Pages. Those need actual hosting/edge header configuration. No ineffective `_headers` file or pretend meta equivalent was added. `style-src 'unsafe-inline'` remains necessary for the existing motion/style behavior; HTTPS connections remain allowed for the established Firebase/Worker/media integrations.
- The assistant keeps its 15-question browser daily UX limit and adds a best-effort server backstop of 60 upstream requests per UTC day per IP. An optional `AI_DAILY_REQUEST_LIMIT` Worker variable can set 1–1000; no new setting is required. Exact full-context cache hits avoid both provider work and this budget. The AI budget and contact cooldown use Cloudflare's per-data-center Cache API, which is not an atomic global abuse-control system. Set provider quotas and, where available, a Cloudflare rate-limiting rule/binding for strict spending/abuse limits. Those account policies were outside the accessible deployment configuration.
- A static content snapshot is public. Rebuild after hiding/deleting previously public content; do not store private information in public Firestore records or Site copy. The build never queries private message/chat/analytics collections, and its credential projection excludes media deletion identifiers.
- Firebase web config and `VITE_*` proxy addresses are public browser configuration even when supplied through GitHub Secrets. Discord/Gemini/ImageKit private keys, service accounts and Cloudflare tokens must remain server-side. Local environment files remain ignored and were not staged.
- No real private-key, GitHub PAT or raw Discord-webhook credential pattern was found in the reviewed source candidate. Pattern scans do not prove the absence of all secrets or cover remote account settings.

## Validation

The release checks include dependency auditing, malicious trace markup, proxy request limits/origins, contact cooldown/mention suppression, context-separated AI caching, static script hashes, prerendered public content and canonical/missing-route behavior. The PR records the final test/build and browser results. All proxy tests use local mock transports and send no real Discord or Gemini request.
