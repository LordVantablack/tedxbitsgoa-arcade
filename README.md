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

### Docker local run

Run `docker compose up --build`, then open `http://localhost:3000`. To test
real Google login locally, create `.env.local` from `.env.example`, add the
client ID and session secret, and add `http://localhost:3000` as an authorised
JavaScript origin in that Google Web Client. Docker intentionally does not
bypass the BITS Goa identity check.

The Google button remains unavailable until `GOOGLE_CLIENT_ID` and
`SESSION_SECRET` are supplied. That is deliberate: there is no development
bypass for college identity.

## Before publishing

Use the [launch and handoff checklist](docs/LAUNCH-HANDOFF.html) as the source
of truth for the production-readiness gates, copy approvals, mobile/PWA checks,
and ownership handoff. Do not open the campaign until its required gates are
complete.

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

## After the campaign: loose ends and winners

When the arcade is done, use the production D1 database as the source of truth.
The public winners should be the highest personal bests from eligible
`f2026xxxx@goa.bits-pilani.ac.in` accounts only. The leaderboard display name is
the player `handle`, not the Google name or email.

To find the top 10 winners for every game, run this against the production D1
database, replacing `tedxbitsgoa-arcade-db` if the Cloudflare database is named
differently:

```bash
npx wrangler d1 execute tedxbitsgoa-arcade-db --remote --command "
SELECT
  pb.game_id,
  p.handle AS username,
  pb.score,
  pb.achieved_at,
  pb.run_ticket_id
FROM personal_bests pb
JOIN players p ON p.google_subject = pb.google_subject
WHERE lower(p.email) GLOB 'f2026[0-9][0-9][0-9][0-9]@goa.bits-pilani.ac.in'
  AND p.handle IS NOT NULL
ORDER BY pb.game_id ASC, pb.score DESC, pb.achieved_at ASC;
"
```

For final winner selection, take the first rows per `game_id` after sorting by:

1. higher `score`;
2. earlier `achieved_at` if scores are tied.

If a score needs review, inspect the run evidence for that `run_ticket_id`:

```bash
npx wrangler d1 execute tedxbitsgoa-arcade-db --remote --command "
SELECT
  rt.id,
  rt.game_id,
  rt.game_version,
  rt.seed,
  rt.issued_at,
  rt.submitted_at,
  rt.status,
  re.evidence_json
FROM run_tickets rt
LEFT JOIN run_evidence re ON re.run_ticket_id = rt.id
WHERE rt.id = 'PASTE_RUN_TICKET_ID_HERE';
"
```

Suggested closeout checklist:

- Export or screenshot the final winners per game.
- Keep the final deployed commit hash with the winner record.
- Do not publish student emails; publish usernames only.
- If the arcade is over, disable new play by turning off the campaign/deployment
  or removing the public route.
- After the 8–15 day event window, review Cloudflare billing/auto-pay and shut
  down anything no longer needed.
- Keep the D1 database backup/export until winners are announced and disputes
  are resolved.

## Documentation map

- [Architecture](docs/ARCHITECTURE.md)
- [Configuration and launch switch](docs/CONFIGURATION.md)
- [Security and score integrity](docs/SECURITY-AND-SCORES.md)
- [Game customisation, including sounds](docs/GAME-CUSTOMIZATION.md)
- [Avatar studio and merch-shirt handoff](docs/AVATAR-STUDIO.md)
- [Content and assets](docs/CONTENT-AND-ASSETS.md)
- [Campaign operations](docs/OPERATIONS-RUNBOOK.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Open-source source notices](docs/GAME-SOURCES-AND-LICENSES.md)
- [Decision log](docs/DECISIONS.md)
- [Agent contract](AGENTS.md)
