# Game sources and licenses

The listed projects provide a mechanics foundation. Their code license does not
automatically license every art, sound, name, logo, or character included in a
demo. Keep the required source notice with any substantial copied code.

| Cabinet | Upstream | Pinned commit | Code license | Integration note |
| --- | --- | --- | --- | --- |
| Deadline Dash | [devfolioco/t-rex-runner-game](https://github.com/devfolioco/t-rex-runner-game) | `5c438cf` | BSD-3-Clause | Preserve the BSD notice; replace sprite/audio presentation. |
| Stage Stack | [iamkun/tower_game](https://github.com/iamkun/tower_game) | `c6fa84a` | MIT (LICENSE file) | Preserve MIT notice; source package metadata says ISC, also permissive. |
| Maze Chase | [KamranBoroomand/PacMan](https://github.com/KamranBoroomand/PacMan) | `2261d70` | MIT | Preserve MIT notice; replace all Pac-Man-like visual/audio/branding before public launch. |

## Before public launch

- Keep the shipped `THIRD_PARTY_NOTICES.md` file with the applicable BSD/MIT notices.
- Remove or replace any asset whose ownership is uncertain.
- Remove the inherited Stage Stack Google Analytics snippet before making that
  cabinet public; this campaign does not use third-party analytics.
- Do not market the maze cabinet as Pac-Man or use protected character names.
- Record the licence/source of each newly added image, font, and sound.
