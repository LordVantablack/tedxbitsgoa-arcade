import { cookies } from "next/headers";
import { createSession, sessionCookieOptions, verifyGoogleCredential } from "../../../../lib/auth";
import { ApiError, jsonError, parseJsonObject, requireSameOrigin } from "../../../../lib/http";
import { getRuntimeEnv } from "../../../../lib/runtime";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = parseJsonObject(await request.json());
    const credential = typeof body.credential === "string" ? body.credential : "";
    if (!credential || credential.length > 20_000) throw new ApiError(400, "Google sign-in did not return a valid credential.");

    const user = await verifyGoogleCredential(credential);
    const db = getRuntimeEnv().DB;
    const now = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO players (google_subject, email, display_name, picture_url, created_at, last_seen_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(google_subject) DO UPDATE SET
           email = excluded.email,
           display_name = excluded.display_name,
           picture_url = excluded.picture_url,
           last_seen_at = excluded.last_seen_at`,
      )
      .bind(user.googleSubject, user.email, user.displayName, user.pictureUrl, now, now)
      .run();

    const session = await createSession(user);
    (await cookies()).set({ ...sessionCookieOptions(request), value: session });

    return Response.json({
      player: { email: user.email, displayName: user.displayName },
    });
  } catch (error) {
    return jsonError(error);
  }
}
