---
version: 1
slug: "src-pages-home-tsx"
primary_target: "src/pages/Home.tsx"
related_targets: ["src/components/layout/Layout.tsx","src/index.css","src/pages/About.tsx","src/pages/Projects.tsx","src/pages/Experience.tsx","src/pages/Achievements.tsx","src/pages/Blog.tsx","src/pages/BlogPost.tsx","src/pages/Contact.tsx","src/pages/Dashboard.tsx"]
---

# Public portfolio redesign

## Scope and visitor mode

Mode: Experience. Redesign the homepage and carry the system through public routes and the private dashboard interface. Preserve the existing authentication, content, service, and deployment boundaries in PRODUCT.md.

## Audience and job

Recruiters need a clear Linux / Cloud / Security focus, accurate career stage, and a comprehensive professional record. Technical reviewers need the underlying projects, credentials, and writing. The primary action opens projects; experience and contact remain direct.

## Selected direction and comp

Technical Field Manual, grounded candidate 6, seed c5caf5d7. The owner selected this visual direction on the decision board. After all three compositions were displayed, the balanced Profile + project composition was selected under the owner's explicit delegation: “Full creative freedom over design, layout, component architecture, and visual aesthetics.” This is a delegated composition choice, not a second owner selection.

Approved comp: `.impeccable/mocks/field-manual-split.png`.
Approval record: `.impeccable/mocks/field-manual-split.png.json`.

## Direction contract

THESIS: A precise technical sheet makes the person and an inspectable Linux project readable together. The first viewport uses the work itself rather than an abstract infrastructure ornament.

OWN-WORLD: The owner selected Graphite + Emerald + Parchment on 2026-10-16. Neutral graphite surfaces and warm cream text carry dark mode; warm parchment and charcoal ink carry light mode. Emerald marks actions, focus and state; sand marks sparse technical detail. The project specimen follows neutral theme surfaces. Fine grid rules, square controls, sans-serif reading and small technical labels remain. The latest layout is explicitly preserved, including the split composition and workflow geometry. The Overview traffic bars alone become a line series.

STORY: Recognize Linux / Cloud / Security; understand the lab-based career stage; inspect a real project; follow credentials, writing, experience, and contact.

FIRST VIEWPORT: A slim navigation sits above a narrow section rail. The left column holds the three-line focus headline, body, two actions, and real portrait/context. The wider right field holds the User Management Console flow and case-study action. A full-width credential strip closes the viewport. At 1536×1024 the main columns begin near x100 and x615.

FORM: Engineering field manual, candidate 6, seed c5caf5d7; balanced split composition. A selected workflow stage reveals its project evidence. Motion shares one restrained rhythm and honors reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation constraints

Use verified PRODUCT.md content. Separate lab training, projects, certifications, education, and production employment. Main content remains sans-serif. Preserve the real portrait, theme persistence, custom cursor, existing routes, hidden dashboard, and integrations. Medium remains configurable only once a real profile URL is available.

## Approved palette refinement — 2026-10-16

The selected Graphite proposal in `.impeccable/proposals/color-directions.html` is color authority. Its miniature composition does not replace the current layout. Scope, exact role values and verification boundaries are in `.impeccable/review/palette/brief.md`. Existing fonts, copy, timing, portrait and page structures remain.

## Background extension — 2026-10-18

The owner selected **B — Signal Routes** from `.impeccable/review/background-compositions/b-signal-routes.png`, following a background-only comparison against the actual homepage in both themes. The study governs sparse angular paths, hollow junctions and edge framing. It does not replace the existing foreground composition, copy or typography. Preserve the Graphite / Emerald / Parchment palette and current layouts across all routes.

Implementation is scoped to `src/signal-background.css` and its import in `src/index.css`. Two bounded SVG masks are embedded in CSS, with no new script logic or external assets. Mobile uses fewer paths; Profile, articles and private workspace use quieter opacity. No background animation loop is introduced. The owner initially requested no commit or push, then explicitly authorized committing and pushing `codex/background-compositions` on 2026-10-18, reserving the deployment review for themselves.

The production build and the first full desktop/mobile theme batch passed. The finish review returned `disposition: ship`, with no material fixes. Local 4× CPU-throttled comparison retained foreground geometry, ten local resource requests and zero idle animation-frame calls; median FCP changed from 360ms to 368ms and p95 interaction frame interval from 16.7ms to 16.8ms. CSS adds 1243 gzip bytes. JavaScript runtime code is identical after normalizing expected Vite hash references. Evidence is recorded under `.impeccable/review/background-compositions/implementation/`.
