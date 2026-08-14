# Portfolio v15 — Search / GSC SEO patch

This patch is intentionally SEO-only. It does not change the visual design, Firebase collections, ImageKit, Cloudflare workers, dashboard CRUD, theme system, cursor, animations, or portfolio content model.

## What v15 adds

### 1. Firebase-aware sitemap generation

`scripts/generate-seo.mjs` runs after the Vite production build and creates `dist/sitemap.xml` from:

- `/`
- `/about/`
- `/projects/`
- `/experience/`
- `/credentials/`
- `/writing/`
- `/contact/`
- every Firebase `posts` document where `visible == true`

Writing entries use Firestore's document `updateTime` as `<lastmod>` when it is available. Draft/hidden posts are excluded by the Firestore query.

The source `public/sitemap.xml` is only a static fallback. The deployed sitemap is generated after each production build.

### 2. Automatic daily refresh

The GitHub Pages workflow now also runs once daily. This matters because writing and profile copy are managed from Firebase rather than Git commits.

So a new article created from Dashboard → Writing does not require you to manually edit or commit `sitemap.xml`. The next scheduled deployment refreshes the sitemap and SEO route shells automatically. `workflow_dispatch` remains available if you want an immediate refresh from GitHub Actions.

### 3. Real 200 route shells for GitHub Pages

GitHub Pages is a static host. The usual SPA `404.html → sessionStorage → /` workaround lets React recover a route, but the original HTTP response is still a 404.

After Vite builds, v15 creates lightweight `index.html` shells for each canonical route and each visible writing slug, for example:

- `dist/projects/index.html`
- `dist/credentials/index.html`
- `dist/writing/my-article/index.html`

The page content is still rendered by the same React application. The shell simply gives direct requests a real static route with canonical metadata and a successful static page response instead of depending on the 404 fallback.

Canonical URLs use trailing slashes to match these static GitHub Pages directories, for example:

`https://syedammar.engineer/projects/`

React Router continues to accept your existing internal `/projects` links.

### 4. robots.txt

The deployed file is:

```txt
User-agent: *
Allow: /

Sitemap: https://syedammar.engineer/sitemap.xml
```

`/dashboard` is intentionally **not** blocked in robots.txt. It is instead served with:

`noindex,nofollow,noarchive,nosnippet`

and remains protected by Firebase Authentication. Blocking it in `robots.txt` would prevent crawlers from seeing the `noindex` directive; robots.txt is not a security boundary.

### 5. Dashboard and 404 indexing protection

- `/dashboard/` receives a static noindex shell and is excluded from the sitemap.
- `public/404.html` now contains `noindex,nofollow`.
- Unknown pages remain handled by the existing SPA fallback.

### 6. Legacy route cleanup

The old URLs are not included in the sitemap.

v15 generates noindex redirect shells for:

- `/achievements/` → `/credentials/`
- `/journals/` → `/writing/`
- `/journal/<slug>/` → `/writing/<slug>/`

These are static-host-compatible redirects (instant JS/meta refresh), not HTTP 301 responses, because GitHub Pages does not provide arbitrary redirect status configuration for these SPA routes.

### 7. Structured data

The base document now contains a JSON-LD graph for:

- `Person`
- `WebSite`
- `ProfilePage`

Visible writing entries get `BlogPosting` structured data including headline, description, author reference, canonical URL, tags/keywords, publication date when parseable, and Firestore `updateTime` as `dateModified` in generated production shells.

The React SEO component also updates article JSON-LD during client-side navigation.

### 8. Dynamic metadata from site settings

During the production SEO step, the script attempts to read `siteSettings/main` from Firestore. That lets generated titles/descriptions and the Person/WebSite graph follow the public copy you manage from the dashboard.

If Firebase is unavailable during a local build, the script safely falls back to the portfolio defaults and still generates the static routes.

## Files in this patch

```text
.github/workflows/deploy.yml
scripts/generate-seo.mjs
public/robots.txt
public/sitemap.xml
public/404.html
index.html
src/components/features/SEO.tsx
src/pages/BlogPost.tsx
README-V15.md
```

No package dependency was added and `package.json` does not need to change.

## Install over v14

Start from your current production branch:

```bash
git switch main
git pull --ff-only origin main
git switch -c seo/portfolio-v15
```

Copy the **contents of `v15-patch/`** into the repository root and allow matching files to overwrite.

Then run:

```bash
npm ci
npm run build
node scripts/generate-seo.mjs
npm run dev
```

The manual `node scripts/generate-seo.mjs` command is useful locally. On GitHub, the updated workflow runs it automatically after `npm run build`.

If your local `.env.local` contains the Firebase project ID/API key, local generation can include current public writing entries. Without them, it intentionally generates only the static route set.

## Local checks

After `npm run build && node scripts/generate-seo.mjs`, check:

```bash
cat dist/robots.txt
cat dist/sitemap.xml
```

Also verify these exist:

```text
dist/about/index.html
dist/projects/index.html
dist/credentials/index.html
dist/writing/index.html
dist/dashboard/index.html
```

If Firebase was available and you have visible writing entries, you should also see:

```text
dist/writing/<slug>/index.html
```

## Commit and deploy

```bash
git status
git add .github/workflows/deploy.yml scripts public/robots.txt public/sitemap.xml public/404.html index.html src/components/features/SEO.tsx src/pages/BlogPost.tsx
git commit -m "Add automated sitemap and search metadata"
git push -u origin seo/portfolio-v15
```

Open the PR into `main`, review the files, merge, and wait for **Deploy to GitHub Pages** to complete.

## Google Search Console after deployment

You only need to submit the sitemap URL once:

`https://syedammar.engineer/sitemap.xml`

In Search Console, use **Sitemaps** and submit `sitemap.xml` (or the full URL if the UI asks for it).

Then use **URL Inspection** on a few important URLs after deployment:

- `https://syedammar.engineer/`
- `https://syedammar.engineer/projects/`
- `https://syedammar.engineer/credentials/`
- one `https://syedammar.engineer/writing/<slug>/` page

The daily workflow keeps the generated sitemap/current route metadata aligned with Firebase without needing a source-code commit every time you publish a field note.

## Security note

Nothing in v15 changes dashboard authorization. `robots.txt`, `noindex`, sitemap exclusion, hidden navigation and route naming are SEO/crawler controls only. Firebase Authentication and your Firestore/Worker authorization remain the security boundary.
