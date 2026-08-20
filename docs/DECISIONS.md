# Decisions

## 001 — Google Workspace sign-in

The campaign identifies players through Google ID tokens, verifying Google’s
signature and the `hd` claim for `goa.bits-pilani.ac.in`. This is stronger than
checking an email suffix and avoids collecting passwords.

## 002 — PB-only leaderboards

Each player has one best score per game. It keeps the database small, avoids a
history dashboard, and makes the leaderboard easy to explain.

## 003 — Tickets plus manual finalist review

One-time tickets and plausibility checks deter trivial tampering. Finalist
review handles the residual risk without building a costly anti-cheat system.

## 004 — No live leaderboard polling

The board loads on page open and after PB submission. This is plenty for a
campus campaign and keeps free hosting usage low.

## 005 — Git-based assets first

An asset manifest and documented folders are faster and safer than a custom CMS
for a 10–15 day event. A CMS can be added later for non-security content.
