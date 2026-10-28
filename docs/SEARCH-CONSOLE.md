# Search Console and canonical URLs

This guide applies to the existing `syedammar.engineer` property. No new verification token, Google account credential or hosting provider is required.

## What the live check found

On 28 October 2026, direct HTTP checks confirmed that the HTTPS apex homepage and canonical public directory URLs returned 200. HTTP redirected to HTTPS, `www` redirected to the apex domain, and `/about` redirected to `/about/`. Those are intentional canonical redirects. The live sitemap listed seven main pages and three published articles. Its URLs already used HTTPS, the apex domain and trailing slashes.

The application still generated slashless internal links, making crawlers encounter unnecessary redirects. Also, the generic 404 page redirected all missing URLs through the homepage, and public page bodies were empty until JavaScript loaded their content. This change fixes those behaviors. It does not establish that they account for every URL in the owner's private Search Console report; its example URLs were not available during implementation.

## What this release generates

- The same existing public React components are rendered during the build, with visible public Firestore records and the current public site copy. The initial HTML contains page headings, evidence, article prose and real navigation links. The browser keeps the same layouts and interactions and refreshes content through the existing live loaders.
- Public links, canonical tags, Open Graph URLs and `sitemap.xml` agree on `https://syedammar.engineer/<page>/`. Internal links go to the final directory URL directly. Anchors and query strings remain usable.
- Every listed article has a real static directory page. Only canonical public pages appear in the sitemap. Private dashboard, legacy aliases, missing pages and hidden articles are excluded.
- The generated `404.html` renders the existing not-found surface at the requested URL. GitHub Pages supplies the HTTP 404; it no longer redirects through `/`. The page is noindex and has no static canonical pointing to the homepage.
- Known legacy aliases, including `/achievements/`, `/journals/` and `/journal/<published-slug>/`, retain an instant meta refresh to the final canonical destination. GitHub Pages does not offer arbitrary application-level HTTP redirect rules. These aliases should remain outside the index and sitemap.
- The private dashboard remains noindex before JavaScript loads. It contains no public navigation entry or prerendered private data. Do not request its indexing.
- Publication dates remain in article metadata. Firestore `updateTime` is not used as a content-modification date: a reader's upvote can change it. Sitemap dates are omitted rather than inventing content updates.

The build uses GitHub Actions' existing Firebase public web configuration from repository secrets. No credentials are embedded in the public content snapshot, and no `.env` file should be committed. The snapshot projects known public fields; internal credential-media deletion IDs and message/chat/analytics collections are not included.

## After merging and a successful Pages deployment

1. Open `https://syedammar.engineer/sitemap.xml`. Confirm it includes the pages and articles currently intended to be public. An XML sitemap is appropriate; a separate `sitemap.html` is unnecessary for this small, navigable portfolio.
2. In Search Console, select the existing domain property or the URL-prefix property **`https://syedammar.engineer/`**. In **Sitemaps**, submit or resubmit `https://syedammar.engineer/sitemap.xml`. Keep this as the current sitemap; do not submit the same content through several obsolete sitemap files.
3. Use **URL inspection** on a final canonical URL, for example `https://syedammar.engineer/about/`. Choose **Test live URL**. Check that the live test permits indexing, the fetch succeeds, and the rendered HTML contains the expected public content. Compare the user-declared canonical and, when Google has recrawled it, the Google-selected canonical.
4. Request indexing of the homepage and important final canonical pages that are still missing. For article requests use `/writing/<slug>/`, including the final slash. Search Console can limit requests; repeated requests do not make crawling immediate.
5. Open **Page indexing → Page with redirect → Examples**. Inspect each example's exact source URL and destination. Classify it using the table below. The status applies to the source URL; inspect the destination independently.
6. Validate only actual mistakes you have fixed. A whole-category validation can continue to fail if the category contains intentional redirects. When useful, filter Page indexing to the submitted canonical sitemap before evaluating or validating affected submitted URLs.
7. Allow Google to recrawl and update its reports. Code and sitemap improvements help discovery and rendering; Google decides which eligible pages to index and when. A successful live test is not a guarantee of indexing.

| Example shown by Google | Expected result | Action |
| --- | --- | --- |
| `http://syedammar.engineer/about/` | Redirect to the HTTPS canonical | Keep the redirect; inspect the HTTPS destination |
| `https://www.syedammar.engineer/about/` | Redirect to the apex canonical | Keep it; use the apex URL in links and the sitemap |
| `https://syedammar.engineer/about` | Redirect to `/about/` | Keep it; this release emits `/about/` links |
| `/achievements/`, `/journals/`, known `/journal/<slug>/` | Move to `/credentials/`, `/writing/`, `/writing/<slug>/` | Keep legacy compatibility; request the final destination |
| A canonical sitemap URL such as `/credentials/` redirects unexpectedly | The canonical should normally return 200 directly | Inspect its complete redirect chain; check host/DNS/Pages settings before changing app routes |
| A deleted URL or arbitrary nonexistent path | HTTP 404, noindex | Expected; do not request indexing |
| `/dashboard/` | Private login, noindex | Expected; leave it excluded |

## Publishing or hiding content later

Dashboard edits continue to refresh the running application. Static HTML and the sitemap reflect the last successful build. After publishing, renaming, hiding or deleting an article, run **Actions → Deploy to GitHub Pages → Run workflow** on `main`. Do the same when you want significant profile/project/credential edits reflected immediately in the initial HTML. No new API secret is needed.

A newly published article can be reached by the running app before rebuilding, but a direct request without a generated file still has a 404 HTTP status. Rebuild before requesting indexing. Conversely, hiding a previously public record does not erase old static content until the next deployment. Treat the generated HTML as a public publication artifact.

## Google references

- [Page indexing report: canonical coverage, redirect statuses and validation](https://support.google.com/webmasters/answer/7440203?hl=en)
- [Canonical URL methods and consistent internal links](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [JavaScript SEO: rendering, initial HTML and meaningful status codes](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Redirect types supported by Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
