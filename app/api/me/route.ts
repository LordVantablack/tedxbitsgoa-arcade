import { getSessionUser } from "../../../lib/auth";
import { getRuntimeEnv } from "../../../lib/runtime";
import { normalizeAvatar } from "../../../config/avatar";
import { isLeaderboardEligibleEmail } from "../../../config/campaign";
import { isGameId } from "../../../config/games";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return Response.json({ player: null });

  const player = await getRuntimeEnv().DB
    .prepare("SELECT handle, avatar_id AS avatarId, avatar_config AS avatarConfig FROM players WHERE google_subject = ?")
    .bind(session.googleSubject)
    .first<{ handle: string | null; avatarId: string | null; avatarConfig: string | null }>();
  const { results: scores } = await getRuntimeEnv().DB
    .prepare(
      `WITH best_scores AS (
         SELECT game_id AS gameId, MAX(score) AS score
         FROM personal_bests
         WHERE google_subject = ?
         GROUP BY game_id
       )
       SELECT pb.game_id AS gameId, best_scores.score AS score, MIN(pb.achieved_at) AS achievedAt
       FROM personal_bests pb
       INNER JOIN best_scores
         ON best_scores.gameId = pb.game_id
        AND best_scores.score = pb.score
       WHERE pb.google_subject = ?
       GROUP BY pb.game_id, best_scores.score`,
    )
    .bind(session.googleSubject, session.googleSubject)
    .all<{ gameId: string; score: number; achievedAt: string }>();

  return Response.json({
    player: {
      email: session.email,
      displayName: session.displayName,
      handle: player?.handle ?? null,
      avatarId: player?.avatarId ?? null,
      avatar: parseAvatar(player?.avatarConfig),
      leaderboardEligible: isLeaderboardEligibleEmail(session.email),
    },
    scores: (scores ?? []).filter((score) => isGameId(score.gameId)),
  });
}

function parseAvatar(value: string | null | undefined) {
  try {
    return normalizeAvatar(value ? JSON.parse(value) : null);
  } catch {
    return normalizeAvatar(null);
  }
}
