# Architecture

## In one sentence

The browser runs the games, while the Worker and D1 database decide who is
allowed to play, save a personal best, and appear on a leaderboard.

```text
Student browser
  ├─ Google Identity Services → signed Google ID token
  ├─ Arcade shell → Worker API → D1 (players, tickets, PBs, evidence)
  └─ Same-origin game iframe → finish message → Arcade shell → Worker API
```

## Boundaries that matter

| Part | Owns | Must not own |
| --- | --- | --- |
| Game iframe | Movement, animation, controls, a candidate score | Identity, final leaderboard writes |
| Arcade shell | Login UI, cabinet selection, sending game results | Trusting a score on its own |
| Worker API | Token verification, session, ticket issue/finish, score checks | Game rendering |
| D1 | Players, run tickets, personal bests, PB evidence | Full raw gameplay history |

## Scoreable run flow

1. A student receives a verified session after Google sign-in, creates a
   username of at most 16 characters, and chooses an avatar.
2. Any verified BITS Goa Workspace account may request a scoreable run.
3. `POST /api/runs/start` creates a random one-time run ID, seed, game version,
   issue time, and two-hour expiry.
4. The student plays inside the matching game cabinet.
5. On game over, the arcade shell sends score, duration, compact metadata, and
   small evidence to `POST /api/runs/finish`.
6. The Worker checks ownership, expiry, one-time use, game version, and simple
   game-specific plausibility rules. It then updates the player's PB only if higher.
7. A public leaderboard reads only eligible 2026-batch PB rows and saved
   usernames, never a browser cache, email address, or Google display name.

## Why this stays fast

- Games are static files from the same origin.
- The home screen makes one small leaderboard request per game on load.
- There are no sockets and no repeated background polling.
- Score writes happen only when a run ends, and durable evidence only for PBs.

## Database tables

- `players`: Google `sub`, current verified email, display name, optional photo,
  public username, and avatar choice
- `run_tickets`: one-time scoreable play permission
- `personal_bests`: exactly one row per student per game
- `run_evidence`: compact PB evidence, useful for a finalist review
