import { CAMPAIGN } from "../../../../config/campaign";
import { GAMES, isGameId } from "../../../../config/games";
import { ApiError, jsonError } from "../../../../lib/http";
import { getRuntimeEnv } from "../../../../lib/runtime";
import { getSessionUser } from "../../../../lib/auth";

export const runtime = "edge";

export async function GET(
  _request: Request,
  context: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await context.params;
    if (!isGameId(gameId)) throw new ApiError(404, "That game does not exist.");

    const { results } = await getRuntimeEnv().DB
      .prepare(
        `SELECT COALESCE(p.handle, p.display_name) AS displayName, pb.score AS score, pb.achieved_at AS achievedAt
         FROM personal_bests pb
         INNER JOIN players p ON p.google_subject = pb.google_subject
         WHERE pb.game_id = ?
         ORDER BY pb.score DESC, pb.achieved_at ASC
         LIMIT ?`,
      )
      .bind(gameId, CAMPAIGN.leaderboardSize)
      .all<{ displayName: string; score: number; achievedAt: string }>();

    const session = await getSessionUser();
    let viewer: { score: number; rank: number } | null = null;
    if (session) {
      const personalBest = await getRuntimeEnv().DB
        .prepare("SELECT score, achieved_at AS achievedAt FROM personal_bests WHERE game_id = ? AND google_subject = ?")
        .bind(gameId, session.googleSubject)
        .first<{ score: number; achievedAt: string }>();
      if (personalBest) {
        const ahead = await getRuntimeEnv().DB
          .prepare(
            `SELECT COUNT(*) AS count FROM personal_bests
             WHERE game_id = ? AND (score > ? OR (score = ? AND achieved_at < ?))`,
          )
          .bind(gameId, personalBest.score, personalBest.score, personalBest.achievedAt)
          .first<{ count: number }>();
        viewer = { score: personalBest.score, rank: (ahead?.count ?? 0) + 1 };
      }
    }

    return Response.json({ game: GAMES[gameId], entries: results ?? [], viewer, provisional: true });
  } catch (error) {
    return jsonError(error);
  }
}
