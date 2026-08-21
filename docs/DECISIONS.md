# Decisions

## 001 — Google Workspace sign-in

The campaign identifies players through Google ID tokens, verifying Google’s
signature and the `hd` claim for `goa.bits-pilani.ac.in`. This is stronger than
checking an email suffix and avoids collecting passwords.

## 002 — PB-only leaderboards

Each player has one best score per game. It keeps the database small, avoids a
history dashboard, and makes the leaderboard easy to explain.

Any verified BITS Goa Workspace account may create a profile, play games, and
save personal bests. Only verified `f2026XXXX@goa.bits-pilani.ac.in` accounts
may appear on a board. The public label is the player’s unique,
organiser-approved username of at most 16 characters, never their email or
Google display name.

## 003 — Tickets plus manual finalist review

One-time tickets and plausibility checks deter trivial tampering. Finalist
review handles the residual risk without building a costly anti-cheat system.

## 004 — No live leaderboard polling

The board loads on page open and after PB submission. This is plenty for a
campus campaign and keeps free hosting usage low.

## 005 — Git-based assets first

An asset manifest and documented folders are faster and safer than a custom CMS
for a 10–15 day event. A CMS can be added later for non-security content.

## 006 — Stage Flight replaces Deadline Dash before campaign launch

The campaign switch is off, so the runner can be replaced without mixing live
scores. The `deadline-dash` machine ID is retained for existing integration
paths, but its public title is now Stage Flight and its game version is 2.0.0.
The score is one point per cleared light gate. The previous 1.0.0 runner board
must not be reopened or combined with this new version.

## 007 — Stage Flight's paced difficulty is versioned

Stage Flight 2.1.0 adds score-tiered gate speed, opening size, and spacing.
The verified score remains one point per cleared gate; the version change keeps
the new pace distinct from the fixed-difficulty 2.0.0 experience.
