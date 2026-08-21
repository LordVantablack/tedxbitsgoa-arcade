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
        `WITH best_scores AS (
           SELECT google_subject, MAX(score) AS score
           FROM personal_bests
           WHERE game_id = ?
           GROUP BY google_subject
         ),
         best_rows AS (
           SELECT pb.google_subject, best_scores.score, MIN(pb.achieved_at) AS achievedAt
           FROM personal_bests pb
           INNER JOIN best_scores
             ON best_scores.google_subject = pb.google_subject
            AND best_scores.score = pb.score
           WHERE pb.game_id = ?
           GROUP BY pb.google_subject, best_scores.score
         )
         SELECT p.handle AS displayName, best_rows.score AS score, best_rows.achievedAt AS achievedAt
         FROM best_rows
         INNER JOIN players p ON p.google_subject = best_rows.google_subject
         WHERE 1 = 1
           AND p.handle IS NOT NULL
           AND LENGTH(p.handle) BETWEEN 3 AND 16
           AND LOWER(p.email) GLOB ?
         ORDER BY best_rows.score DESC, best_rows.achievedAt ASC
         LIMIT ?`,
      )
      .bind(gameId, gameId, CAMPAIGN.leaderboardEligibleEmailGlob, CAMPAIGN.leaderboardSize)
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
             AND LENGTH(p.handle) BETWEEN 3 AND 16
           ORDER BY pb.score DESC, pb.achieved_at ASC
           LIMIT 1`,
        )
        .bind(gameId, session.googleSubject)
        .first<{ score: number; achievedAt: string }>();
      if (personalBest) {
        let rank: number | null = null;
        if (leaderboardEligible) {
          const ahead = await getRuntimeEnv().DB
            .prepare(
              `WITH best_scores AS (
                 SELECT google_subject, MAX(score) AS score
                 FROM personal_bests
                 WHERE game_id = ?
                 GROUP BY google_subject
               ),
               best_rows AS (
                 SELECT pb.google_subject, best_scores.score, MIN(pb.achieved_at) AS achievedAt
                 FROM personal_bests pb
                 INNER JOIN best_scores
                   ON best_scores.google_subject = pb.google_subject
                  AND best_scores.score = pb.score
                 WHERE pb.game_id = ?
                 GROUP BY pb.google_subject, best_scores.score
               )
               SELECT COUNT(*) AS count
               FROM best_rows
               INNER JOIN players p ON p.google_subject = best_rows.google_subject
               WHERE 1 = 1
                 AND p.handle IS NOT NULL
                 AND LENGTH(p.handle) BETWEEN 3 AND 16
                 AND LOWER(p.email) GLOB ?
                 AND (best_rows.score > ? OR (best_rows.score = ? AND best_rows.achievedAt < ?))`,
            )
            .bind(gameId, gameId, CAMPAIGN.leaderboardEligibleEmailGlob, personalBest.score, personalBest.score, personalBest.achievedAt)
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
