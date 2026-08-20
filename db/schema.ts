import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  googleSubject: text("google_subject").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  pictureUrl: text("picture_url"),
  handle: text("handle"),
  handleNormalized: text("handle_normalized"),
  avatarId: text("avatar_id"),
  avatarConfig: text("avatar_config"),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
}, (table) => [uniqueIndex("players_handle_normalized_unique").on(table.handleNormalized)]);

export const runTickets = sqliteTable(
  "run_tickets",
  {
    id: text("id").primaryKey(),
    googleSubject: text("google_subject")
      .notNull()
      .references(() => players.googleSubject, { onDelete: "cascade" }),
    gameId: text("game_id").notNull(),
    gameVersion: text("game_version").notNull(),
    seed: text("seed").notNull(),
    issuedAt: text("issued_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    submittedAt: text("submitted_at"),
    status: text("status").notNull().default("issued"),
  },
  (table) => [index("run_tickets_player_issued_idx").on(table.googleSubject, table.issuedAt)],
);

export const personalBests = sqliteTable(
  "personal_bests",
  {
    gameId: text("game_id").notNull(),
    googleSubject: text("google_subject")
      .notNull()
      .references(() => players.googleSubject, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    achievedAt: text("achieved_at").notNull(),
    runTicketId: text("run_ticket_id")
      .notNull()
      .references(() => runTickets.id, { onDelete: "restrict" }),
    gameVersion: text("game_version").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.googleSubject] }),
    index("personal_bests_leaderboard_idx").on(table.gameId, table.score, table.achievedAt),
  ],
);

export const runEvidence = sqliteTable("run_evidence", {
  runTicketId: text("run_ticket_id")
    .primaryKey()
    .references(() => runTickets.id, { onDelete: "cascade" }),
  evidenceJson: text("evidence_json").notNull(),
  createdAt: text("created_at").notNull(),
});
