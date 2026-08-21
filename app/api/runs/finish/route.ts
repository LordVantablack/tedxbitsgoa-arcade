import { isGameId } from "../../../../config/games";
import { requireSessionUser } from "../../../../lib/auth";
import { ApiError, jsonError, parseJsonObject, requireSameOrigin } from "../../../../lib/http";
import { getRuntimeEnv } from "../../../../lib/runtime";
import { validateRunPayload } from "../../../../lib/score-validation";

export const runtime = "edge";

type Ticket = {
  id: string;
  googleSubject: string;
  gameId: string;
  gameVersion: string;
  expiresAt: string;
  status: string;
};

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireSessionUser();
    const body = parseJsonObject(await request.json());
    const runId = typeof body.runId === "string" ? body.runId : "";
    const gameId = typeof body.gameId === "string" ? body.gameId : "";
    const gameVersion = typeof body.gameVersion === "string" ? body.gameVersion : "";
    const score = typeof body.score === "number" ? Math.floor(body.score) : Number.NaN;
    const durationMs = body.durationMs;
    const metadata = parseJsonObject(body.metadata);
    if (!runId || !isGameId(gameId) || !gameVersion) throw new ApiError(400, "Run information is incomplete.");

    const db = getRuntimeEnv().DB;
    const ticket = await db
      .prepare(
        `SELECT id, google_subject AS googleSubject, game_id AS gameId, game_version AS gameVersion,
                expires_at AS expiresAt, status
         FROM run_tickets WHERE id = ?`,
      )
      .bind(runId)
      .first<Ticket>();
    if (!ticket || ticket.googleSubject !== user.googleSubject || ticket.gameId !== gameId || ticket.gameVersion !== gameVersion) {
      throw new ApiError(403, "This run ticket is not valid for your account.");
    }
    if (ticket.status !== "issued") throw new ApiError(409, "This run has already been submitted.");
    if (new Date(ticket.expiresAt) < new Date()) throw new ApiError(410, "This run ticket expired. Start a fresh run.");

    const evidenceJson = validateRunPayload(gameId, {
      score: typeof score === "number" ? score : Number.NaN,
      durationMs: typeof durationMs === "number" ? durationMs : Number.NaN,
      metadata,
      evidence: body.evidence,
    });
    const now = new Date().toISOString();

    const result = await db.batch([
      db.prepare("UPDATE run_tickets SET status = 'submitted', submitted_at = ? WHERE id = ? AND status = 'issued'").bind(now, runId),
      db
        .prepare(
          `INSERT INTO personal_bests (game_id, google_subject, score, achieved_at, run_ticket_id, game_version)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(game_id, google_subject) DO UPDATE SET
             score = excluded.score,
             achieved_at = excluded.achieved_at,
             run_ticket_id = excluded.run_ticket_id,
             game_version = excluded.game_version
           WHERE excluded.score > personal_bests.score`,
        )
        .bind(gameId, user.googleSubject, score, now, runId, gameVersion),
    ]);
    if ((result[0].meta.changes ?? 0) !== 1) throw new ApiError(409, "This run has already been submitted.");

    const improved = (result[1].meta.changes ?? 0) === 1;
    if (improved && evidenceJson) {
      await db
        .prepare("INSERT INTO run_evidence (run_ticket_id, evidence_json, created_at) VALUES (?, ?, ?)")
        .bind(runId, evidenceJson, now)
        .run();
    }

    const personalBest = await db
      .prepare("SELECT score, achieved_at AS achievedAt FROM personal_bests WHERE game_id = ? AND google_subject = ?")
      .bind(gameId, user.googleSubject)
      .first<{ score: number; achievedAt: string }>();

    return Response.json({ improved, personalBest, provisional: true });
  } catch (error) {
    return jsonError(error);
  }
}
