---
version: 1
slug: "src-components-features-floatingchatbot-tsx"
primary_target: "src/components/features/FloatingChatbot.tsx"
related_targets: ["src/components/features/ChatbotLauncher.tsx","src/assistant-launcher.css","src/assistant.css","src/hooks/usePortfolioAssistant.ts","src/components/admin/HeroCanvasManager.tsx","src/components/admin/HeroCanvasEditor.tsx","src/components/features/HeroProjectCanvas.tsx","src/components/features/HeroCanvasStage.tsx","src/hero-canvas.css","src/canvas-editor.css","src/lib/heroCanvas.ts","src/lib/canvasPresets.ts","src/components/ui/SafeMarkdown.tsx","src/lib/safeLink.ts"]
---

# Assistant and canvas extension

Mode: Operate. Scope: replace the assistant UI and add the Hero Canvas editor within the established dashboard; preserve the rest of the portfolio and its services.

## Direction contract

THESIS: An anchored bottom composer and compact stacked exchanges keep the portfolio readable while visitors ask questions. The dashboard makes the existing project drawing authorable.

OWN-WORLD: Inherit Graphite / Emerald / Parchment, Public Sans and the canvas grid. The owner requested a more rounded composer; this local component uses 28px corners and calm message surfaces.

STORY: Open the hexagon, ask, see the sent question settle and three sequential typing dots, then receive an interpolated reply. Expand history without losing the fixed composer. Author project scenes with locked theme roles, then publish deliberately.

FIRST VIEWPORT: A 60px hexagon sits 24px from the bottom-right. Open, it yields to a viewport-centered bar up to 680px wide, with 20px mobile side margins. The latest question/answer stack sits above; older history expands upward.

FORM: Owner-selected C, user-pinned-bottom-assistant. Approved comp: .impeccable/mocks/assistant-compositions/c-message-stack-viewport.png. Bar curvature and iMessage-inspired motion are the owner-approved refinements. Canvas editor extends the current admin shell with scene/layer/inspector controls and desktop/mobile arrangements.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion thesis

Focal moment: the hexagon blurs out as the composer grows from its center with damped spring interpolation. Continuity: layout projection moves the message stack when questions/replies arrive; received text fades/settles instead of a fake typewriter. Feedback: a compact three-dot bubble repeats a sequential rise while a request is pending. Budget: no background JS frame loop; only transform/opacity and bounded launcher blur, plus a thin local perimeter light while open. Pause nonessential loops when hidden; reduce motion to brief opacity and a static typing status.

## Implemented assistant contract

The launcher is a body-portal, viewport-fixed hexagon: 60px at a 24px bottom/right offset on desktop, 54px at a 20px offset through 600px, with safe-area accommodation. The open assistant is another body portal at layer 80. Its bottom-centered composer is capped at 680px, keeps 20px side gutters and uses 76px desktop / 72px mobile height. It follows visual-viewport keyboard changes while the page remains scrollable.

The local component exception is deliberate: composer corners are 28px; reply corners are 20/20/20/6px; questions mirror the tail; typing corners are 19/19/19/6px; send/close use 16px corners on 44px controls. The author is 13px, the question 14px and reply/input 16px in Public Sans. These are component tokens in DESIGN.md; the portfolio's global shape and type scales remain established. The mode glyph is the same line chat bubble as the launcher. Its slot is 44px for Visitor and 58px for Recruiter. Phones show the complete “Ask Syed…” prompt.

Only the latest exchange appears initially. History expands earlier messages upward in the bounded local scroll area. A standalone final reply link shares a compact baseline with History; arbitrary replies reserve footer space. Safe Markdown permits reading structures with local code/table scrolling and rejects HTML, images, inputs and unsafe URL schemes. Root-relative Markdown links use React Router, retaining conversation state through public route changes. External HTTP(S) links use opener protection.

The composer surface spring uses stiffness 150, damping 25 and mass 1.1; its curve, scale and geometry remain the approved treatment. Actual spring completion enables a 160ms CSS content reveal, keeping input and controls unscaled, inert and hidden from assistive technology until ready. Exit makes controls inert immediately and fades them over 80ms. The surface then contracts over its existing 160ms after a 120ms hold; the enclosing section fades over 180ms after the same hold. Message springs use stiffness 240, damping 28 and mass 1 with position-only layout projection, a 14px question / 10px reply arrival and 0.97 initial scale. Three 6px dots cycle over 1.25s, delayed by 0/140/280ms. The thin local edge cycles over 5.8s. Hidden/exiting views pause the CSS loops; reduced motion skips the spring wait and exit hold, retaining brief opacity feedback and static typing/perimeter states.

Escape and the close button restore launcher focus after exit. Once the composer is ready, fine pointers focus the input; touch opens with panel focus to keep the keyboard closed initially. Outside clicks close without taking focus from their destination, except links remain usable while the assistant stays open. The navigation overlay and assistant close one another. Visitor/Recruiter mode, the 15-question local daily limit, existing gateway payload, existing chat-log path and retry/contact recovery remain. Closing/reopening retains the mounted conversation; switching mode resets it.

## Implemented canvas contract

Hero canvas is a distinct sidebar section inside the existing protected dashboard. Scene selection, the eight shape/text/Markdown tools, layers, live grid, geometry inspector, undo/redo and explicit save extend the incumbent shell. Its topbar omits the repeated workspace eyebrow locally. Wide editor layout uses 166px / flexible / 248px columns, reflows layers at 1300px, stacks at 780px and wraps scene controls at 520px. Inspector fields remain usable on phones.

Desktop geometry is a 900 × 560 logical stage; mobile stores separate percentage position, size and rotation in a 360px logical stage with 360–1600px height. The real fixed authoring grid is 47px desktop / 30px mobile. Outline, surface, emphasis and quiet treatments remain bound to Graphite / Emerald / Parchment; there is no custom palette, CSS or script input. Boxes, rectangles, ellipses, diamonds, lines, arrows, text and Markdown support the supplied public project content without adding facts.

Drag, resize, optional grid snap, arrow-key nudging (1%, or 5% with Shift), layer order, duplication, deletion, position locking and public/mobile-only visibility are available. A drag is one undo step; undo/redo retains up to 40 prior changes. Mobile stacking is explicit and leaves desktop geometry intact. The initial Console preset reads the existing workflow data; other presets read current project text.

One scene appears publicly at a time, selected by manual tabs. At 600px and below the tab list is vertical and titles wrap completely; horizontal arrows, Home/End and mobile Up/Down select scenes. Only enabled valid configurations with eligible scenes load. Linked scenes require a currently visible project; unlinked custom scenes are eligible. An unavailable default yields to the first eligible scene. Missing, disabled, invalid or ineligible configurations retain the original Console hero.

Version 1 `heroCanvas` is an optional field in existing `siteSettings/main`, bounded to 8 scenes, 60 elements per scene, 4000 characters per element text/detail and 220000 serialized UTF-8 bytes. Geometry, treatments, text roles and safe links are whitelisted. Scene links and Markdown use Router-aware root-relative navigation; whole-element links take precedence over detail disclosure. The existing dashboard guard is unchanged.

Local changes are drafted in this browser; Restore/Discard controls do not publish. Publish canvas saves and enables scenes, including an unchanged saved layout that was disabled. Unchecking Show custom canvas on home for an already-published layout changes the action to Use original canvas; that save disables custom display while keeping the authored scenes. Validation blocks invalid publication. `saveHeroCanvas` merges only `heroCanvas`, while Site Copy saves omit it. A same-window partial settings patch and a cross-tab invalidation marker refresh public settings. Fresh startup, focus and restored-page reads also refresh; revision/request guards prevent older reads replacing newer state, and a failed refresh preserves the current settings. Simultaneous public reads share a request without changing the existing cache lifetimes. No new service, secret, asset host or ImageKit record is introduced. The owner workflow and detailed contract are in [the Hero Canvas guide](../../docs/hero-canvas.md).

## Evidence and finish boundary

The approved C composition remains [the viewport study](../mocks/assistant-compositions/c-message-stack-viewport.png), with [the native component crop](../mocks/assistant-compositions/c-approved-component.png). These are local review references, not shipping raster assets. The implemented assistant, canvas and editor are rendered from code and vectors.

Source evidence: the targets in this brief, `src/services/adminDb.ts`, `src/services/db.ts`, `src/context/SiteSettingsContext.tsx`, `src/pages/Home.tsx` and the dashboard route/guard. Visual evidence is retained under `.impeccable/review/hero-assistant/`: `desktop.png`, `mobile.png`, `editor-1440-dark.png`, `editor-390-light.png`, `canvas-1440-dark.png` and `canvas-390-light.png`, with additional theme, typing, launcher and reduced-motion captures. Still images establish geometry and hierarchy; spring continuity is supported by source and interaction checks.

The original build’s `qa.json` records 146/146 local assertions passing with no failures or uncaught errors. Its scope is explicit: real public reads, isolated editor save, mocked AI replies and all other writes blocked. The fresh-process `correction-checks.json` records 6/6 checks for the locally removed topbar eyebrow and complete mobile tab/focus bounds; the refreshed editor captures show that removal. `build.log` records the production build and 73-file static-artifact validation. That mechanical pass reports no primary findings and 16 retained advisories, with no suppressions. Existing unrelated sidecar drift is not repaired by this scoped extension.

The 2026-10-28 targeted repair evidence is in [canvas-chat-fixes](../review/canvas-chat-fixes/). Its `qa.json` records 48/48 passing checks covering complete original file-box text at 390/768/1280/1440px, actual spring/opacity frames, interrupted opening, reduced motion, existing disabled-scene publication, a second edit, another open homepage, failure/retry and explicit restoration of the original canvas. `offline-checks.json` records 4/4 settings failure/recovery checks. Captures include `home-1440-dark.png`, `home-390-light.png`, `home-768-dark.png`, `home-1280-light.png`, `assistant-1440-dark.png`, `assistant-390-light.png`, `assistant-320-reduced.png`, `editor-desktop.png` and `published-desktop.png`. The editor fixture uses a minimal admin shell and the real Manager, Editor, save adapter, cache and provider against isolated storage; it does not bypass the production dashboard guard. `audit.md` records 35 unit tests, the production build and 73-file release validation, with eight desktop/mobile route checks. `request-comparison.json` shows three simultaneous reads coalescing from three requests to one; the synthetic 200ms-delay elapsed times are comparable, with no claim of faster real-world page metrics. The detector reports no primary findings and 140 inherited advisories (139 type literals and one color literal), with no suppressions. The finalized palette, surrounding layout, composer spring/shape and message motion remain established.

The native 680 × 294 assistant comparison closes the hero gate without forcing at 81% (the final diff reports a 0.8093 match). This is scoped component evidence with full-page desktop/mobile context review. The whole-viewport-to-component responsive mechanical comparison is unsupported by the selected reference geometry; that phase remains pending with an explanatory note. Documentation does not turn it into a passed or forced gate. The finish review and fidelity records own the final disposition.

No production Firebase publish or AI-provider request is claimed by this review. The owner must explicitly publish an authored canvas through the authenticated dashboard. The actual résumé remains private; no public résumé, download/export or print action is introduced.
