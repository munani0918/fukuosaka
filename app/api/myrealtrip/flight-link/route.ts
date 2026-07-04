import { NextRequest, NextResponse } from "next/server";
import {
  buildMylinkUrl,
  createFlightFareQueryLandingUrlViaApi,
  createMylinkViaApi,
} from "@/src/lib/myrealtrip";

function fallbackFlightUrl(
  destination: string,
  departDate: string,
  returnDate: string,
) {
  const params = new URLSearchParams({
    origin: "ICN",
    destination,
    departDate,
    returnDate,
  });

  return `/flight-results.html?${params.toString()}`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get("origin") ?? "ICN";
  const destination = params.get("destination") ?? "KIX";
  const departDate = params.get("departDate") ?? "";
  const returnDate = params.get("returnDate") ?? "";
  const adult = Number.parseInt(params.get("adult") ?? "1", 10);

  if (!departDate) {
    return NextResponse.json(
      { ok: false, message: "departDate is required." },
      { status: 400 },
    );
  }

  const fallbackUrl = fallbackFlightUrl(destination, departDate, returnDate);

  const landingResult = await createFlightFareQueryLandingUrlViaApi({
    depAirportCd: origin,
    arrAirportCd: destination,
    tripTypeCd: returnDate ? "RT" : "OW",
    depDate: departDate,
    arrDate: returnDate || undefined,
    adult: Number.isFinite(adult) && adult > 0 ? adult : 1,
    child: 0,
    infant: 0,
    cabinClass: "ECONOMY",
  });

  if (!landingResult.ok) {
    return NextResponse.json({
      url: fallbackUrl,
      source: "fallback",
      reason: landingResult.message,
    });
  }

  const mylinkResult = await createMylinkViaApi(landingResult.landingUrl, {
    utmContent: "flight_result",
    openInApp: true,
  });
  if (mylinkResult.ok && mylinkResult.mylinkUrl) {
    return NextResponse.json({
      url: mylinkResult.mylinkUrl,
      targetUrl: landingResult.landingUrl,
      source: "mylink",
    });
  }

  const parameterFallback = buildMylinkUrl({
    targetUrl: landingResult.landingUrl,
    utmContent: "flight_result",
    openInApp: true,
  });

  return NextResponse.json({
    url: parameterFallback.url || landingResult.landingUrl,
    fallbackUrl,
    source: parameterFallback.hasMylink ? "mylink-param" : "landing",
    reason: mylinkResult.ok ? undefined : mylinkResult.message,
  });
}
