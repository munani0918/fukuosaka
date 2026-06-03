import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_NEXT_COOKIE_NAME,
  createRandomState,
  getOAuthCookieOptions,
  KAKAO_STATE_COOKIE_NAME,
  safeInternalPath,
} from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "Kakao login is not configured." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  const state = createRandomState();
  const origin = request.nextUrl.origin;
  const redirectUri = new URL("/api/auth/kakao/callback", origin).toString();
  const nextPath = safeInternalPath(request.nextUrl.searchParams.get("next"), "/account");

  const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "profile_nickname profile_image");

  const response = NextResponse.redirect(authorizeUrl);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(KAKAO_STATE_COOKIE_NAME, state, getOAuthCookieOptions());
  response.cookies.set(AUTH_NEXT_COOKIE_NAME, nextPath, getOAuthCookieOptions());
  return response;
}
