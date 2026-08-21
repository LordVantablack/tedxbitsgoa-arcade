import { CAMPAIGN, isLeaderboardEligibleEmail } from "../../../../config/campaign";
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
        `SELECT p.handle AS displayName, pb.score AS score, pb.achieved_at AS achievedAt
         FROM personal_bests pb
         INNER JOIN players p ON p.google_subject = pb.google_subject
         WHERE pb.game_id = ?
           AND p.handle IS NOT NULL
           AND LENGTH(p.handle) BETWEEN 3 AND 16
           AND LOWER(p.email) GLOB ?
         ORDER BY pb.score DESC, pb.achieved_at ASC
         LIMIT ?`,
      )
      .bind(gameId, CAMPAIGN.leaderboardEligibleEmailGlob, CAMPAIGN.leaderboardSize)
      .all<{ displayName: string; score: number; achievedAt: string }>();

    const session = await getSessionUser();
    let viewer: { score: number; rank: number | null; leaderboardEligible: boolean } | null = null;
    if (session) {
      const leaderboardEligible = isLeaderboardEligibleEmail(session.email);
      const personalBest = await getRuntimeEnv().DB
        .prepare(
          `SELECT pb.score AS score, pb.achieved_at AS achievedAt
           FROM personal_bests pb
           INNER JOIN players p ON p.google_subject = pb.google_subject
           WHERE pb.game_id = ? AND pb.google_subject = ?
             AND p.handle IS NOT NULL
             AND LENGTH(p.handle) BETWEEN 3 AND 16`,
        )
        .bind(gameId, session.googleSubject)
        .first<{ score: number; achievedAt: string }>();
      if (personalBest) {
        let rank: number | null = null;
        if (leaderboardEligible) {
          const ahead = await getRuntimeEnv().DB
            .prepare(
              `SELECT COUNT(*) AS count
               FROM personal_bests pb
               INNER JOIN players p ON p.google_subject = pb.google_subject
               WHERE pb.game_id = ?
                 AND p.handle IS NOT NULL
                 AND LENGTH(p.handle) BETWEEN 3 AND 16
                 AND LOWER(p.email) GLOB ?
                 AND (pb.score > ? OR (pb.score = ? AND pb.achieved_at < ?))`,
            )
            .bind(gameId, CAMPAIGN.leaderboardEligibleEmailGlob, personalBest.score, personalBest.score, personalBest.achievedAt)
            .first<{ count: number }>();
          rank = (ahead?.count ?? 0) + 1;
        }
        viewer = { score: personalBest.score, rank, leaderboardEligible };
      }
    }

    return Response.json({ game: GAMES[gameId], entries: results ?? [], viewer, provisional: true });
  } catch (error) {
    return jsonError(error);
  }
}
