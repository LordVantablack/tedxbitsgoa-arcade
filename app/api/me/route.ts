import { getSessionUser } from "../../../lib/auth";

export const runtime = "edge";

export async function GET() {
  const player = await getSessionUser();
  return Response.json({ player: player ? { email: player.email, displayName: player.displayName } : null });
}
