# Security and score integrity

## What the system guarantees

The app accepts sign-in only for Google Workspace accounts whose signed token
says `hd = goa.bits-pilani.ac.in`. Any verified BITS Goa account may create a
profile, play the games, and save personal bests. Public leaderboard placement
is further restricted to the exact `f2026XXXX@goa.bits-pilani.ac.in` format,
where each `X` is a decimal digit.

The server checks the Google signature, audience, issuer, expiry, verified-email
flag, hosted-domain claim, and email suffix. The permanent player identity is
Google’s `sub`, not an email address.

Every scoreable run gets a high-entropy, database-backed, one-use ticket. A
student cannot reuse a finished ticket, submit it from another account, use it
after expiry, or submit it as another game/version.

## What the system deliberately does not claim

Browser games cannot prove that a human—not a script—pressed every key. This is
deterrence and auditability, not an anti-cheat arms race. The final top 10 is
therefore **provisional** and should be reviewed before fast-tracking anyone.

## Score acceptance

The server deliberately does not apply game-specific anti-cheat heuristics. Real
browser timing, input, and device differences made those checks too brittle for
an event leaderboard. A finish still requires a matching, unexpired,
server-issued one-time ticket, a safe integer score, and bounded optional
evidence. Duration is retained only as client telemetry and is not used to
reject a score. The public board remains provisional for organiser review.

## Organiser policy

- Only the highest score per student per game is retained.
- Boards show ten places per game, ordered by score then earliest verified PB.
- Boards include only eligible 2026-batch accounts with a saved username, and
  display that username rather than a Google name or email address.
- Keep PB evidence until winners are confirmed, then remove it after the event’s
  documented retention date.
- Do not auto-ban a student. Flag a questionable run, review its trace, and ask
  the finalist for a brief in-person replay/confirmation if needed.
- Freeze the board at campaign close, review finalists, then export the winners.

## Privacy

The database holds the Google subject ID, verified college email, display name,
optional profile photo URL, username, avatar choice, PB, and limited PB
evidence. Do not place emails or Google display names in the public leaderboard.
Do not add analytics or a new data use without an explicit organiser decision.
