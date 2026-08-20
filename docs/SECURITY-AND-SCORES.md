# Security and score integrity

## What the system guarantees

The app only creates scoreable sessions for Google Workspace accounts whose
signed token says `hd = goa.bits-pilani.ac.in`. The supplied example
`f20241053@goa.bits-pilani.ac.in` is the shape of an eligible account.

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

## Checks by game

| Game | Server checks | Evidence retained with a PB |
| --- | --- | --- |
| Deadline Dash | Score rate and jump count are plausible for duration | Jump count and final distance |
| Stage Stack | Recomputes score from success/perfect-placement sequence; max three misses | Placement sequence and misses |
| Maze Chase | Score, level, input volume, and duration are within conservative bounds | Seeded input replay when available |

## Organiser policy

- Only the highest score per student per game is retained.
- Boards show ten places per game, ordered by score then earliest verified PB.
- Keep PB evidence until winners are confirmed, then remove it after the event’s
  documented retention date.
- Do not auto-ban a student. Flag a questionable run, review its trace, and ask
  the finalist for a brief in-person replay/confirmation if needed.
- Freeze the board at campaign close, review finalists, then export the winners.

## Privacy

The database holds the Google subject ID, verified college email, display name,
optional profile photo URL, PB, and limited PB evidence. Do not place emails in
the public leaderboard. Do not add analytics or a new data use without an
explicit organiser decision.
