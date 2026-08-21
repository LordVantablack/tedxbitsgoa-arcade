# Game customisation

Yes: **all game sounds can be changed, muted, or volume-balanced.** You are not
locked into any of the current sound effects, music, sprites, backgrounds, or
names. The current upstream assets are only a mechanics starting point.

Use only art and audio you made, commissioned, or are licensed to use. For the
maze game especially, do not use original Pac-Man character art, sounds, music,
or public naming.

## Safe things you can change

| Cabinet | Visuals | Sounds | Feel / difficulty |
| --- | --- | --- | --- |
| Stage Flight | Flight card, light gates, stage rig, score UI | Flap, gate-clear, collision, ambient loop | Gravity, flap velocity, gate speed, gap size |
| Stage Stack | Block texture, rope, background, hearts, menus, particles | Drop, perfect drop, miss, game-over, ambient loop | Swing speed, block sway, lives, regular score, perfect streak bonus |
| Maze Chase | Maze wall style, player, pursuers, pellets, fruit, HUD, title | Movement tick, power-up, pursuit, death, win/loop music | Starting lives, level speed, frightened time, score table |

## Things to treat carefully

These affect fairness. Do not change them while students are competing:

- Maze layout, collision rules, ghost/pursuer logic, score values
- Stage Stack scoring formula, perfect tolerance, lives
- Runner collision boxes, speed curve, obstacle cadence, score formula

If one of those needs changing, close the campaign, bump the game version in
`config/games.ts`, write down the reason in `docs/DECISIONS.md`, and relaunch a
fresh board. The backend will reject a score from a mismatched game version.

## Where files live today

- `public/games/deadline-dash/images/` and the base64 audio in its `index.html`
- `public/games/stage-stack/assets/` for all current image and audio files
- `public/games/maze-chase/images/` and `public/games/maze-chase/scripts/` for
  visual and audio wiring

The shell-level palette and labels are in `config/theme.ts`. That file is a
plain-English asset registry so future visuals can be renamed without hunting
through application code.

## Sound replacement rules

1. Keep an audio file short and compressed: OGG or MP3 is fine.
2. Start audio only after the player taps/clicks; phones block autoplay.
3. Keep a mute control and avoid loud loops by default.
4. Change one sound at a time, test on a phone speaker, then deploy.
5. Keep source/permission details in `docs/GAME-SOURCES-AND-LICENSES.md`.
