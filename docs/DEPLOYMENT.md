# Deploying the portfolio safely

This release targets the existing GitHub Pages site at **https://syedammar.engineer**. It keeps the current layouts and palette. The artifact is a static React application; existing Firebase, Cloudflare and ImageKit services continue to run separately.

## What a push does

`.github/workflows/deploy.yml` runs on a push to `main` or manual dispatch. It uses Node 22 from `.nvmrc`, installs the lockfile with `npm ci`, validates the production configuration, runs tests, type-checks and builds the site. The build generates static route shells and a sitemap, removes source-only image provenance sidecars from `dist`, and checks that required routes, assets and indexing metadata are present. Only a successful build can upload and deploy the Pages artifact.

The workflow does not run Wrangler, Firebase deployment commands, database migrations or ImageKit administration. It does not switch a Worker entry point or activate a reminder schedule. No deployment dependency or package version was upgraded for this preparation; the root lockfile metadata records the Node requirement.

Pull requests to `main` run `.github/workflows/check.yml`: tests and TypeScript checks without production secrets or deployment permissions. The production build uses the existing secrets only on the deployment workflow.

## Existing production settings

Keep the repository's **Settings → Pages → Source** set to **GitHub Actions** and its existing custom domain set to `syedammar.engineer`. Keep the current DNS and HTTPS settings. Vite's `base: '/'` is correct for this custom domain. A future deployment below a repository subpath would need deliberate changes to the router, asset paths, redirects and SEO configuration.

`deployment.config.json` records the canonical origin and the verified live Firebase **data** project, `syed-ammar`. The `.firebaserc` file points at a different, legacy Firebase Hosting project (`portfolio-web-f4f44`). It is preserved because it may serve a separate purpose. GitHub Pages does not use that file. Do not run `firebase deploy` as part of this site release.

In **Settings → Secrets and variables → Actions**, preserve the following existing repository or appropriately scoped environment secrets. The deploy workflow reads them by these exact names:

| Name | Value to retain |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | The existing Firebase web API key for the live project |
| `VITE_FIREBASE_AUTH_DOMAIN` | The existing Firebase Auth hostname, without a protocol or path |
| `VITE_FIREBASE_PROJECT_ID` | `syed-ammar` |
| `VITE_FIREBASE_APP_ID` | The existing Firebase web application ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Existing web configuration, if populated |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Existing web configuration, if populated |
| `VITE_FIREBASE_MEASUREMENT_ID` | Existing web configuration, if populated |
| `VITE_WEBHOOK_PROXY_URL` | Public HTTPS URL of the existing contact Worker |
| `VITE_DISCORD_WEBHOOK_URL` | Legacy alias for the same contact **proxy** URL; sufficient when `VITE_WEBHOOK_PROXY_URL` is absent |
| `VITE_GEMINI_PROXY_URL` | Public HTTPS URL of the existing chatbot Worker |
| `VITE_MEDIA_WORKER_URL` | Public HTTPS URL of the existing media Worker |
| `VITE_ADMIN_EMAIL` | Optional existing Firebase administrator email; the established compatibility account remains the fallback |

The storage, sender and measurement settings are optional for the current paths. The four Firebase settings at the top and all three effective proxy URLs are required by the release guard. A populated preferred contact URL takes precedence over its legacy alias. No new webhook or proxy is required.

Values prefixed with `VITE_` are compiled into public browser JavaScript. The Firebase **web** configuration and proxy addresses belong there. The real Discord webhook, Gemini API key, ImageKit private key, Firebase service-account credentials and Cloudflare API tokens belong in their server services. The guard rejects direct Discord webhook URLs and server credential names in public configuration, without printing their values.

Private GitHub Actions secrets were not accessible during local preparation. If a required value is missing or the Firebase project is wrong, the workflow fails before the artifact upload and the successful deployment remains in place. Restore the existing value from the owner's service settings; do not invent a replacement project or key.

If secrets currently exist only on the `github-pages` environment, make the required public build configuration available to the **build** job as repository secrets. The build job is separate from the environment-scoped deploy job and cannot read secrets scoped only to that deploy job.

## Local release check

```sh
nvm use
npm ci
npm run release:check
git diff --check
git status --short
```

The project requires Node 22.18 or newer. Use the Node 22 line recorded in `.nvmrc` for parity with Actions. An ignored `.env.local` or `.env.production.local` can provide the existing public settings locally; `.env.example` lists the names. Process environment variables take precedence, matching CI.

`release:check` always enables strict SEO generation. It must be able to read public settings and visible writing from Firestore. An absent optional `siteSettings/main` document uses the current source defaults. A failed public read stops the release instead of silently publishing an incomplete sitemap. A normal `npm run build` allows a local static fallback when public data is unavailable, so use `release:check` for the final gate.

The output directory is `dist`. Do not publish the source tree, `node_modules`, `.env` files, `.impeccable` design evidence, tests or Worker source as the website. Generated image provenance JSON files remain in source beside their assets, but the build excludes them from the deployed artifact. Local review images, screenshots, mocks and test reports are ignored by Git.

## Review and push

All application modules, local fonts and portraits, build scripts, tests, `deployment.config.json`, `.nvmrc`, workflow files, docs and optional Worker source must be committed together. Committing only `src` and `public` would omit the release configuration needed by CI.

A branch and pull request provide a review point before `main` deploys. The following commands are for the owner to run after reviewing the changes:

```sh
git switch -c codex/portfolio-release
git add -A
git diff --cached --stat
git diff --cached --check
git status --short
git commit -m "Refine portfolio and validate GitHub Pages deployment"
git push -u origin codex/portfolio-release
```

Review the staged file list before committing. Local environment files, `dist`, `node_modules` and heavy design review artifacts should not appear. Open a pull request to `main`; merge when the checks and review are satisfactory. The Pages workflow then builds and deploys automatically. An existing preferred branch can be used instead of creating the example branch. `deploy.sh` is a local validation helper and performs no Git mutation or remote deployment.

## Routing and content updates

The build writes real `index.html` shells for the public pages, the private dashboard, each currently visible article and supported legacy paths. The dashboard shell has `noindex,nofollow,noarchive,nosnippet` and is absent from the sitemap. Authentication and existing Firestore/Worker authorization remain the security boundaries.

The existing `404.html` redirect preserves the requested URL, query and hash for React to handle paths without a generated file. Articles added after a deployment still render through that fallback. Run the Pages workflow manually after publishing or renaming an article to refresh its static shell and sitemap; the current workflow has no automatic daily refresh.

Tabs left open across a deployment can request a removed lazy-loaded chunk. The client handles Vite's preload error by refreshing at most once per minute when online and session storage is available. It uses `location.reload()` so the path, query and hash are retained. Offline failures and blocked storage do not cause reload loops. GitHub Pages controls its own HTTP caching; no unsupported `_headers` file or service worker was introduced.

## Backend and optional reminders

Existing Firebase web initialization, Firebase Auth login, Firestore collections and authorization rules, media upload authentication, ImageKit integration, contact payload and Gemini proxy contract are retained. Public site-copy formatting and education timeline fields are additive and have fallbacks for existing records. No existing live record was rewritten or seeded by release preparation. Saving Site copy for the first time requires the owner's existing rules to permit the authorized administrator to write `siteSettings/main`; release preparation does not loosen those rules.

`cloudflare-worker.js` remains the original contact Worker. `cloudflare_worker.js` remains the chatbot Worker. The optional reminder extension lives at `workers/contact-with-reminders.js`; it reuses the contact fetch handler and adds the scheduled handler only when the owner explicitly configures and deploys that entry point. The example Wrangler configuration is not an automatic deployment configuration. See [education reminders](../workers/README-education-reminders.md) for KV, bindings and activation. Existing contact service must retain its name, route, webhook secret and bindings. No reminder infrastructure is needed to release the portfolio.

## Checks after the first deployment

1. In Actions, confirm both build and deploy succeed. Open the published URL from the deploy job and confirm the custom domain still uses HTTPS.
2. Open `/`, `/about/`, `/projects/`, `/experience/`, `/credentials/`, `/writing/`, one article and `/contact/` directly; refresh each. Check `/sitemap.xml` and an unknown path.
3. Check dark/light mode, mobile navigation and the assistant opening on the live origin. Make one intentional contact submission or chatbot request only when prepared for the real message/API use.
4. Privately open `/dashboard/` and sign in with the existing account. Verify current content loads. If desired, use an owner-approved temporary record and media asset to check save/upload/delete, then clean them up. These authenticated live operations were not exercised automatically.
5. Check the browser console and Worker dashboards if a service fails. Confirm its existing allowed origins include `https://syedammar.engineer`; do not change DNS, Firebase projects, rules or keys as an initial troubleshooting step.

See [the release check record](RELEASE-CHECKS.md) for the verified local scope and remaining live-only checks.

## Rollback

A failed build does not replace the currently deployed Pages artifact. If a successful deployment reveals an issue, revert the release merge/commit through GitHub and allow the same Pages workflow to redeploy the previous source state. Avoid force-pushing or resetting the owner's history. Reverting the static site does not change Firebase records or Workers; the release workflow never deployed them.

## References

- [Vite: GitHub Pages deployment and custom-domain base paths](https://vite.dev/guide/static-deploy.html#github-pages)
- [GitHub: custom Pages workflows and deployment dependencies](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite: public environment variables and precedence](https://vite.dev/guide/env-and-mode.html)
- [Vite: preload errors after a deployment](https://vite.dev/guide/build.html#load-error-handling)
