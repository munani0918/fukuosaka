import { NextRequest, NextResponse } from "next/server";

import {
  createFlightFareQueryLandingUrlViaApi,
  createMylinkViaApi,
} from "@/src/lib/myrealtrip";

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

  return target.toString();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = params.get("origin") ?? "ICN";
  const destination = params.get("destination") ?? "KIX";
  const tripType = params.get("tripType") === "OW" ? "OW" : "RT";
  const departDate = params.get("departDate") ?? "";
  const returnDate = params.get("returnDate") ?? "";
  const adult = Number.parseInt(params.get("adult") ?? "1", 10);
  const child = Number.parseInt(params.get("child") ?? "0", 10);
  const airline = params.get("airline") ?? undefined;

  if (!departDate) {
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
    return NextResponse.redirect(fallbackUrl(request));
  }

  const mylinkResult = await createMylinkViaApi(landingResult.landingUrl);
  return NextResponse.redirect(
    mylinkResult.ok && mylinkResult.mylinkUrl
      ? mylinkResult.mylinkUrl
      : landingResult.landingUrl,
  );
}
