# TEDxBITSGoa Arcade: agent contract

Read this before changing the project.

## Non-negotiables

1. Only accept a Google ID token after server-side signature, audience, issuer,
   expiry, `email_verified`, and `hd === "goa.bits-pilani.ac.in"` checks. An
   email suffix alone is not proof of Workspace membership.
2. Google `sub` is the player key. Email is display/contact data, never the
   identity key.
3. The browser is never authoritative for a score. Scoreable play needs a
   server-issued one-time run ticket; finish endpoints must consume it once.
4. Store only a player’s current PB for each game. The public board is top 10,
   ties go to the earlier verified PB.
5. Do not expose student email addresses on the leaderboard or in client logs.
6. Game versions and score formulas are frozen while a campaign is live. Make a
   new version between campaigns, never silently change a scoring constant.
7. Do not use the Pac-Man name, original artwork, character names, or audio in
   public campaign design. The maze-chase mechanics are okay; the branding must
   be original and licensed.
8. Keep the shell responsive, keyboard usable, touch usable, and small. Avoid
   polling loops, giant images, or frontend-only data stores for scores.

## Source of truth

- `config/campaign.ts`: launch switch, campaign dates, form link, domain, leaderboard size
- `config/games.ts`: game IDs, version, and embed route
- `lib/auth.ts`: Google verification and sessions
- `lib/score-validation.ts`: server acceptance rules
- `app/api/runs/*`: ticket issue/finish protocol
- `db/schema.ts` and `drizzle/`: durable data model and migrations
- `public/games/`: vendored game engines; preserve source notices
- `docs/`: organiser and handoff documentation

## Required checks after a meaningful change

1. `npm run build`
2. `npm run lint`
3. `npm test`
4. If `db/schema.ts` changed: `npm run db:generate`, inspect the new SQL, and
   update the related docs.

## Things that need an explicit human decision

- Exact campaign opening/closing timestamps
- Public display-name policy
- Google Form URL
- Google OAuth production client and allowed origins
- Any scoring/difficulty change after the campaign has started
- Any new external data service, tracking, payment, email, or student-data use
