# TEDxBITSGoa Arcade

A short, mobile-friendly recruitment arcade for TEDxBITSGoa. Students sign in
with a verified BITS Goa Google account, play three games, and keep only one
personal best per game. Each game has a public provisional top-10 board.

This is intentionally a backend-first project. The visible interface is small
and fast; the source of truth for identities, runs, and scores is the server.

## What is included

- Google sign-in limited to `@goa.bits-pilani.ac.in` Workspace accounts
- One-time, short-lived server-issued run tickets
- Personal-best-only score storage and top-10 per-game leaderboards
- Three vendored game foundations: runner, tower stacker, and maze chase
- Compact evidence attached to a student’s current PB for later review
- A documentation set for organisers and future AI/developer work

## Local start

1. Install Node 22.13 or newer and run `npm install`.
2. Copy `.env.example` to `.env.local` and add a Google Web Client ID plus a
   long random session secret.
3. Run `npm run db:generate` if the schema changes; migrations already exist
   for the current schema.
4. Run `npm run dev`.

The Google button remains unavailable until `GOOGLE_CLIENT_ID` and
`SESSION_SECRET` are supplied. That is deliberate: there is no development
bypass for college identity.

## Before publishing

- Create a production Google OAuth **Web application** client and add the real
  arcade URL to its authorised JavaScript origins.
- Set the production secrets in hosting: `GOOGLE_CLIENT_ID`, `SESSION_SECRET`,
  and optionally `ADMIN_EMAILS`.
- Set campaign dates and the induction Google Form URL in `config/campaign.ts`.
- Set `enabled: true` in that same file only when the campaign is ready to open.
- Replace every placeholder/upstream game visual and sound you do not own. See
  [game customisation](docs/GAME-CUSTOMIZATION.md) and
  [source notices](docs/GAME-SOURCES-AND-LICENSES.md).
- Deploy with the generated D1 migrations.

## Documentation map

- [Architecture](docs/ARCHITECTURE.md)
- [Configuration and launch switch](docs/CONFIGURATION.md)
- [Security and score integrity](docs/SECURITY-AND-SCORES.md)
- [Game customisation, including sounds](docs/GAME-CUSTOMIZATION.md)
- [Content and assets](docs/CONTENT-AND-ASSETS.md)
- [Campaign operations](docs/OPERATIONS-RUNBOOK.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Open-source source notices](docs/GAME-SOURCES-AND-LICENSES.md)
- [Decision log](docs/DECISIONS.md)
- [Agent contract](AGENTS.md)
