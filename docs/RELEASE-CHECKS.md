# Release validation — 17 October 2026

Local preparation is complete for the existing GitHub Pages site at `https://syedammar.engineer`. This record describes the checks actually performed; GitHub Actions and the production deployment have not been run by this preparation. No files were staged or committed, and no branch was created or pushed.

## Reproducible build

A separate temporary source directory was created from Git-tracked files plus non-ignored new files. It contained no `.git`, local environment files, `node_modules`, `dist`, local design screenshots or prebuilt application cache. The existing public production client settings were supplied to the build process as environment variables, matching the deployment workflow.

| Check | Result |
| --- | --- |
| Fresh `npm ci --no-audit --no-fund` | Passed; 437 packages installed from the existing lockfile |
| `npm run release:check` in the fresh directory | Passed |
| Production configuration guard | Passed for the live Firebase data project and all three proxy settings |
| Focused automated tests | **23 passed**, none failed or skipped |
| TypeScript production compilation | Passed |
| Vite production build | Passed |
| Strict SEO generation using public Firestore reads | Passed; 7 public top-level routes plus 3 article routes, dashboard and supported legacy shells |
| Final static artifact validation | **65 files passed** |
| Working directory's final compiled JS/CSS vs. the clean browser-tested artifact | **34 files match byte for byte** |
| Release-script/test/recovery-module ESLint check | Passed |
| Bash syntax and Git whitespace checks | Passed |
| Workflow YAML parsing and deployment dependency checks | Passed |

The rehearsal used Node **22.19.0**, npm **11.19.0** and the locked Vite **7.3.6**. CI selects the Node 22 line through `.nvmrc`; the minimum supported Node version is 22.18. The dependency lock matches the existing lockfile except for the root Node engine metadata. No dependency version was upgraded.

Artifact checks covered static entry points, production canonicals, public sitemap entries, dashboard noindex, local font and portrait files, HTML/CSS asset references, and exclusion of source/local files and credential patterns. Three source-only image provenance sidecars were removed from the built artifact while retained in source. A candidate source scan found no real private-key or raw Discord webhook patterns; the explicit fake webhook in its rejection test was reviewed as a fixture. Local env files, dependencies, build output and heavy design review artifacts are ignored by Git.

These checks do not assert that repository-wide `npm run lint` is clean. The focused lint command covers this release's scripts, deployment tests and recovery module. The production gates are the tests, TypeScript build, environment validation and artifact checks above.

## Production-browser checks

The **fresh directory's compiled `dist`** was served through a plain static HTTP server with directory-index redirects and real 404 responses. Vite's development server and SPA fallback were not used. Chromium ran headlessly with its sandbox enabled at **1440 × 960** and **390 × 960**.

**138 assertions passed** with zero JavaScript runtime exceptions, missing production chunks or unexpected external mutation attempts. Checks included:

- Direct HTTP 200 entry, production canonical metadata, startup and horizontal overflow checks for every public top-level page, all three published articles and `/dashboard/`.
- Real public Firestore content reads through the unchanged client SDK and its normal session cache. No seeded content or application-source replacement was used.
- Dashboard password gate, noindex and absence from public navigation. Invalid credentials were answered by an intercepted Firebase Auth response; no real login was attempted.
- Dark/light switching and persistence, mobile navigation route selection and refresh.
- Contact payload compatibility, success recovery and rate-limit recovery with the entered message retained.
- Gemini request shape and assistant response rendering, using an intercepted proxy response.
- Static 404 fallback retaining the requested path, query and hash.
- A real document refresh after a simulated Vite preload error, retaining its URL, followed by cooldown behavior that prevents a repeat refresh loop.

The test harness allowed only public Firestore reads to reach Firebase. It intercepted **4** Firestore write requests, **4** contact submissions, **2** chatbot requests and **2** Auth requests. Those counts describe the completed browser run; no corresponding production mutation or provider request was sent. Separate screenshots were captured after the themes settled at both viewport widths. Temporary browser scripts, screenshots and reports are local evidence and are not part of the website artifact.

## Existing service checks

Read-only requests used the production `Origin: https://syedammar.engineer`:

| Existing service | Result |
| --- | --- |
| Contact Worker CORS preflight | HTTP 200; production origin accepted |
| Chatbot Worker CORS preflight | HTTP 200; production origin accepted |
| Media Worker CORS preflight | HTTP 204; production origin accepted |
| Media `/auth` without credentials | HTTP 401; protected |

Only OPTIONS and an unauthenticated GET were used for these service probes. Public Firestore reads during build and browser checks succeeded against **`syed-ammar`**. The optional `siteSettings/main` document is absent in the current live database, so the current source defaults are used. This is an expected fallback, not a migration requirement.

The original contact and chatbot Worker entry files, Firebase web initialization modules, media service module, `firebase.json` and `.firebaserc` were compared with HEAD and remain byte-for-byte unchanged. The optional reminder schedule is isolated in `workers/contact-with-reminders.js`; its tests confirm that it reuses the exact contact fetch handler and that the original entry has no scheduled handler. No reminder activation or backend deployment occurred.

The earlier CSS layout-transition finding was reviewed in the current source: the form styles transition border/background colors, and the native education progress bar has no width transition. No width, height, padding or margin transition remains in `src/index.css`. The finding is already resolved; no design-hook suppression was added and nothing is left pending for that finding.

## Remaining checks that require the owner or an actual deployment

Private GitHub Actions secrets and Pages/Cloudflare account settings were not accessible to this local verification. The deployment guard will stop before artifact upload if required build settings are absent or inconsistent. The current repository workflow deploys only the static site; no authenticated account-level deployment settings outside the repository were changed or inspected.

An owner login, authenticated dashboard reads/writes, ImageKit upload/deletion and an intentional real contact or AI request still require verification on the live origin when the owner chooses to perform them. Local checks preserve their client contracts and authentication boundaries but cannot establish successful live privileged operations without those actions.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the existing Actions settings, review/push commands, live checks and rollback procedure.
