# Hero Canvas authoring

Open the existing private `/dashboard` and choose **Hero canvas** in the sidebar. The editor changes the project drawing on the homepage. The grid, Graphite / Emerald / Parchment roles, fonts and surrounding portfolio layout remain established by the site design system.

## Edit a scene

1. Choose a **Project scene**, or use **Add scene**. New scenes use an unused visible project when one is available. The initial disabled layout is derived from the existing Console workflow or another visible project's published name and description.
2. Add a **Box**, **Rectangle**, **Ellipse**, **Diamond**, **Line**, **Arrow**, **Text** or **Markdown** element. Select it on the canvas or in **Layers**.
3. Edit its content and treatment in **Inspector**. Box and text content supports bold, italic, inline code and line breaks; Markdown also supports headings, lists, tables and links. The canvas is the preview. HTML, images and form inputs are excluded.
4. Drag to move; drag the corner handle to resize. **Snap** aligns pointer changes to the displayed grid. The X, Y, width and height fields use percentages and remain inside the stage. Rotation is bounded to −180° through 180°.
5. Use the inspector controls to duplicate, delete, bring forward or send backward. Later layers draw above earlier layers. **Lock position** disables dragging, keyboard geometry changes and geometry fields; content and visual treatment can still be edited. **Hide publicly** hides the element in both public arrangements while retaining it in the editor.

The available treatments are **Outline**, **Surface**, **Emphasis** and **Quiet**. They select existing semantic theme roles. They do not accept arbitrary colors, CSS or scripts.

The element's optional **Element link** takes priority over **On-click details**. If no valid link is present, details appear as a contained Markdown disclosure publicly. Links are not followed in the editor. Accepted destinations are root-relative site paths, fragment links and HTTP(S) URLs without credentials; executable schemes, protocol-relative URLs, whitespace/control characters and backslashes are rejected. HTTP(S) links open with opener protection. Root-relative Markdown links and the scene action use React Router.

## Arrange desktop and mobile

**Desktop** and **Mobile** switch between separate stored position, size and rotation values. Editing one arrangement does not overwrite the other. Desktop uses a 900 × 560 logical stage. Mobile uses a 360px logical width with an adjustable height from 360 to 1600px. The fixed grid is 47px on desktop and 30px on mobile.

In Mobile, **Stack elements for mobile** is an explicit arrangement action: it stacks content, adjusts the mobile stage height and hides lines/arrows on mobile. It preserves desktop geometry. **Hide on mobile only** is available per element.

Keyboard controls work when the element or resize handle has focus:

| Control | Result |
| --- | --- |
| Arrow keys on an element | Move by 1 percentage point |
| Shift + Arrow keys | Move by 5 percentage points |
| Arrow keys on the resize handle | Resize by the same step |
| Delete / Backspace on an unlocked element | Delete the element |
| Escape during a pointer drag | Cancel that drag |
| Ctrl/Cmd + Z outside a text/select field | Undo a canvas change |
| Ctrl/Cmd + Shift + Z outside a text/select field | Redo a canvas change |

The undo/redo history is bounded to 40 prior changes. A completed pointer drag is one undo step. Text fields retain their native editing shortcuts.

## Choose the public scene

Expand **Scene settings** to edit its title, subtitle, linked project, action label, action URL and mobile height. An empty action URL uses the linked project's case-study path, or `/projects` for an unlinked scene. **Open this scene first** chooses the initial public scene. **Reset scene template** rebuilds the scene from the current linked project; **Clear scene** removes its elements. These changes can be undone before leaving the editor.

The homepage displays one scene at a time. Visitors select project tabs manually; scenes never rotate automatically. Desktop tabs use Left/Right, Home and End; mobile tabs are vertical with complete wrapping titles and also support Up/Down. Selecting a different scene closes any open element details.

A scene linked to a project is eligible publicly only while that project is visible. Unlinked custom scenes are eligible. Publishing an enabled layout blocks a scene whose linked project is hidden or missing. If a previously linked project later becomes unavailable, its scene is excluded publicly; the first remaining eligible scene is used if the default is unavailable. With no eligible scene, the homepage retains its original Console hero.

## Save and publish

Edits stay local until the explicit save action succeeds. Dirty changes are kept after a short delay in this browser's local storage under `portfolio:hero-canvas-draft:v1`; the next visit offers **Restore draft** or **Discard draft**. Draft storage is optional and tied to this browser. It is not a cloud draft or a publish action.

With **Show custom canvas on home** checked, use **Publish canvas** to save and enable the custom scene layout. With it unchecked, use **Save layout** to store the layout while leaving the original hero active. Save is disabled when unchanged, while saving, or while validation issues are present. A failure leaves the edited state and local draft available for retry. A successful save clears the local draft. Turning custom display off takes effect publicly only after saving.

The version 1 contract is optional `heroCanvas` data in the existing `siteSettings/main` document:

| Bound | Limit |
| --- | --- |
| Scenes | 8 |
| Elements per scene | 60 |
| Element text and detail | 4000 characters each |
| Serialized configuration | 220000 UTF-8 bytes |
| Scene title / subtitle / action label | 100 / 180 / 80 characters |
| Link length | 2048 characters |

The normalizer accepts only the versioned scene/element fields, supported geometry and semantic treatments. It bounds values, drops invalid/duplicate scene or element identities and strips unsafe links. Missing, disabled, unsupported-version, oversized or otherwise unusable legacy data falls back to the original hero. A valid enabled configuration must still contain an eligible public scene.

`saveHeroCanvas` validates against freshly read projects and merges only the `heroCanvas` field. The existing Site Copy save omits that field so a stale copy form cannot overwrite a newer layout. Both paths invalidate the public cache and dispatch a partial settings update. The settings provider merges that patch and guards it against an older pending load. The editor remains inside the existing dashboard authentication boundary; it adds no service, secrets or ImageKit assets.

Local verification uses real public read data, a mocked editor save and synthetic assistant replies, with other writes blocked. It does not establish a production Firebase publish or AI-provider traffic. The owner must use the authenticated editor's explicit publish action to make an authored layout live.
