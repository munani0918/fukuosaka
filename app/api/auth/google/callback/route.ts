import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_NEXT_COOKIE_NAME,
  clearOAuthCookies,
  createSessionToken,
  GOOGLE_STATE_COOKIE_NAME,
  safeInternalPath,
  setSessionCookie,
} from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfoResponse = {
  sub?: string;
  name?: string;
  given_name?: string;
  picture?: string;
  email?: string;
};

function redirectToLogin(request: NextRequest, error: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", error);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  clearOAuthCookies(response);
  return response;
}

function logCallbackFailure(
  step: string,
  details: Record<string, boolean | number | string | null | undefined> = {},
) {
  console.error(`[google-callback] ${step}`, details);
}

function fallbackNickname(user: GoogleUserInfoResponse) {
  const emailName = user.email?.split("@")[0];
  return user.name || user.given_name || emailName || "Google 사용자";
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "google_not_configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(GOOGLE_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    logCallbackFailure("state mismatch", {
      hasCode: Boolean(code),
      hasStateQuery: Boolean(state),
      hasStateCookie: Boolean(stateCookie),
      stateMatches: Boolean(state && stateCookie && state === stateCookie),
    });
    return redirectToLogin(request, "invalid_state");
  }

  const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin).toString();

  try {
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: tokenBody,
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      let tokenError: GoogleTokenResponse | null = null;
      try {
        tokenError = (await tokenResponse.json()) as GoogleTokenResponse;
      } catch {
        tokenError = null;
      }
      logCallbackFailure("token request failed", {
        status: tokenResponse.status,
        error: tokenError?.error,
        errorDescription: tokenError?.error_description,
      });
      return redirectToLogin(request, "google_login_failed");
    }

    const tokenJson = (await tokenResponse.json()) as GoogleTokenResponse;
    const accessToken = tokenJson.access_token;
    if (!accessToken) {
      logCallbackFailure("token response missing access token", {
        status: tokenResponse.status,
        tokenType: tokenJson.token_type,
      });
      return redirectToLogin(request, "google_login_failed");
    }

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!userResponse.ok) {
      logCallbackFailure("user info request failed", {
        status: userResponse.status,
      });
      return redirectToLogin(request, "google_login_failed");
    }

    const userJson = (await userResponse.json()) as GoogleUserInfoResponse;
    const providerUserId = userJson.sub;
    if (!providerUserId) {
      logCallbackFailure("missing provider user id");
      return redirectToLogin(request, "google_login_failed");
    }

    let token: string;
    try {
      token = await createSessionToken({
        provider: "google",
        providerUserId,
        nickname: fallbackNickname(userJson),
        profileImage: userJson.picture,
        email: userJson.email,
        loggedInAt: new Date().toISOString(),
      });
    } catch (error) {
      logCallbackFailure("session creation failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return redirectToLogin(request, "google_login_failed");
    }

    const nextPath = safeInternalPath(
      request.cookies.get(AUTH_NEXT_COOKIE_NAME)?.value,
      "/account?login=success",
    );
    const response = NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    response.headers.set("Cache-Control", "no-store");
    setSessionCookie(response, token);
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    logCallbackFailure("unexpected callback error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return redirectToLogin(request, "google_login_failed");
  }
}
