# Syed Ammar Portfolio — Front-end Redesign Overlay

This package is an **overlay for the existing repository**, not a replacement for your backend or deployment setup. Copy it over the repository root so the files in this package replace their current front-end equivalents. Files that are not included here (Firebase deployment config, Cloudflare Worker code, existing credential/logo images, environment files, GitHub workflows, etc.) should stay as they are.

## Design direction

The redesign moves the public site away from a full-terminal/admin-console aesthetic and toward a dark editorial infrastructure portfolio: large typography, restrained motion, topology/orbit visual language, clear project storytelling, strong spacing, and technical details used as accents rather than as the whole interface.

The positioning is intentionally infrastructure-neutral: **system administration remains the foundation**, while cloud, DevOps, containers/Kubernetes and reliability/SRE can be represented as current or future directions according to the evidence you add to the portfolio. The default copy does not present you as a senior engineer or software developer.


## Personal identity asset

The public navigation and private dashboard sidebar now use the supplied portrait as a **circular avatar** (`public/profile-avatar.webp`) instead of the `SA` initials. The crop is intentionally tight so your face remains legible at small navigation sizes. To update it later, replace that file with another square portrait using the same filename.

Your existing repository icon is still preserved and used. The redesigned `index.html` references `/pf.ico` for the browser favicon and `/pf.png` for the Apple touch icon and current Open Graph/Twitter fallback image. Because this package is an overlay, it deliberately does not include replacement copies of those existing icon files.

## Backend behavior preserved

- Firebase remains the database/auth/storage layer.
- Existing collections remain in use: `projects`, `certificates`, `experience`, `posts`, `messages`, `chatLogs`, and `visits`.
- Contact still posts to `VITE_WEBHOOK_PROXY_URL` (with the existing Cloudflare Worker fallback) and then saves a management copy to Firebase.
- Gemini still uses `VITE_GEMINI_PROXY_URL` and chatbot logs still use `chatLogs`.
- `/dashboard` remains a private management route and is never linked in public navigation.
- Firebase Authentication still protects the dashboard.

## One additive Firebase document

The redesign adds one optional content document:

`siteSettings/main`

This exists so your positioning, hero, profile copy, page introductions, capabilities, social links, SEO defaults, chatbot toggle, CTAs and public interface copy can be changed from the dashboard instead of source code. If the document does not exist or cannot be read, the site renders safe local defaults from `src/data/siteDefaults.ts`.

### Firestore rules

If your current rules explicitly whitelist collections, merge a rule for `siteSettings` into your **existing** rules. Do not replace your rules with this snippet. A minimal pattern is:

```text
match /siteSettings/{document} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

For production, tighten the write rule to your specific Firebase Auth UID (recommended) or whatever admin authorization condition you already use. The hidden route is not the security boundary; Firebase Auth + Firestore rules are.

After deployment, open `/dashboard` → **Site copy** and save once. That creates/merges `siteSettings/main`.

## Dashboard access

The old homepage terminal `login` command is removed. The cleaner model is:

1. Keep `/dashboard` absent from public navigation, sitemap and search indexing.
2. Bookmark `/dashboard` privately.
3. Opening it while signed out shows a minimal password gate.
4. The email used for Firebase login is read from `VITE_ADMIN_EMAIL`; if that variable is absent, the redesign keeps the existing admin email as a compatibility fallback.
5. Authentication is still handled by Firebase.

Optional environment entry:

```env
VITE_ADMIN_EMAIL=your-firebase-admin-email@example.com
```

Your existing Firebase, Gemini and webhook environment variables stay unchanged.

## Chatbot improvement

The floating Gemini assistant remains in the bottom-right corner, but it now loads the **current public Firebase portfolio data** (projects, professional experience, credentials, writing and site settings) into its context when opened. That means dashboard edits can change what the assistant knows without maintaining a second hard-coded biography. Recruiter mode is instructed to distinguish professional experience from labs/projects/certifications and not inflate seniority.

## SEO improvements included

- Neutral infrastructure/cloud/operations title and description instead of a Linux-SysAdmin-only title.
- Canonical URL.
- Correct `syedammar.engineer` Open Graph and Twitter image URLs.
- `Person` JSON-LD structured data.
- Dynamic title/description/canonical/OG metadata per React route.
- `robots.txt` with `/dashboard` excluded.
- Static sitemap for public top-level routes.
- Dashboard pages use `noindex,nofollow`.
- 404 SPA fallback is included for hosts that need it.

### SEO limitation worth knowing

This is still a Vite client-rendered SPA. Search engines such as Google can generally render it, but some social/link crawlers and SEO bots do not reliably wait for JavaScript. Therefore an individual journal post's React-generated title/description may not always appear in an unfurl. The next SEO upgrade, if you ever want it, would be prerendering/SSR/static generation for public routes and generating journal URLs into the sitemap at build time. That is deliberately not introduced here because it would materially change your current deployment architecture.

## Applying the overlay

Recommended workflow:

```bash
git checkout -b redesign/portfolio-v2
# extract/copy this package into the repository root, allowing matching files to overwrite
npm install
npm run build
```

Then use your repository's **existing deployment pipeline**. Do not delete or replace your current `.env`, Firebase project configuration, Worker source, public certification/logo assets, or deployment workflows.

## Files deliberately not replaced

This overlay does not include your `package.json`, Firebase hosting config, Cloudflare Worker, `.env`, public credential/logo binaries, or deployment workflow. The redesign was built against the dependencies already present in your current Vite/React/Tailwind/Firebase front end and does not require a backend migration.

## Validation performed in this workspace

All TypeScript/TSX source files were parsed/transpiled successfully with TypeScript 5.8. A full `npm run build` could not be executed in this isolated workspace because the repository's npm dependencies are not installed here and outbound package/GitHub access is unavailable. Run the build command in your normal checkout before deployment; if it surfaces an environment- or version-specific issue, it should be addressed on the redesign branch before merging.

## Revision: themes, cursor motion and richer analytics

This revision adds a persistent **light/dark mode toggle** to both the public portfolio and private dashboard. The first visit follows the operating-system preference; later visits remember the chosen mode in `localStorage`. The theme is applied before React mounts to avoid a visible flash.

The public site also includes a desktop-only delayed cursor treatment: a small signal point tracks the pointer, a larger ring follows with eased latency, interactive controls expand the ring, and a subtle radial field moves behind it so the pointer appears to influence the background. It is automatically disabled for touch/coarse pointers and `prefers-reduced-motion`. The admin dashboard keeps the normal cursor for precision.

The dashboard overview now adds useful first-party analysis instead of decorative graphs: seven-day traffic vs. the prior seven days, anonymous tracked sessions, distinct pages per session, contact-page views, unread messages, peak traffic day, top routes, device mix, entry-source mix, content inventory, and quick actions. It still writes to the existing `visits` collection; new visit records simply add `sessionId`, `source`, and `referrer`. No cookie, IP collection, external analytics vendor, or backend migration was added.

## GitHub Pages rollout for your current repository

Your repository already has `.github/workflows/deploy.yml`, and that workflow already runs `npm ci`, creates the Vite `.env` from repository secrets, runs `npm run build`, uploads `dist`, and deploys through GitHub Pages. **Keep it.** Do not add `gh-pages` or a second deployment mechanism.

Your current Vite config uses `base: '/'`; keep that while `syedammar.engineer` is the custom domain/root deployment.

Recommended rollout:

```bash
git clone https://github.com/syed-913/syed-portfolio.github.io.git
cd syed-portfolio.github.io

git checkout -b redesign/portfolio-v2

# Extract this ZIP somewhere temporary and copy its CONTENTS over this repo root.
# Allow matching src/public/index files to overwrite, but do not delete files
# that are absent from the overlay.

git status
npm ci
npm run build
npm run dev

git add src public index.html tailwind.config.js README-REDESIGN.md .env.redesign.example FILE-MANIFEST.txt
git commit -m "Redesign portfolio frontend and dashboard"
git push -u origin redesign/portfolio-v2
```

Review that branch/PR. When ready, merge it into `main`. Your existing **Deploy to GitHub Pages** action is triggered by pushes to `main`, so deployment should start automatically. Watch **GitHub → repository → Actions → Deploy to GitHub Pages**, then verify the homepage, `/contact`, a journal route, and `/dashboard` at `syedammar.engineer`.

Preserve your existing `.github/workflows/deploy.yml`, `package.json`, `package-lock.json`, `vite.config.ts`, Firebase config, Cloudflare Worker files, secrets/environment variables, and existing public certification/logo assets. The contact page now accepts either `VITE_WEBHOOK_PROXY_URL` or your existing `VITE_DISCORD_WEBHOOK_URL` before falling back to the current Worker endpoint; Gemini remains on `VITE_GEMINI_PROXY_URL`.

## v4 — credential issuer identity (no logo maintenance)

The credentials UI no longer reads or requires `certificate.issuerLogo`. Existing Firestore documents can keep that legacy field; it is ignored by the public renderer and omitted from new dashboard writes, so there is no database migration requirement.

Issuer presentation is derived from the existing `issuer` string. Common aliases such as `AWS`, `Amazon Web Services`, `Red Hat`, `Terraform`, `HashiCorp`, `ISC2`, `Linux Foundation`, `CNCF`, `Microsoft/Azure`, `Google Cloud`, `Cisco`, `CompTIA`, `Oracle`, and others resolve to a consistent built-in identity badge. Unknown issuers automatically receive a clean initials-based fallback, so a new authority never breaks the layout.

The dashboard credential editor no longer asks for an issuer logo path. Type the issuer name and it previews the generated identity immediately.

### Remove the old logo directory

This redesign contains **no references to `public/logo/`**. Because the redesign ZIP is an overlay and cannot delete files already present in your Git checkout, remove the legacy directory once after applying v4:

```bash
git rm -r public/logo
```

Then run `npm run build`. This does not affect `public/pf.ico`, `public/pf.png`, `public/profile-avatar.webp`, or certificate files under `public/certifications/`.
