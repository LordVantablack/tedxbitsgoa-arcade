import { isCampaignLive } from "../../../../config/campaign";
import { GAMES, isGameId } from "../../../../config/games";
import { requireSessionUser } from "../../../../lib/auth";
import { createOpaqueId, createSeed } from "../../../../lib/ids";
import { ApiError, jsonError, parseJsonObject, requireSameOrigin } from "../../../../lib/http";
import { getRuntimeEnv } from "../../../../lib/runtime";

export const runtime = "edge";

const RUN_TICKET_TTL_MS = 2 * 60 * 60 * 1_000;
const START_RATE_WINDOW_MS = 60 * 60 * 1_000;
const MAX_RUNS_PER_HOUR = 60;

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!isCampaignLive()) throw new ApiError(403, "The arcade campaign is not live right now.");
    const user = await requireSessionUser();
    const body = parseJsonObject(await request.json());
    const gameId = typeof body.gameId === "string" ? body.gameId : "";
    if (!isGameId(gameId)) throw new ApiError(400, "Choose a valid game.");

    const db = getRuntimeEnv().DB;
    const startedSince = new Date(Date.now() - START_RATE_WINDOW_MS).toISOString();
    const rate = await db
      .prepare("SELECT COUNT(*) AS count FROM run_tickets WHERE google_subject = ? AND issued_at >= ?")
      .bind(user.googleSubject, startedSince)
      .first<{ count: number }>();
    if ((rate?.count ?? 0) >= MAX_RUNS_PER_HOUR) {
      throw new ApiError(429, "Take a breather—please try another run in a little while.");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + RUN_TICKET_TTL_MS);
    const runId = createOpaqueId();
    const seed = createSeed();
    const game = GAMES[gameId];
    await db
      .prepare(
        `INSERT INTO run_tickets (id, google_subject, game_id, game_version, seed, issued_at, expires_at, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'issued')`,
      )
      .bind(runId, user.googleSubject, gameId, game.version, seed, now.toISOString(), expiresAt.toISOString())
      .run();

    return Response.json({ runId, gameId, gameVersion: game.version, seed, issuedAt: now.toISOString(), expiresAt: expiresAt.toISOString() });
  } catch (error) {
    return jsonError(error);
  }
}
