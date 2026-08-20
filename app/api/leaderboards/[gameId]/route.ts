import { CAMPAIGN } from "../../../../config/campaign";
import { GAMES, isGameId } from "../../../../config/games";
import { ApiError, jsonError } from "../../../../lib/http";
import { getRuntimeEnv } from "../../../../lib/runtime";

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
        `SELECT p.display_name AS displayName, pb.score AS score, pb.achieved_at AS achievedAt
         FROM personal_bests pb
         INNER JOIN players p ON p.google_subject = pb.google_subject
         WHERE pb.game_id = ?
         ORDER BY pb.score DESC, pb.achieved_at ASC
         LIMIT ?`,
      )
      .bind(gameId, CAMPAIGN.leaderboardSize)
      .all<{ displayName: string; score: number; achievedAt: string }>();

    return Response.json({ game: GAMES[gameId], entries: results ?? [], provisional: true });
  } catch (error) {
    return jsonError(error);
  }
}
