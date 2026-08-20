import { cookies } from "next/headers";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";
import { CAMPAIGN } from "../config/campaign";
import { ApiError } from "./http";
import { getRuntimeEnv } from "./runtime";

const SESSION_COOKIE = "tedx_arcade_session";
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export type VerifiedGoogleUser = {
  googleSubject: string;
  email: string;
  displayName: string;
  pictureUrl: string | null;
};

export type SessionUser = Pick<VerifiedGoogleUser, "googleSubject" | "email" | "displayName">;

export async function verifyGoogleCredential(credential: string): Promise<VerifiedGoogleUser> {
  const clientId = getRuntimeEnv().GOOGLE_CLIENT_ID;
  if (!clientId) throw new ApiError(503, "Google sign-in has not been configured yet.");

  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  const googleSubject = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : "";
  const hostedDomain = typeof payload.hd === "string" ? payload.hd.toLowerCase() : "";
  const emailVerified = payload.email_verified === true;
  const allowedSuffix = `@${CAMPAIGN.allowedGoogleWorkspaceDomain}`;

  if (!googleSubject || !email || !emailVerified) {
    throw new ApiError(401, "Google could not verify this email address.");
  }
  if (hostedDomain !== CAMPAIGN.allowedGoogleWorkspaceDomain || !email.endsWith(allowedSuffix)) {
    throw new ApiError(403, "Please sign in with your @goa.bits-pilani.ac.in account.");
  }

  return {
    googleSubject,
    email,
    displayName: typeof payload.name === "string" && payload.name.trim() ? payload.name.trim().slice(0, 80) : email.split("@")[0],
    pictureUrl: typeof payload.picture === "string" ? payload.picture : null,
  };
}

export async function createSession(user: SessionUser): Promise<string> {
  const secret = getSessionSecret();
  return new SignJWT({ email: user.email, name: user.displayName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.googleSubject)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") return null;
    return { googleSubject: payload.sub, email: payload.email, displayName: payload.name };
  } catch {
    return null;
  }
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Sign in with your BITS Goa Google account first.");
  return user;
}

export function sessionCookieOptions(request: Request) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export function clearSessionCookie(request: Request) {
  return { ...sessionCookieOptions(request), maxAge: 0 };
}

function getSessionSecret(): Uint8Array {
  const secret = getRuntimeEnv().SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new ApiError(503, "Secure sessions have not been configured yet.");
  }
  return new TextEncoder().encode(secret);
}
