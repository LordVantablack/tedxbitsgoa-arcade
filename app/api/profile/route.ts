import { requireSessionUser } from "../../../lib/auth";
import { ApiError, jsonError, parseJsonObject, requireSameOrigin } from "../../../lib/http";
import { getRuntimeEnv } from "../../../lib/runtime";
import { normalizeAvatar } from "../../../config/avatar";

export const runtime = "edge";

const HANDLE = /^[A-Za-z0-9][A-Za-z0-9 _-]{2,15}$/;

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await requireSessionUser();
    const body = parseJsonObject(await request.json());
    const handle = typeof body.handle === "string" ? body.handle.trim().replace(/\s+/g, " ") : "";
    const avatar = normalizeAvatar(body.avatar);
    if (!HANDLE.test(handle)) throw new ApiError(400, "Use 3–16 letters, numbers, spaces, hyphens, or underscores.");

    try {
      await getRuntimeEnv().DB
        .prepare("UPDATE players SET handle = ?, handle_normalized = ?, avatar_config = ? WHERE google_subject = ?")
        .bind(handle, handle.toLocaleLowerCase("en-US"), JSON.stringify(avatar), user.googleSubject)
        .run();
    } catch (error) {
      if (String(error).toLowerCase().includes("unique")) {
        throw new ApiError(409, "That callsign is already taken. Try another one.");
      }
      throw error;
    }

    return Response.json({ player: { email: user.email, displayName: user.displayName, handle, avatarId: null, avatar } });
  } catch (error) {
    return jsonError(error);
  }
}
