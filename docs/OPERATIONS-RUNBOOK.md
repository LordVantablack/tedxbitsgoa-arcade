# Operations runbook

## Before launch

1. Set the exact start/end time and registration form URL in `config/campaign.ts`.
2. Create a production Google Web Client ID; add the real arcade domain as an
   authorised JavaScript origin; publish the OAuth consent setup if Google asks.
3. Set `GOOGLE_CLIENT_ID` and a 32+ character `SESSION_SECRET` in hosting.
4. Deploy the D1 migrations with the site.
5. Test login using a real `@goa.bits-pilani.ac.in` account and confirm a
   non-BITS account is rejected.
6. Play each cabinet on a recent iPhone/Android and laptop browser. Confirm a
   PB appears once and a repeated run does not create multiple entries.
7. Replace any temporary/upstream visual or sound assets before public launch.

## During the campaign

- Do not edit scoring, physics, or game version.
- Refresh boards on load/after a PB; do not turn on constant polling.
- Watch the top 15, not only the top 10. Save notes for suspicious results.
- If something is badly wrong, set the campaign close time to now, deploy, and
  tell students that scores are paused while you investigate.

## Closing and induction

1. Close the campaign at the stated time.
2. Export the provisional top 10 per game.
3. Review PB evidence for finalists; request a short confirmation run only if
   something is genuinely questionable.
4. Apply the pre-announced fast-track policy. A student appearing on multiple
   boards counts once unless you explicitly decide otherwise.
5. Mark the final list and delete contender evidence according to your chosen
   retention date.
