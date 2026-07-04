import { NextRequest, NextResponse } from "next/server";

import {
  buildMylinkUrl,
  createFlightFareQueryLandingUrlViaApi,
  createMylinkViaApi,
} from "@/src/lib/myrealtrip";
import { requireAdminApiToken } from "@/src/lib/myrealtripPartner";
import { addFukuosakaUtm } from "@/src/lib/tracking";

type FlightRedirectFallbackType = "mylink-api" | "mylink-param" | "raw";
const DEBUG_NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function fallbackUrl(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const target = new URL("https://flights.myrealtrip.com");
  target.searchParams.set("origin", params.get("origin") ?? "ICN");
  target.searchParams.set("destination", params.get("destination") ?? "KIX");
  target.searchParams.set("tripType", params.get("tripType") ?? "RT");
  target.searchParams.set("departDate", params.get("departDate") ?? "");
  target.searchParams.set("adult", params.get("adult") ?? "1");
  target.searchParams.set("child", params.get("child") ?? "0");

  if (params.get("returnDate")) {
    target.searchParams.set("returnDate", params.get("returnDate") ?? "");
  }

  return addFukuosakaUtm(target.toString(), "flight_result");
}

function urlHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}

function urlHasParam(value: string, paramName: string) {
  try {
    return new URL(value).searchParams.has(paramName);
  } catch {
    return false;
  }
}

function summarizeDebugReason(message: string | undefined) {
  const normalized = message?.replace(/https?:\/\/\S+/g, "[redacted_url]").trim();
  if (!normalized) return undefined;
  return normalized.slice(0, 160);
}

function debugJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  Object.entries(DEBUG_NO_STORE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const isDebug = params.get("_debug") === "1";

  if (isDebug) {
    const auth = requireAdminApiToken(request);
    if (!auth.ok) return auth.response;
  }

  const origin = params.get("origin") ?? "ICN";
  const destination = params.get("destination") ?? "KIX";
  const tripType = params.get("tripType") === "OW" ? "OW" : "RT";
  const departDate = params.get("departDate") ?? "";
  const returnDate = params.get("returnDate") ?? "";
  const adult = Number.parseInt(params.get("adult") ?? "1", 10);
  const child = Number.parseInt(params.get("child") ?? "0", 10);
  const airline = params.get("airline") ?? undefined;

  if (!departDate) {
    if (isDebug) {
      return debugJson(
        {
          ok: false,
          hasLandingUrl: false,
          landingHost: "",
          hasMylinkIdEnv: Boolean(process.env.MYREALTRIP_MYLINK_ID),
          mylinkApiAttempted: false,
          mylinkApiSucceeded: false,
          fallbackType: "raw" satisfies FlightRedirectFallbackType,
          finalUrlHost: urlHost(fallbackUrl(request)),
          finalUrlHasMylinkId: false,
          finalUrlHasUtmContent: urlHasParam(fallbackUrl(request), "utm_content"),
          reason: "departDate is required.",
        },
        { status: 400 },
      );
    }
    return NextResponse.redirect(fallbackUrl(request));
  }

  const landingResult = await createFlightFareQueryLandingUrlViaApi({
    depAirportCd: origin,
    arrAirportCd: destination,
    tripTypeCd: tripType,
    depDate: departDate,
    arrDate: tripType === "RT" ? returnDate : undefined,
    adult: Number.isFinite(adult) && adult > 0 ? adult : 1,
    child: Number.isFinite(child) && child > 0 ? child : 0,
    infant: 0,
    airline,
    cabinClass: "ECONOMY",
  });

  if (!landingResult.ok) {
    const fallback = fallbackUrl(request);
    if (isDebug) {
      return debugJson({
        ok: false,
        hasLandingUrl: false,
        landingHost: "",
        hasMylinkIdEnv: Boolean(process.env.MYREALTRIP_MYLINK_ID),
        mylinkApiAttempted: false,
        mylinkApiSucceeded: false,
        fallbackType: "raw" satisfies FlightRedirectFallbackType,
        finalUrlHost: urlHost(fallback),
        finalUrlHasMylinkId: false,
        finalUrlHasUtmContent: urlHasParam(fallback, "utm_content"),
        reason: summarizeDebugReason(landingResult.message),
      });
    }
    return NextResponse.redirect(fallbackUrl(request));
  }

  const mylinkResult = await createMylinkViaApi(landingResult.landingUrl, {
    utmContent: "flight_result",
    openInApp: true,
  });
  const parameterFallback = buildMylinkUrl({
    targetUrl: landingResult.landingUrl,
    utmContent: "flight_result",
    openInApp: true,
  });
  const mylinkApiUrl = mylinkResult.ok ? mylinkResult.mylinkUrl : "";
  const fallbackType: FlightRedirectFallbackType =
    mylinkApiUrl
      ? "mylink-api"
      : parameterFallback.hasMylink
        ? "mylink-param"
        : "raw";
  const finalUrl =
    fallbackType === "mylink-api"
      ? mylinkApiUrl
      : parameterFallback.url || landingResult.landingUrl;

  if (isDebug) {
    return debugJson({
      ok: true,
      hasLandingUrl: true,
      landingHost: urlHost(landingResult.landingUrl),
      hasMylinkIdEnv: Boolean(process.env.MYREALTRIP_MYLINK_ID),
      mylinkApiAttempted: true,
      mylinkApiSucceeded: Boolean(mylinkApiUrl),
      fallbackType,
      finalUrlHost: urlHost(finalUrl),
      finalUrlHasMylinkId: urlHasParam(finalUrl, "mylink_id"),
      finalUrlHasUtmContent: urlHasParam(finalUrl, "utm_content"),
      mylinkApiFailureReason:
        mylinkApiUrl
          ? undefined
          : summarizeDebugReason(mylinkResult.ok ? undefined : mylinkResult.message),
    });
  }

  return NextResponse.redirect(finalUrl);
}
