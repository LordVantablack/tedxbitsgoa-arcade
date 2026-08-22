# Game sources and licenses

The listed projects provide a mechanics foundation. Their code license does not
automatically license every art, sound, name, logo, or character included in a
demo. Keep the required source notice with any substantial copied code.

| Cabinet | Upstream | Pinned commit | Code license | Integration note |
| --- | --- | --- | --- | --- |
| Stage Flight (replaces Deadline Dash) | Original TEDxBITSGoa implementation; mechanics informed by [digitsensitive/phaser3-typescript](https://github.com/digitsensitive/phaser3-typescript) | `05f7c8c` | MIT reference | No upstream art, audio, or code assets are shipped; retain the MIT reference notice. The retired runner source remains in the repository with its BSD notice. |
| Stage Stack | [iamkun/tower_game](https://github.com/iamkun/tower_game) | `c6fa84a` | MIT (LICENSE file) | Preserve MIT notice; source package metadata says ISC, also permissive. The TEDxBITSGoa presentation uses organiser-supplied cloud and campus-building art plus an original OpenAI-generated crane; upstream decorative and interface artwork is not loaded. |
| Maze Chase | [KamranBoroomand/PacMan](https://github.com/KamranBoroomand/PacMan) | `2261d70` | MIT | Preserve MIT notice; replace all Pac-Man-like visual/audio/branding before public launch. |

## TEDxBITSGoa cabinet covers

| Asset | Source / licence | Notes |
| --- | --- | --- |
| `public/media/arcade-cabinets/deadline-dash-cover.png` | Created with OpenAI image generation for TEDxBITSGoa | Original runner cover; no upstream game art. |
| `public/media/arcade-cabinets/stage-stack-cover.png` | Created with OpenAI image generation for TEDxBITSGoa | Original stage-building cover; no upstream game art. |
| `public/media/arcade-cabinets/maze-chase-cover.png` | Created with OpenAI image generation for TEDxBITSGoa | Original abstract maze cover; intentionally excludes Pac-Man-associated art and branding. |
| `public/media/arcade-cabinets/deadline-dash-shell.png` | Created with OpenAI image generation for TEDxBITSGoa | Original blue pixel arcade shell; green-screen background and monitor opening removed locally. |
| `public/media/arcade-cabinets/stage-stack-shell.png` | Created with OpenAI image generation for TEDxBITSGoa | Original grey pixel arcade shell; green-screen background and monitor opening removed locally. |
| `public/media/arcade-cabinets/idea-circuit-shell.png` | Created with OpenAI image generation for TEDxBITSGoa | Original orange pixel arcade shell; green-screen background and monitor opening removed locally. |
| `public/games/maze-chase/images/coordinators/{king,manan,meghana,priyansh}.png` | Created with OpenAI image generation for TEDxBITSGoa from organiser-supplied coordinator reference photographs on 2026-08-21 | Original outlined portrait tokens used by Idea Circuit pursuers; chroma-key backgrounds removed locally. |

## Arcade shell artwork

| Asset | Source / licence | Notes |
| --- | --- | --- |
| `public/media/tedxbitsgoa-hero-ribbon.png` | Supplied by the TEDxBITSGoa organiser on 2026-08-21; background removed with an OpenAI image edit and local chroma-key processing | Landing-page hero ribbon; its artwork and lettering were retained. |

## Stage Stack game artwork

| Asset | Source / licence | Notes |
| --- | --- | --- |
| `public/games/stage-stack/assets/tedx-cloud-sky.png` and `background.png` / `main-bg.png` | Supplied by the TEDxBITSGoa organiser on 2026-08-20 | Original cloud-sky artwork supplied for this game’s background. |
| `public/games/stage-stack/assets/tedx-bits-building.png` and derived block sprites | Supplied by the TEDxBITSGoa organiser on 2026-08-20; background removed locally | Campus-building art supplied for Stage Stack blocks. |
| `public/games/stage-stack/assets/tedx-crane.png` and derived `hook.png` | Created with OpenAI image generation for TEDxBITSGoa | Original pixel crane; no third-party crane artwork is shipped. |

## Sober Parhawk game artwork

| Asset | Source / licence | Notes |
| --- | --- | --- |
| `public/games/deadline-dash/assets/stage-flight-column-posters-a.png` and `stage-flight-column-posters-b.png` | Created with OpenAI image generation for TEDxBITSGoa using organiser-supplied portico-column reference photography | Original rectangular pixel column textures with abstract, unreadable poster blocks; no logos or third-party poster artwork. |
| `public/games/deadline-dash/assets/stage-flight-upper-rect-light.png` | Created with OpenAI image generation for TEDxBITSGoa using the existing lamp treatment and organiser-supplied portico-column reference photography | Original rectangular overhead light/column texture; the game crops its rectangular body and uses the same rectangle for rendering and collision. |

## Before public launch

- Keep the shipped `THIRD_PARTY_NOTICES.md` file with the applicable BSD/MIT notices.
- Remove or replace any asset whose ownership is uncertain.
- Remove the inherited Stage Stack Google Analytics snippet before making that
  cabinet public; this campaign does not use third-party analytics.
- Do not market the maze cabinet as Pac-Man or use protected character names.
- Record the licence/source of each newly added image, font, and sound.
