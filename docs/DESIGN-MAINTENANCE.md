# Design metadata refresh — 28 October 2026

The owner requested a document pass for pre-existing metadata drift. This is a refresh of the existing Technical Field Manual system, not a visual redesign. Graphite / Emerald / Parchment, typography, page layouts, Signal Routes, portrait, cursor and approved assistant motion remain unchanged.

The official Impeccable 4.8.0 skill was installed at the user level under `~/.agents/skills/impeccable`, without replacing hook manifests. Codex's marketplace manager still returned 4.3.1 for its managed plugin; that cache was left intact. The 4.8.0 context and doctor commands were used for this pass. Doctor reported no schema findings; that does not establish that the descriptive metadata matches the code.

The source comparison found these concrete discrepancies:

| Metadata before the pass | Current source and refreshed record |
| --- | --- |
| Case detail preview showed a separate filled panel with 36px padding and 500-weight titles | It inherits its enclosing project panel, uses transparent grid disclosure with 36px top spacing and 600-weight titles |
| Case preview used 22px padding on mobile | The current mobile disclosure uses 28px top spacing/gaps; computed styles confirm its existing 14px/1.75 prose |
| Primary/outlined previews retained a 300ms transition and omitted current press/icon states | The current cascade uses 260ms color/background/border feedback, 200ms transform feedback, a one-pixel pressed offset and the existing arrow response |
| Navigation action preview omitted shared color/press feedback; navigation link preview omitted the inherited hover color | Preview snippets now carry those states and visible focus |
| Signal Routes was appended as a ninth top-level section | Its existing guidance now sits under Elevation & Depth, retaining the canonical eight-section document order |
| Synthetic color display ramps used constant chroma near black/white | Display-only ramps now reduce chroma at the extremes; all application color primitives remain exactly as implemented |

`DESIGN.md` and `.impeccable/design.json` were refreshed together. The north star, paired theme tokens, type hierarchy and assistant spring/timing records were retained. The new standalone preview snippets remain scoped with `ds-` classes and bind to the existing theme roles. Generated display ramps are examples for the design panel, not new CSS tokens or applied palettes.

Desktop and mobile computed-style checks confirm the case-detail measurements against the shipped styles. Rendered page checks confirm the existing appearance. No new detector ignore, stylesheet rewrite, font replacement or global token migration was needed.
