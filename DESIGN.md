---
name: "Syed Ammar — Technical Field Manual"
description: "A precise graphite, emerald and parchment visual system for an infrastructure and security portfolio."
colors:
  ink-dark: "#14181b"
  paper-dark: "#f3f2eb"
  muted-dark: "#acb8bc"
  panel-dark: "#20272b"
  panel-soft-dark: "#2b3438"
  signal-dark: "#49c7a5"
  signal-soft-dark: "#203b33"
  warm-dark: "#d3b58c"
  line-dark: "#3b4549"
  line-strong-dark: "#7c8c8f"
  action-hover-dark: "#76d7bc"
  on-action-dark: "#14181b"
  error-dark: "#f2a69b"
  error-soft-dark: "#412b2a"
  ink-light: "#f4f1e9"
  paper-light: "#202b2b"
  muted-light: "#556461"
  panel-light: "#e7e8e1"
  panel-soft-light: "#dde1d8"
  signal-light: "#096d55"
  signal-soft-light: "#dcebe2"
  warm-light: "#76542c"
  line-light: "#bcc8c1"
  line-strong-light: "#708179"
  action-hover-light: "#075941"
  on-action-light: "#ffffff"
  error-light: "#9c3025"
  error-soft-light: "#f2dfd8"
  code-canvas: "#14181b"
  code-paper: "#f3f2eb"
  code-muted: "#acb8bc"
  code-line: "#3b4549"
  code-signal: "#49c7a5"
  scrim: "#14181bb3"
typography:
  display:
    fontFamily: "Catamaran, sans-serif"
    fontSize: "calc(116 * var(--u))"
    fontWeight: 800
    lineHeight: 0.79
    letterSpacing: "0"
  page-title:
    fontFamily: "Catamaran, sans-serif"
    fontSize: "clamp(52px, 5.5vw, 84px)"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Catamaran, sans-serif"
    fontSize: "clamp(36px, 4.2vw, 64px)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: "23px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  lead:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.85
  metadata:
    fontFamily: '"JetBrains Mono", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
  tag:
    fontFamily: '"JetBrains Mono", monospace'
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: '"JetBrains Mono", monospace'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: '"Public Sans", sans-serif'
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  square: "0"
  tag: "2px"
  control: "3px"
  utility: "4px"
  panel: "5px"
  switch: "30px"
  circle: "50%"
spacing:
  gap-small: "8px"
  gap-icon: "10px"
  inset-small: "12px"
  inset-control: "16px"
  gutter-mobile: "20px"
  gap-standard: "24px"
  gutter-tablet: "28px"
  inset-panel: "32px"
  gap-section: "36px"
  inset-large: "40px"
  space-large: "48px"
  gap-column: "56px"
  space-section: "64px"
  space-intro: "80px"
components:
  button-primary:
    backgroundColor: "{colors.signal-dark}"
    textColor: "{colors.on-action-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover-dark}"
  button-ghost:
    textColor: "{colors.paper-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
  button-ghost-hover:
    backgroundColor: "{colors.signal-soft-dark}"
  button-nav:
    backgroundColor: "{colors.signal-dark}"
    textColor: "{colors.on-action-dark}"
    rounded: "{rounded.tag}"
  button-nav-hover:
    backgroundColor: "{colors.action-hover-dark}"
  button-specimen:
    backgroundColor: "{colors.signal-dark}"
    textColor: "{colors.on-action-dark}"
    rounded: "{rounded.square}"
    padding: "0 0 0 calc(54 * var(--u))"
  input:
    textColor: "{colors.paper-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  navigation:
    backgroundColor: "{colors.ink-dark}"
    textColor: "{colors.paper-dark}"
  tag:
    backgroundColor: "{colors.signal-soft-dark}"
    textColor: "{colors.muted-dark}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "7px 10px"
  case-container:
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.muted-dark}"
    rounded: "{rounded.square}"
    padding: "36px"
  specimen-stage:
    backgroundColor: "{colors.ink-dark}"
    textColor: "{colors.paper-dark}"
    rounded: "{rounded.square}"
    padding: "calc(13 * var(--u)) calc(16 * var(--u))"
  specimen-stage-hover:
    backgroundColor: "{colors.panel-soft-dark}"
  theme-switch:
    textColor: "{colors.paper-dark}"
    rounded: "{rounded.switch}"
---

# Design System: Syed Ammar

## Overview

**Creative North Star: "Technical Field Manual"**

A precise technical sheet gives infrastructure work a calm, inspectable setting. Graphite surfaces, warm cream text, parchment and fine calibrated rules carry the terminal and grid influence. Emerald marks action and state; sparse sand detail adds warmth to technical metadata and connector geometry. Dense evidence sits within generous reading margins; typography and alignment establish the hierarchy.

The visual identity supports Linux, Cloud and Security through readable sans-serif content and restrained technical detail. Dark and light modes share the same geometry; project specimens follow the active neutral surfaces, text and rules. The owner selected Graphite + Emerald + Parchment while preserving the latest public and dashboard layouts. The real portrait remains an identity asset within this system.

**Key Characteristics:**

- Neutral graphite and warm parchment with emerald signals and sparse sand detail.
- Fine linework and flat, clearly separated surfaces.
- Catamaran display, Public Sans reading, JetBrains Mono technical detail.
- Square and lightly softened controls with visible keyboard focus.
- Restrained motion, persistent themes and a supplementary cursor follower.

## Colors

Graphite and warm parchment carry the broad regions, with a bright emerald signal in dark mode and a deep emerald signal on light paper. Frontmatter values are normative; the table maps the live CSS roles to their theme primitives. The historical `--ink` name means canvas and `--paper` means text in both themes.

### Primary

- **Emerald Signal:** links, focus outlines, selected states, progress, status and small icon accents; use `signal-dark` or `signal-light` with the active theme.
- **Emerald Action:** `--action` aliases the active signal for filled public, navigation and specimen actions. `--action-hover` brightens the dark action and deepens the light action; the paired `--on-action` foreground keeps the label legible.

### Secondary

- **Sand Technical Detail:** `warm-dark` and `warm-light` mark sparse supporting metadata, the section rail and workflow connectors. This accent does not become the broad field or action fill.

### Neutral

| Live role | Dark primitive | Light primitive | Use |
| --- | --- | --- | --- |
| `--ink` | `ink-dark` | `ink-light` | Page and navigation background |
| `--paper` | `paper-dark` | `paper-light` | Main text and switch thumb |
| `--muted` | `muted-dark` | `muted-light` | Supporting prose and metadata |
| `--panel` | `panel-dark` | `panel-light` | Case details, messages and utility panels |
| `--panel-soft` | `panel-soft-dark` | `panel-soft-light` | Secondary surface and loading bars |
| `--signal` | `signal-dark` | `signal-light` | Accent, focus and status |
| `--signal-soft` | `signal-soft-dark` | `signal-soft-light` | Tags and quiet selected/hover fills |
| `--warm` | `warm-dark` | `warm-light` | Sparse technical metadata and workflow connectors |
| `--line` | `line-dark` | `line-light` | Dividers and subdued outlines |
| `--line-strong` | `line-strong-dark` | `line-strong-light` | Fields and stronger control outlines |
| `--action` | `signal-dark` | `signal-light` | Filled actions; alias of the signal role |
| `--action-hover` | `action-hover-dark` | `action-hover-light` | Filled action hover |
| `--on-action` | `on-action-dark` | `on-action-light` | Graphite text on dark-theme actions, white on light-theme actions |
| `--error` | `error-dark` | `error-light` | Failure feedback |
| `--error-soft` | `error-soft-dark` | `error-soft-light` | Quiet failure feedback fill |

Project field roles are theme-aware aliases: `--field` → `--panel`, `--field-dark` → `--ink`, `--field-paper` → `--paper`, `--field-muted` → `--muted`, `--field-line` → `--line-strong` and `--field-selected` → `--panel-soft`. Their historical names do not establish a fixed emerald field. `--field-grid` mixes the active text at 4% over transparency. The dashboard shares these neutral, signal, line and feedback roles.

Code frames keep the fixed `code-canvas`, `code-paper`, `code-muted`, `code-line` and `code-signal` primitives in both themes so technical samples retain a paired graphite and cream canvas. Existing Prism VSC syntax colors are domain-specific highlighting, not additional branding tokens. The fixed `scrim` darkens the background beneath the mobile menu. Error feedback follows the active theme; success uses the active signal.

Frontmatter component references describe the default dark theme. Their sidecar snippets bind to live CSS roles; light mode substitutes the corresponding light primitives in this table. Fixed code roles remain paired independently of the page theme. The initial HTML theme color and the theme switch use the active canvas; the vector favicon pairs the dark canvas and emerald signal.

**The Paired Themes Rule.** Use the active canvas, text, muted, panel, signal, warm and line roles together, including within project specimens and dashboard panels; keep fixed code roles paired on their own canvas.

## Typography

**Display Font:** Catamaran, with sans-serif fallback. **Body Font:** Public Sans, with sans-serif fallback. **Label/Mono Font:** JetBrains Mono, with monospace fallback. All three are self-hosted under `public/fonts`; their asset inventory is in `.impeccable/build/fonts-manifest.json`.

Catamaran supplies compact, rounded display weight; Public Sans carries the professional reading voice. JetBrains Mono marks code, tags, dates, technical metadata and footer details. Main prose, navigation and action labels remain sans-serif.

### Hierarchy

- **Display:** the heavy focus headline uses the `display` role. Its desktop measure is viewport-scaled through `--u`; at widths up to 1000px it uses 112px with a 0.85 line height, and up to 600px it uses `clamp(68px, 22vw, 96px)` with a 0.82 line height and -0.01em tracking. This is a display treatment, not the default page heading.
- **Page title:** the `page-title` role introduces reading surfaces; it resolves to 64px up to 1000px and 46px up to 600px. Individual profile and article headings use their own observed scale.
- **Headline and title:** section headings use Catamaran; local item titles use Public Sans. Common content headings range from 30px to 40px, with the larger headline role available for section emphasis.
- **Lead and body:** the `lead` and `body` roles separate introductions from standard copy. Leads use a maximum 68ch measure and reduce to 17px on tablet and 16px on mobile. Supporting technical prose commonly uses 15–17px with 1.7–1.75 line height.
- **Reading:** article prose uses the `reading` role, reducing to 16px up to 600px while retaining its generous line height. The article canvas is capped at 800px and prose at 72ch. A leading paragraph uses 20px, reducing to 17px on mobile; article titles use a fluid 42–64px desktop scale and 39px on mobile.
- **Metadata, tags and code:** the metadata role may use uppercase for short factual labels; tags retain their natural case. Mobile tags use 10px with smaller insets. Code stays in the `code` role and scrolls when needed.

**The Reading Voice Rule.** Keep main content and controls in Public Sans; use JetBrains Mono for code, tags, technical metadata and footer details.

## Layout

Reading surfaces share a centered container capped at 1340px with 64px side gutters. Up to 1000px, gutters become 28px; up to 600px, they become 20px. The shell caps at 1600px. The existing wide display sheet uses `--u: calc(100vw / 1536)`, capped at 1.0416667px from 1600px; reading content uses independent pixel and fluid type measures.

The rhythm combines small 8–16px gaps, 20–24px control/content insets, 32–40px panel spacing and 48–64px section separation. Desktop page introductions use 80px above and 60px below; tablet introductions use 48px/42px and mobile introductions use 34px/32px. Section padding moves from 64px to 44px to 34px at the same two breakpoints.

Evidence lists use aligned metadata columns, proximity and clear type hierarchy. Decorative full-width separators are omitted from page introductions, adjacent content sections, the Profile record and writing/platform rows; rules remain where they mark an actual control, table or structural boundary. Credentials use two equal columns of independent cards, collapsing to one at 600px; education has a separate full-width record. Projects pair their summary with the real command and repository action, stacking at 1000px. Keep long prose to its observed 68–75ch range and allow technical strings or code to wrap or scroll. Homepage composition and its section rail remain governed by the surface brief.

Profile follows one reading column beside a 160px contents rail with a 56px gap. The rail sticks at 112px on desktop and tracks the active section without creating a second top bar. At 1100px it becomes an in-flow native disclosure; selecting a section closes it. Profile sections separate with 72px of space, reducing to 48px on mobile. Article reading uses a 200px contents rail beside an 800px canvas, separated by 64px; at 1000px the rail becomes native contents disclosure above the prose. DOM order remains the reading order on narrow screens.

## Elevation & Depth

Depth comes primarily from tonal fields, one-pixel rules and alignment. Public evidence rows stay flat; case details use a quiet panel fill. The project grid is a fine translucent line pattern, not a separate raised layer. Utility overlays use soft shadows, and the pointer gains a restrained glow on interactive elements.

### Shadow Vocabulary

- **Assistant launcher:** `0 6px 20px #0002`, a small utility lift within navigation.
- **Assistant panel:** `0 12px 40px #0005`, separation for the open utility overlay.
- **Workflow detail:** `0 12px 32px #14181b66`, separation for a revealed project detail.
- **Cursor hover:** `0 4px 18px color-mix(in srgb, var(--signal) 19%, transparent)`, a subtle theme-aware interactive signal.

**The Tonal Depth Rule.** Separate ordinary content with proximity, space and surface tone; use fine rules for meaningful boundaries and reserve soft shadows for utility overlays, revealed workflow detail and cursor response.

## Shapes

The dominant silhouette is rectangular. Project stages, case containers and ruled evidence rows are square; tags use the tiny `tag` radius, controls use `control`, utility affordances use `utility`, and assistant/private panels use `panel`. These are light edge treatments rather than broad rounded cards.

One-pixel borders carry most structure. The field manual's custom file/checklist illustrations use thin outlines and folded document geometry. Status dots, cursor rings and the theme switch retain their circular or pill geometry because their form communicates state or motion.

## Components

### Buttons

Filled actions are compact and clear: Public Sans, the control radius, a 48px minimum height, 24px horizontal padding and a 10px icon gap. Primary fill follows the active action hover role. Outlined actions start transparent with a strong line and paper text; hover adds the soft signal fill and signal border. Disabled buttons use 0.6 opacity and the waiting cursor.

The navigation action is a compact filled rectangle, scaled to the desktop sheet. The square specimen action uses the same action, hover and foreground roles, with an action-colored border against its neutral project field. Links and buttons inherit the two-pixel signal focus outline with a five-pixel offset. Text fields change their existing one-pixel border to signal on focus, without a second outline or colored halo.

The public professional profile provides no résumé print, download or export action. The owner's actual résumé remains private; public content and navigation use Profile.

### Tags

Tags are factual metadata with a soft signal fill, subdued text, a one-pixel line, the tag radius and 7px/10px insets. They wrap with an 8px gap. Mobile tags reduce to 5px/7px insets and a 6px gap. Static tags do not acquire button behavior.

### Cards / Containers

Public records use fine rules and flat tonal surfaces. Outlined credential cards and project panels retain their current geometry in the approved palette. Credential cards use 32px insets, reducing to 24px on mobile; the issuer mark and year sit above the title, issuer and direct verification action. Native details disclosure keeps credential IDs available. Education retains its own qualification, institution, field, dates and status in a separate outlined record. Active education with valid dates adds an accessible five-pixel elapsed-time bar, date endpoints, percentage and a clear distinction between timeline progress and confirmed completion. Missing dates show an honest text status. The native bar updates over time and when the page becomes visible, without animating layout properties.

Project panels use 36px desktop insets and 24px/20px mobile insets. A command surface provides the published command and a Copy command control; it is a code sample, never an execution control. The case-study toggle animates disclosure over 420ms with natural deceleration, retains hash-link access and makes collapsed content inert. The writing index aligns date and tags, title and a short source excerpt, and the Read note action across three desktop columns; mobile stacks this information in reading order. Excerpts end at a sentence or word boundary and retain the published article's meaning.

Article code frames keep the fixed graphite background and cream code foreground in both themes, with a language label and copy confirmation. Long code and tables scroll locally. Reading presentation removes a repeated leading page title, normalizes skipped heading levels and supplies stable section anchors while preserving the stored Markdown. Previous/next reading links retain the article titles and emphasize that text on interaction. Large writing and platform links fade their title color without filling or outlining the entire row; supporting text keeps its normal reading color.

### Inputs / Fields

Fields use a transparent background, paper text, a strong one-pixel line, the control radius and 14px/16px insets. Labels are readable 14px sans-serif text; placeholders use the shared muted role at full opacity. Focus changes the single border to signal and removes stacked outlines and glow; the caret follows the signal. The assistant composer marks its existing enclosing border on focus-within. The same thin focus treatment applies to contact, private login, and dashboard fields. Textareas resize vertically with a 170px minimum height. Status feedback appears as text beneath the form, using signal for success and the active error color for failures.

### Navigation

Navigation is sticky, opaque and separated by a bottom rule. Desktop links use Public Sans and a one-pixel emerald underline that grows from the left on hover or active state. At 1000px the links move into an outlined menu control and ruled mobile panel; mobile links mark the active route with signal text. The header is 76px at this breakpoint and 68px up to 600px. Theme and assistant controls stay within the navigation area.

The mobile panel reveals through a vertical clip over 260ms and closes in 140ms. Links enter with a 20ms sibling stagger, bounded by the six navigation items, and the three-line trigger morphs into a close glyph. Reduced motion uses an 80ms opacity transition without the clip movement or stagger. Keyboard focus, Escape, background scroll lock and closing on the desktop breakpoint remain part of the interaction. The menu and assistant close one another; the protected dashboard remains available directly at `/dashboard` outside public navigation.

Hyperlink color fades over 260ms in both directions. Emerald text actions reveal and retract a one-pixel underline over 320ms; inline article links retain a visible resting underline and add a 340ms accent sweep. Directional arrows move only 2–3px to acknowledge the link's destination. Profile and article section links track the current reading position. Public route changes use a brief 240ms opacity settle from an already-visible 0.9 state. Reduced motion retains brief color feedback and removes decorative arrow travel and route movement.

### Content Editing

The Credentials editor uses two explicit, icon-aligned entry-type choices, stacking on mobile; learning totals align their icon, count and label on the same center line. In-progress education has an estimated/exact target choice and retains owner-controlled completion. Exact-date reminders reuse the contact Worker's existing webhook after its schedule and delivery-ledger binding are activated.

Site Copy headings and prose use a small inline formatting editor with Bold, Italic and Code controls, selection retention and a live semantic preview. The renderer accepts only emphasis and inline code; HTML is escaped, and identity/navigation/URLs/SEO remain plain text. Saved settings keep their existing string shape. No public résumé action is introduced.

Headline formatting is parsed before splitting authored lines. Home and the Headline editor preview share the authored-line renderer, preserving line wrappers and the public third-line accent when formatting spans newlines. Explicit hero code uses a contained 0.64em scale and inherits the headline line height and color. Italic synthesis is scoped to authored copy emphasis; ordinary font rendering keeps synthesis disabled. These local formatting treatments do not replace the established type roles.

### Assistant

The assistant launcher stays mounted in the header while its panel renders in a body portal above navigation. Its first arrival has a 70ms settling pause followed by 420ms of natural deceleration with 20px of vertical movement. Exit takes 140ms with an 8px movement and no delay. Reduced motion uses 80ms opacity feedback without translation or delay. Entrance uses `cubic-bezier(0.16, 1, 0.3, 1)` and exit uses `cubic-bezier(0.4, 0, 1, 1)`. Visible interruptions continue from the current computed frame without replaying the pause; a development effect replay at zero opacity still counts as the first arrival. The final frame is committed before cancellation and removal. Return focus after exit, and focus the panel on touch devices to avoid opening the virtual keyboard automatically.

### Specimen Stage

A square, outlined inset stage sits inside the neutral project field. It combines a number, a sans-serif stage title and a custom line illustration; factual details use technical type nearby. Hover, focus and selection use the active soft panel and signal border. Sand connectors and metadata remain sparse. The inspect affordance becomes visible on interaction, and stays visible on mobile. A selected stage reveals its detail region without changing the global page structure.

### Overview Traffic

The private Overview keeps its statistics, traffic/path panel pair, insight panels and quick actions. Its traffic series uses the actual daily pageviews and a true zero baseline; the ceiling rounds up to a multiple of four with a minimum of four. The native SVG line uses the signal role and guides use line. Each date/value point has a 44px button hit area, an accessible full date and count, and a visible dot focus indicator. Keyboard focus, pointer hover and touch activation update the adjacent polite live readout. Date labels use UTC to keep a stored day stable.

An empty series shows an explicit no-data message. One day renders a centered point without fabricating a line; all-zero values sit on the zero baseline. The chart retains the former 220px footprint, reducing to 175px at 560px. Point feedback changes color and transform over 200ms; reduced motion removes the transform and transition. Chart values and layout coordinates do not animate.

### Theme and Cursor

The theme switch pairs sun/moon line icons with a signal-outlined track and a paper thumb. The desktop track is 48px by 29px with a 20px thumb; tablet/mobile uses 40px by 25px with a 17px thumb. Small-screen icons hide while the track remains. Theme preference persists; principal surfaces and controls transition background, text and border colors over 0.3s with ease.

The supplementary cursor uses a 30px ring and a 3px dot. Interactive hover expands the ring to 46px and adds a quiet emerald fill/glow. The follower interpolates 16% of the remaining distance per frame and stops animating when settled. It is enabled only for fine pointers with motion allowed. Reduced motion disables CSS animation and transition, smooth scrolling and the custom follower; the menu and assistant retain brief 80ms opacity feedback. Content and controls retain their regular affordances. Content reveals, where used, move 10px over 0.45s with `cubic-bezier(0.22, 1, 0.36, 1)`.

## Do's and Don'ts

### Do:

- **Do** use paired theme roles for public and dashboard surfaces, including neutral project specimens; retain the fixed paired code canvas.
- **Do** keep reading content in Public Sans and reserve JetBrains Mono for code, tags, technical metadata and footer details.
- **Do** build hierarchy with type, proximity, margins and tonal fields; keep rules for meaningful boundaries.
- **Do** preserve visible keyboard focus, thin single-border field focus, readable light and dark states, and the reduced-motion and pointer accommodations.
- **Do** use inline line icons or the established custom file/checklist geometry for technical illustrations.

### Don't:

- **Don't** reintroduce fixed emerald specimen fields or the dashboard's superseded gray/lime literals in place of shared roles.
- **Don't** make the homepage's split composition or section rail a requirement for other surfaces.
- **Don't** turn static tags into controls or make the custom cursor the only sign that an element is interactive.
- **Don't** replace readable sans-serif prose with terminal-style monospace text.

## Signal Routes Background

The owner selected **Signal Routes (B)** on 2026-10-18 to extend the current field-manual canvas. Sparse parallel paths, 45-degree bends, hollow junctions and a few registration marks frame the existing content. The page ground remains the exact graphite/parchment role; foreground typography, layout and project specimens retain their established presentation. The selected study is background direction, not authority for its generated foreground text or proportions.

`src/signal-background.css` supplies two decorative SVG alpha masks through bounded, absolute body pseudo-elements. The upper routes use `--signal` at 0.30 opacity in dark mode and 0.12 in light mode. The lower return routes use `--warm` at 0.20/0.10. Profile, article and private workspace surfaces multiply those strengths by 0.55. Keep the artwork subordinate to reading, forms and evidence; opaque panels, navigation and overlays retain their paired surfaces.

The artwork is centered within 1600px, scrolls with the document and never extends its height. Desktop mask heights cap at 1100px and 640px. At 600px and below, fewer paths move to the margins, using bounded 1100px/640px masks. Both pseudo-elements ignore pointer input and sit beneath the content in the body's isolated stacking context.

The background adds no runtime JavaScript, external artwork request, animation loop, fixed canvas or continuously moving layer. SVGs are embedded in CSS; the generated concept PNGs remain local review assets. Only theme-color and route-strength transitions run, over 300ms/240ms; reduced motion removes those transitions. Browsers without CSS mask support retain the plain paired canvas. The existing cursor, mobile navigation, assistant and theme persistence remain independent.

