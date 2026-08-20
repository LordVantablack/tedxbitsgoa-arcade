# Deployment

The project targets Cloudflare-compatible Sites hosting with one D1 binding
named `DB`. Static game files and the application ship together.

## Required runtime values

| Name | What it is | Secret? |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | No, but configure it only for your arcade origin |
| `SESSION_SECRET` | A fresh random string of at least 32 characters | Yes |
| `ADMIN_EMAILS` | Optional comma-separated organiser addresses | Treat as private configuration |

## Deployment checklist

1. Ensure `.openai/hosting.json` declares `"d1": "DB"`.
2. Generate/inspect Drizzle migration files whenever `db/schema.ts` changes.
3. Build and test locally.
4. Set runtime values in the hosting environment—not in Git or frontend code.
5. Deploy privately first, test Google sign-in and all three score flows, then
   make the campaign URL available to students.

## Free-tier fit

For roughly 600 students and a 10–15 day campaign, static hosting plus a small
D1 database should fit free usage if the app does not poll leaderboards.
Custom domains are optional and are the likely non-zero cost.

## Rollback

If a new deployment breaks gameplay, redeploy the last known-good site version.
Do not roll back D1 by deleting student scores. Pause the campaign first, then
make a deliberate migration/recovery decision.
