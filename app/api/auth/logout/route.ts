import { cookies } from "next/headers";
import { clearSessionCookie } from "../../../../lib/auth";
import { jsonError, requireSameOrigin } from "../../../../lib/http";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    (await cookies()).set({ ...clearSessionCookie(request), value: "" });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
