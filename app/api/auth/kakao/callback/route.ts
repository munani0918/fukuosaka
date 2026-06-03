import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_NEXT_COOKIE_NAME,
  clearOAuthCookies,
  createSessionToken,
  KAKAO_STATE_COOKIE_NAME,
  safeInternalPath,
  setSessionCookie,
} from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

type KakaoTokenResponse = {
  access_token?: string;
  token_type?: string;
  error?: string;
};

type KakaoUserResponse = {
  id?: number | string;
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
};

function redirectToLogin(request: NextRequest, error: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  clearOAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) {
    return redirectToLogin(request, "kakao_not_configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(KAKAO_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return redirectToLogin(request, "invalid_state");
  }

  const redirectUri = new URL("/api/auth/kakao/callback", request.nextUrl.origin).toString();

  try {
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      return redirectToLogin(request, "kakao_login_failed");
    }

    const tokenJson = (await tokenResponse.json()) as KakaoTokenResponse;
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      return redirectToLogin(request, "kakao_login_failed");
    }

    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok) {
      return redirectToLogin(request, "kakao_login_failed");
    }

    const userJson = (await userResponse.json()) as KakaoUserResponse;
    const providerUserId =
      typeof userJson.id === "number" ? String(userJson.id) : userJson.id;

    if (!providerUserId) {
      return redirectToLogin(request, "kakao_login_failed");
    }

    const nickname =
      userJson.kakao_account?.profile?.nickname ||
      userJson.properties?.nickname ||
      "카카오 사용자";
    const profileImage =
      userJson.kakao_account?.profile?.profile_image_url ||
      userJson.properties?.profile_image;

    const token = await createSessionToken({
      provider: "kakao",
      providerUserId,
      nickname,
      profileImage,
      loggedInAt: new Date().toISOString(),
    });

    const nextPath = safeInternalPath(
      request.cookies.get(AUTH_NEXT_COOKIE_NAME)?.value,
      "/account?login=success",
    );
    const response = NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    response.headers.set("Cache-Control", "no-store");
    setSessionCookie(response, token);
    clearOAuthCookies(response);
    return response;
  } catch {
    return redirectToLogin(request, "kakao_login_failed");
  }
}
