# Configuration

The intentional content/CMS boundary for this short campaign is Git: edit the two
small configuration files, commit, and deploy. It is safer and faster than
building an admin dashboard for a 10–15 day arcade.

## Launch switch

Edit `config/campaign.ts` before launch:

- set `enabled` to `true` only after the database migrations and Google settings
  exist in production;
- set ISO-8601 `startsAt` and `endsAt` for the exact campaign window;
- add the approved Google Form URL to `registrationUrl`;
- leave `allowedGoogleWorkspaceDomain` as the exact BITS Goa Workspace domain
  unless the organizers deliberately change eligibility.

With the default `enabled: false`, scoreable runs are deliberately blocked. This
prevents an unfinished or preview deployment from accumulating qualifying scores.

## Games

`config/games.ts` is the single source of truth for the three cabinets, their
versions, labels, and iframe paths. Bump a game version when a scoring rule or
playable build materially changes. Existing PBs remain attributable to their
original version.

## Assets and theme

`config/theme.ts` is the compact theme registry. Put approved public assets under
`public/` and reference them there or from `docs/CONTENT-AND-ASSETS.md`. Avoid
storing private student material in the repository.

For this campaign, the Git-backed asset registry is the CMS. If edits need to be
made by non-technical organizers, the next safe upgrade is a restricted GitHub
CMS/Decap CMS editor—not a new runtime database or admin surface.
