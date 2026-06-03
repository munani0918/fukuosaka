import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "fukuosaka_session";
export const KAKAO_STATE_COOKIE_NAME = "fukuosaka_kakao_state";
export const AUTH_NEXT_COOKIE_NAME = "fukuosaka_auth_next";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

export type AuthProvider = "kakao";

export type AppSession = {
  provider: AuthProvider;
  providerUserId: string;
  nickname: string;
  profileImage?: string;
  loggedInAt: string;
  exp?: number;
};

type SessionTokenInput = Omit<AppSession, "exp">;

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function getOAuthCookieOptions(maxAge = OAUTH_STATE_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createSessionToken(payload: SessionTokenInput) {
  const issuedAt = Math.floor(Date.now() / 1000);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + SESSION_TTL_SECONDS)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, getAuthSecret());
    const payload = verified.payload;

    if (
      payload.provider !== "kakao" ||
      typeof payload.providerUserId !== "string" ||
      typeof payload.nickname !== "string" ||
      typeof payload.loggedInAt !== "string"
    ) {
      return null;
    }

    return {
      provider: payload.provider,
      providerUserId: payload.providerUserId,
      nickname: payload.nickname,
      profileImage:
        typeof payload.profileImage === "string" ? payload.profileImage : undefined,
      loggedInAt: payload.loggedInAt,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    } satisfies AppSession;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", getSessionCookieOptions(0));
}

export function clearOAuthCookies(response: NextResponse) {
  response.cookies.set(KAKAO_STATE_COOKIE_NAME, "", getOAuthCookieOptions(0));
  response.cookies.set(AUTH_NEXT_COOKIE_NAME, "", getOAuthCookieOptions(0));
}

export function createRandomState() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function isSafeInternalPath(path?: string | null) {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\") || path.includes("\n") || path.includes("\r")) {
    return false;
  }
  return true;
}

export function safeInternalPath(path?: string | null, fallback = "/account"): string {
  if (typeof path === "string" && isSafeInternalPath(path)) {
    return path;
  }
  return fallback;
}

// Changing AUTH_SECRET invalidates existing signed session cookies.
export const SESSION_MAX_AGE_DAYS = 30;
