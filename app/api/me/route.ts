import { getSessionUser } from "../../../lib/auth";
import { getRuntimeEnv } from "../../../lib/runtime";
import { normalizeAvatar } from "../../../config/avatar";
import { isLeaderboardEligibleEmail } from "../../../config/campaign";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return Response.json({ player: null });

  const player = await getRuntimeEnv().DB
    .prepare("SELECT handle, avatar_id AS avatarId, avatar_config AS avatarConfig FROM players WHERE google_subject = ?")
    .bind(session.googleSubject)
    .first<{ handle: string | null; avatarId: string | null; avatarConfig: string | null }>();
  return Response.json({
    player: {
      email: session.email,
      displayName: session.displayName,
      handle: player?.handle ?? null,
      avatarId: player?.avatarId ?? null,
      avatar: parseAvatar(player?.avatarConfig),
      leaderboardEligible: isLeaderboardEligibleEmail(session.email),
    },
  });
}

function parseAvatar(value: string | null | undefined) {
  try {
    return normalizeAvatar(value ? JSON.parse(value) : null);
  } catch {
    return normalizeAvatar(null);
  }
}
