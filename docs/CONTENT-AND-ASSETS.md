# Content and assets

This first version uses a simple Git-based content workflow rather than a
database CMS. That is intentional: it is free, fast, reviewable, and safer for
a short campaign. A future headless CMS can sit on top of the same semantic
asset map without changing score logic.

## Adding or replacing an asset

1. Put the image or sound in the matching game folder under `public/games/`.
2. Use a descriptive filename such as `tedx-runner-jump.ogg`, never
   `final-final-new.mp3`.
3. Change only the matching asset reference or documented asset map.
4. Test the game on a phone and laptop.
5. Record source/licensing in `docs/GAME-SOURCES-AND-LICENSES.md`.

## Practical limits

- Interface images: SVG, WebP, or PNG; aim below 300 KB per image.
- Game sprites: PNG/WebP with transparency; preserve frame size if a game uses
  a sprite sheet.
- Sound: OGG/MP3; aim below 250 KB per effect and below 1.5 MB per loop.
- Do not add large videos to the game shell during the campaign.

## What a future CMS should and should not control

A later CMS may safely control copy, cabinet artwork, audio URLs, and form links.
It must not control game versions, scoring rules, allowed domain, campaign close
time, or database identity rules without a reviewed code/config change.
