# Homepage hero working brief

This is the living brief for the TEDxBITSGoa Arcade homepage hero. Keep the
decisions here short and concrete so later work can resume without replaying
the entire design conversation.

## Current scope

- Surface: homepage only (`/`), before the arcade route.
- Goal: make the first impression feel distinctive, high-energy, and aligned
  with TEDxBITSGoa Arcade while making the next action obvious.
- Current implementation: `app/LandingClient.tsx` with the shared shell styles
  in `app/globals.css`.

## Content and implementation are intentionally separate

### Positioning and UI — can be decided and built now

- Information hierarchy, copy, calls to action, navigation, layout, palette,
  typography, motion, responsive behavior, and accessibility.
- These belong in the landing component, shared CSS, and documented design
  decisions.

### Digital assets — supplied later

- Approved imagery, video, illustrations, 3D/raster artwork, audio, and any
  campaign-specific visual material.
- Keep asset references semantic rather than coupling the UI to a temporary
  filename. The existing registry in `config/theme.ts` includes
  `backgroundVideoSrc`; new hero assets should follow that pattern.
- Store public campaign media under `public/media/`, record its origin and
  licence in `docs/GAME-SOURCES-AND-LICENSES.md`, and keep interface assets
  small enough for a fast mobile landing page.

## Existing hero baseline

- Kicker: `TEDxBITSGoa / SIDE QUEST 01`
- Headline: `IDEAS IN PLAY.`
- Supporting copy, Apply and Arcade calls to action, plus an ambient-video
  placeholder.
- The shell uses black, TED red, off-white, pixel/mono typography, a grid/noise
  texture, and reduced-motion handling.

## Next design input

The design owner will provide a layout/reference and describe the desired page
structure. Record the agreed hierarchy, content, interactions, responsive
rules, and asset placeholders below before implementation.

## Decision log

| Date | Decision | Status |
| --- | --- | --- |
| 2026-08-20 | Separate hero positioning/UI work from later digital-asset work. | Active |
| 2026-08-20 | Hero becomes a two-column arcade dashboard with poster/video media and a left control wall. | Implemented |

## Agreed hero specification

### 2026-08-20 — first build direction

- Preserve the existing navigation for now; it is explicitly out of scope.
- Replace the hero's previous centred copy/actions with a two-column arcade
  dashboard: actions and audio controls on the left, campaign media on the
  right.
- Adapt the supplied pixel-font reference into the TEDx palette: warm yellow
  face, orange/red lower shading, dark pixel-style outline and offset shadow.
  This is a CSS treatment over the existing pixel font, not a copied font file.
- Use the supplied `ting.jpg` as the right-hand campaign poster, inside a
  deliberately framed dark/red cabinet treatment. It was resized to a
  mobile-friendly 990 x 1400 JPEG at
  `public/media/tedxbitsgoa-coming-soon-poster.jpg`.
- Place a clickable orientation-video panel immediately below the poster.
  It becomes a YouTube/video iframe once `orientationVideoEmbedUrl` is set in
  `config/theme.ts`; until then it clearly communicates that the video is
  incoming.
- Left controls: Instagram, enter arcade, sign in, profile studio, application,
  plus BGM/SFX sliders and a sound toggle inspired by the supplied game-menu
  reference. They are interface controls for now; no audio track is attached.

### 2026-08-20 — typography and controls refinement

- Use a thin, high-contrast pixel/mono treatment inspired by the supplied
  `pixelthin.jpeg` reference. Do not use that image as a font asset; secure a
  font licence/file separately if the exact face is required.
- Controls are one vertical game-menu list. They are clickable and support
  Up/Down (or Left/Right), Home, and End keys; native Enter activation remains
  intact.
- Homepage background is solid black. Do not use ambient gradients or grid/noise
  texture here.
- Do not overlay, filter, crop, caption, or otherwise modify the campaign
  poster. It may sit inside an external frame only.

### 2026-08-20 — approved typeface

- Use `Raster Forge` as the single font for the arcade shell. The supplied
  `RasterForge.ttf` is in `public/fonts/`; the included CC0/public-domain
  licence texts are preserved beside it and recorded in
  `THIRD_PARTY_NOTICES.md`.

### Asset provenance to complete

### 2026-08-20 — interaction correction

- Menu actions are words, not framed buttons. Pointer hover/focus selects an
  item with a small triangular cursor; click and keyboard activation use the
  same entries.
- Use white and TED red only in the hero shell. Do not introduce yellow text.
- The homepage background remains flat black with no gradient treatment.

- `tedxbitsgoa-coming-soon-poster.jpg`: supplied by the TEDxBITSGoa team on
  2026-08-20. Confirm final campaign-use permission before public launch.
