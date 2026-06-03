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
  error_description?: string;
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

function logCallbackStep(
  step: string,
  details: Record<string, boolean | number | string | null | undefined> = {},
) {
  console.error(`[kakao-callback] ${step}`, details);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.KAKAO_CLIENT_ID;
  logCallbackStep("entered", {
    hasKakaoClientId: Boolean(clientId),
  });
  if (!clientId) {
    logCallbackStep("missing client id");
    return redirectToLogin(request, "kakao_not_configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(KAKAO_STATE_COOKIE_NAME)?.value;
  logCallbackStep("received oauth params", {
    hasCode: Boolean(code),
    hasStateQuery: Boolean(state),
    hasStateCookie: Boolean(stateCookie),
    stateMatches: Boolean(state && stateCookie && state === stateCookie),
  });

  if (!code || !state || !stateCookie || state !== stateCookie) {
    logCallbackStep("invalid state", {
      hasCode: Boolean(code),
      hasStateQuery: Boolean(state),
      hasStateCookie: Boolean(stateCookie),
      stateMatches: Boolean(state && stateCookie && state === stateCookie),
    });
    return redirectToLogin(request, "invalid_state");
  }

  const redirectUri = new URL("/api/auth/kakao/callback", request.nextUrl.origin).toString();

  try {
    logCallbackStep("token request start");
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
    logCallbackStep("token response", { status: tokenResponse.status });

    if (!tokenResponse.ok) {
      let tokenError: KakaoTokenResponse | null = null;
      try {
        tokenError = (await tokenResponse.json()) as KakaoTokenResponse;
      } catch {
        tokenError = null;
      }
      logCallbackStep("token request failed", {
        status: tokenResponse.status,
        error: tokenError?.error,
        errorDescription: tokenError?.error_description,
      });
      return redirectToLogin(request, "kakao_login_failed");
    }

    const tokenJson = (await tokenResponse.json()) as KakaoTokenResponse;
    const accessToken = tokenJson.access_token;
    logCallbackStep("token parsed", {
      hasAccessToken: Boolean(accessToken),
      tokenType: tokenJson.token_type,
    });
    if (!accessToken) {
      logCallbackStep("missing access token");
      return redirectToLogin(request, "kakao_login_failed");
    }

    logCallbackStep("user info request start");
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    logCallbackStep("user info response", { status: userResponse.status });

    if (!userResponse.ok) {
      let userError: unknown = null;
      try {
        userError = await userResponse.json();
      } catch {
        userError = null;
      }
      logCallbackStep("user info request failed", {
        status: userResponse.status,
        error:
          typeof userError === "object" &&
          userError !== null &&
          "error" in userError &&
          typeof userError.error === "string"
            ? userError.error
            : undefined,
        message:
          typeof userError === "object" &&
          userError !== null &&
          "msg" in userError &&
          typeof userError.msg === "string"
            ? userError.msg
            : undefined,
      });
      return redirectToLogin(request, "kakao_login_failed");
    }

    const userJson = (await userResponse.json()) as KakaoUserResponse;
    const providerUserId =
      typeof userJson.id === "number" ? String(userJson.id) : userJson.id;
    logCallbackStep("user parsed", {
      hasProviderUserId: Boolean(providerUserId),
      hasKakaoAccountProfileNickname: Boolean(
        userJson.kakao_account?.profile?.nickname,
      ),
      hasPropertiesNickname: Boolean(userJson.properties?.nickname),
      hasProfileImage: Boolean(
        userJson.kakao_account?.profile?.profile_image_url ||
          userJson.properties?.profile_image,
      ),
    });

    if (!providerUserId) {
      logCallbackStep("missing provider user id");
      return redirectToLogin(request, "kakao_login_failed");
    }

    const nickname =
      userJson.kakao_account?.profile?.nickname ||
      userJson.properties?.nickname ||
      "카카오 사용자";
    const profileImage =
      userJson.kakao_account?.profile?.profile_image_url ||
      userJson.properties?.profile_image;
    logCallbackStep("nickname resolved", {
      hasNickname: Boolean(nickname),
      nicknameFallbackUsed: nickname === "카카오 사용자",
    });

    let token: string;
    try {
      token = await createSessionToken({
        provider: "kakao",
        providerUserId,
        nickname,
        profileImage,
        loggedInAt: new Date().toISOString(),
      });
      logCallbackStep("session token created", { ok: true });
    } catch (error) {
      logCallbackStep("session creation failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return redirectToLogin(request, "kakao_login_failed");
    }

    const nextPath = safeInternalPath(
      request.cookies.get(AUTH_NEXT_COOKIE_NAME)?.value,
      "/account?login=success",
    );
    logCallbackStep("redirect prepared", { nextPath });
    const response = NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    response.headers.set("Cache-Control", "no-store");
    logCallbackStep("setting session cookie");
    setSessionCookie(response, token);
    clearOAuthCookies(response);
    logCallbackStep("callback success", { redirectTo: nextPath });
    return response;
  } catch (error) {
    logCallbackStep("unexpected callback error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return redirectToLogin(request, "kakao_login_failed");
  }
}
