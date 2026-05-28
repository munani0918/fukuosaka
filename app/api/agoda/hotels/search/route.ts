import { NextRequest, NextResponse } from "next/server";

const AGODA_CITY_IDS = {
  osaka: 9590,
  fukuoka: 16527,
  kyoto: 1784,
  nara: 13313,
  kobe: 5235,
  beppu: 144,
  yufu: 106058,
} as const;

type AgodaCity = keyof typeof AGODA_CITY_IDS;

type AgodaHotel = {
  id: string;
  source: "agoda";
  name: string;
  imageUrl: string | null;
  starRating: number | null;
  reviewScore: number | null;
  reviewCount: number | null;
  pricePerNight: number | null;
  totalPrice: number | null;
  currency: string;
  bookingUrl: string | null;
  hasBookingUrl: boolean;
  freeWifi: boolean;
  includeBreakfast: boolean;
};

type NormalizedHotelResult = {
  hotel: AgodaHotel;
  missingHotelId: boolean;
  missingBookingUrl: boolean;
  generatedFallbackBookingUrl: boolean;
};

const CORS_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

function errorJson(code: string, message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ ok: false, code, message, ...(extra || {}) }, status);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "yes", "y", "1", "included"].includes(value.toLowerCase());
  if (typeof value === "number") return value > 0;
  return false;
}

function readPath(source: unknown, paths: string[][]): unknown {
  for (const path of paths) {
    let cursor = source as Record<string, unknown> | unknown;
    let ok = true;
    for (const key of path) {
      if (!cursor || typeof cursor !== "object" || !(key in cursor)) {
        ok = false;
        break;
      }
      cursor = (cursor as Record<string, unknown>)[key];
    }
    if (ok && cursor !== undefined && cursor !== null && cursor !== "") return cursor;
  }
  return undefined;
}

function normalizeUrl(value: unknown): string | null {
  const url = stringValue(value);
  if (!url || url === "#" || /undefined|null/i.test(url)) return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (/^https?:\/\//i.test(url)) return url;
  return null;
}

function normalizeImageUrl(value: unknown): string | null {
  return normalizeUrl(value)?.replace(/^http:/, "https:") ?? null;
}

function daysBetween(checkIn: string, checkOut: string): number {
  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  return Math.round((end - start) / 86400000);
}

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return Math.min(parsed, max);
}

function parseNonNegativeInt(value: string | null, fallback: number, max: number) {
  if (value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return Math.min(parsed, max);
}

function endpointHost(endpoint: string | undefined): string | null {
  if (!endpoint) return null;
  try {
    return new URL(endpoint).host;
  } catch {
    return null;
  }
}

function maskSensitiveValue(value: string | undefined | null): string | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (normalized.length <= 6) return `${normalized.slice(0, 2)}***`;
  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
}

function maskAgodaUrlForDebug(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const cid = parsed.searchParams.get("cid");
    if (cid) {
      parsed.searchParams.set("cid", maskSensitiveValue(cid) ?? "***");
    }
    return parsed.toString();
  } catch {
    return url.replace(/([?&]cid=)([^&#]+)/i, (_match, prefix: string, cid: string) => {
      return `${prefix}${maskSensitiveValue(cid) ?? "***"}`;
    });
  }
}

function agodaDebug(siteId: string | undefined, apiKey: string | undefined, endpoint: string | undefined) {
  return {
    hasSiteId: Boolean(siteId),
    siteId: maskSensitiveValue(siteId),
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey?.length ?? 0,
    hasEndpoint: Boolean(endpoint),
    endpointHost: endpointHost(endpoint),
  };
}

function sanitizeAgodaErrorBody(
  body: string,
  apiKey: string | undefined,
  siteId: string | undefined,
): string | undefined {
  const trimmed = body.trim();
  if (!trimmed) return undefined;
  let redacted = apiKey ? trimmed.split(apiKey).join("[redacted_api_key]") : trimmed;
  redacted = siteId ? redacted.split(siteId).join("[redacted_site_id]") : redacted;
  redacted = redacted.replace(/([?&]cid=)([^&#\s"]+)/gi, "$1[redacted_cid]");
  return redacted.slice(0, 1000);
}

function buildAgodaPartnerUrl(
  siteId: string,
  hotelId: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  rooms: number,
): string {
  const params = new URLSearchParams({
    cid: siteId,
    hid: hotelId,
    currency: "KRW",
    checkin: checkIn,
    checkout: checkOut,
    NumberofAdults: String(adults),
    NumberofChildren: String(children),
    Rooms: String(rooms),
  });
  return `https://www.agoda.com/partners/partnersearch.aspx?${params.toString()}`;
}

function appendAgodaBookingParams(
  url: string | null,
  {
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
  }: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
  },
): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("checkin", checkIn);
    parsed.searchParams.set("checkout", checkOut);
    parsed.searchParams.set("NumberofAdults", String(adults));
    parsed.searchParams.set("NumberofChildren", String(children));
    parsed.searchParams.set("Rooms", String(rooms));
    parsed.searchParams.set("language", "ko-kr");
    parsed.searchParams.set("locale", "ko-kr");
    return parsed.toString();
  } catch {
    return url;
  }
}

function bookingUrlDebug(url: string | null) {
  if (!url) return null;
  try {
    const params = new URL(url).searchParams;
    return {
      hasCid: params.has("cid"),
      hasHid: params.has("hid"),
      hasCheckIn: params.has("checkin"),
      hasCheckOut: params.has("checkout"),
      hasAdults: params.has("NumberofAdults"),
      hasChildren: params.has("NumberofChildren"),
      hasRooms: params.has("Rooms"),
      adults: params.get("NumberofAdults"),
      children: params.get("NumberofChildren"),
      rooms: params.get("Rooms"),
      currency: params.get("currency"),
      language: params.get("language"),
      locale: params.get("locale"),
    };
  } catch {
    return null;
  }
}

function hotelIdFromUrl(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).searchParams.get("hid")?.trim() || "";
  } catch {
    return "";
  }
}

function isSafeDebugKey(key: string): boolean {
  return !/(api.?key|authorization|site.?id|token|secret|password)/i.test(key);
}

function debugRawHotel(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const hotel = raw as Record<string, unknown>;
  const landingURL = normalizeUrl(readPath(hotel, [["landingURL"], ["landingUrl"], ["landingurl"], ["url"], ["hotelURL"], ["hotelUrl"]]));
  const rawHotelId = stringValue(readPath(hotel, [["hotelId"], ["HotelId"], ["hotelID"], ["hotel_id"], ["id"]]));
  const firstResultKeys = Object.keys(hotel).filter(isSafeDebugKey);
  const firstResultSample = {
    hotelId: rawHotelId || hotelIdFromUrl(landingURL),
    rawHotelId,
    hotelName: stringValue(readPath(hotel, [["hotelName"], ["HotelName"], ["hotel_name"], ["name"]])),
    landingURL: maskAgodaUrlForDebug(landingURL),
    dailyRate:
      numberValue(readPath(hotel, [["dailyRate"], ["rate"], ["rates_from"], ["price"]])) ??
      stringValue(readPath(hotel, [["dailyRate"], ["rate"], ["rates_from"], ["price"]])),
    currency: stringValue(readPath(hotel, [["currency"], ["price", "currency"], ["pricing", "currency"]])) || "KRW",
  };
  return { firstResultKeys, firstResultSample };
}

function findHotelArray(payload: unknown): unknown[] {
  const directCandidates = [
    readPath(payload, [["results"]]),
    readPath(payload, [["hotels"]]),
    readPath(payload, [["hotelList"]]),
    readPath(payload, [["HotelList"]]),
    readPath(payload, [["data", "results"]]),
    readPath(payload, [["data", "hotels"]]),
    readPath(payload, [["result", "results"]]),
    readPath(payload, [["result", "hotels"]]),
    readPath(payload, [["response", "results"]]),
    readPath(payload, [["response", "hotels"]]),
  ];

  const direct = directCandidates.find((candidate) => Array.isArray(candidate) && candidate.length > 0);
  if (Array.isArray(direct)) return direct;

  const queue: unknown[] = [payload];
  const seen = new Set<unknown>();
  while (queue.length) {
    const current = queue.shift();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      const looksLikeHotels = current.some((item) => {
        if (!item || typeof item !== "object") return false;
        const name = readPath(item, [["hotelName"], ["HotelName"], ["hotel_name"], ["name"], ["propertyName"]]);
        const id = readPath(item, [["hotelId"], ["HotelId"], ["hotelID"], ["hotel_id"], ["id"], ["propertyId"]]);
        return Boolean(name || id);
      });
      if (looksLikeHotels) return current;
      current.forEach((item) => queue.push(item));
      continue;
    }
    if (typeof current === "object") {
      Object.values(current as Record<string, unknown>).forEach((value) => queue.push(value));
    }
  }
  return [];
}

function normalizeHotel(
  raw: unknown,
  nights: number,
  siteId: string,
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  rooms: number,
): NormalizedHotelResult | null {
  if (!raw || typeof raw !== "object") return null;
  const hotel = raw as Record<string, unknown>;
  const landingUrl = normalizeUrl(readPath(hotel, [["landingURL"], ["landingUrl"], ["landingurl"], ["url"], ["hotelURL"], ["hotelUrl"]]));
  const rawHotelId = stringValue(readPath(hotel, [["hotelId"], ["HotelId"], ["hotelID"], ["hotel_id"], ["id"]]));
  const hotelId = rawHotelId || hotelIdFromUrl(landingUrl);
  const name = stringValue(readPath(hotel, [["hotelName"], ["HotelName"], ["hotel_name"], ["name"]]));
  if (!hotelId && !name) return null;

  const dailyRate =
    numberValue(readPath(hotel, [["dailyRate"], ["rate"], ["rates_from"], ["price"], ["daily_rate"], ["rate", "daily"], ["price", "dailyRate"], ["price", "perNight"], ["pricing", "dailyRate"]])) ??
    numberValue(readPath(hotel, [["room", "dailyRate"], ["rooms", "0", "dailyRate"]]));
  const total =
    dailyRate !== null
      ? Math.round(dailyRate * nights)
      : numberValue(readPath(hotel, [["totalPrice"], ["total_price"], ["price", "total"], ["pricing", "total"]]));
  const bookingUrl = appendAgodaBookingParams(
    landingUrl ||
      (hotelId
        ? buildAgodaPartnerUrl(siteId, hotelId, checkIn, checkOut, adults, children, rooms)
        : null),
    { checkIn, checkOut, adults, children, rooms },
  );

  return {
    hotel: {
      id: hotelId || name,
      source: "agoda",
      name: name || hotelId,
      imageUrl: normalizeImageUrl(readPath(hotel, [["imageURL"], ["imageUrl"], ["image_url"], ["photo1"], ["thumbnailUrl"], ["thumbnailURL"], ["mainImage"], ["images", "0", "url"], ["photos", "0", "url"]])),
      starRating: numberValue(readPath(hotel, [["starRating"], ["star_rating"], ["stars"], ["rating", "starRating"]])),
      reviewScore: numberValue(readPath(hotel, [["reviewScore"], ["rating_average"], ["review_score"], ["rating"], ["review", "score"], ["reviews", "score"]])),
      reviewCount: numberValue(readPath(hotel, [["reviewCount"], ["number_of_reviews"], ["review_count"], ["reviews", "count"], ["review", "count"]])),
      pricePerNight: dailyRate !== null ? Math.round(dailyRate) : null,
      totalPrice: total !== null ? Math.round(total) : null,
      currency: stringValue(readPath(hotel, [["currency"], ["price", "currency"], ["pricing", "currency"]])) || "KRW",
      bookingUrl,
      hasBookingUrl: Boolean(bookingUrl),
      freeWifi: booleanValue(readPath(hotel, [["freeWifi"], ["free_wifi"], ["facilities", "freeWifi"], ["amenities", "freeWifi"]])),
      includeBreakfast: booleanValue(readPath(hotel, [["includeBreakfast"], ["breakfastIncluded"], ["breakfast_included"], ["facilities", "breakfastIncluded"]])),
    },
    missingHotelId: !hotelId,
    missingBookingUrl: !bookingUrl,
    generatedFallbackBookingUrl: Boolean(!landingUrl && hotelId && bookingUrl),
  };
}

export async function GET(request: NextRequest) {
  const siteId = process.env.AGODA_SITE_ID?.trim();
  const apiKey = process.env.AGODA_API_KEY?.trim();
  const endpoint = process.env.AGODA_API_ENDPOINT?.trim();

  if (!siteId) return errorJson("missing_agoda_site_id", "AGODA_SITE_ID 환경변수가 없습니다.", 500);
  if (!apiKey) return errorJson("missing_agoda_api_key", "AGODA_API_KEY 환경변수가 없습니다.", 500);
  if (!endpoint) return errorJson("missing_agoda_api_endpoint", "AGODA_API_ENDPOINT 환경변수가 없습니다.", 500);

  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city")?.toLowerCase() as AgodaCity | undefined;
  const checkIn = stringValue(searchParams.get("checkIn"));
  const checkOut = stringValue(searchParams.get("checkOut"));
  const adults = parsePositiveInt(searchParams.get("adults") ?? searchParams.get("travelers"), 2, 10);
  const children = parseNonNegativeInt(searchParams.get("children"), 0, 6);
  const rooms = parsePositiveInt(searchParams.get("rooms"), 1, 4);
  const maxResult = parsePositiveInt(searchParams.get("maxResult"), 10, 50);
  const debugRelaxed = searchParams.get("debugRelaxed") === "1";
  const shouldDebugRaw = searchParams.get("debugRaw") === "1";

  if (!city || !(city in AGODA_CITY_IDS)) {
    return errorJson("invalid_city", "city는 osaka, fukuoka, kyoto, nara, kobe, beppu, yufu 중 하나여야 합니다.");
  }
  if (!checkIn || !checkOut || !isDate(checkIn) || !isDate(checkOut)) {
    return errorJson("invalid_dates", "checkIn/checkOut은 YYYY-MM-DD 형식으로 필요합니다.");
  }
  const nights = daysBetween(checkIn, checkOut);
  if (nights <= 0) {
    return errorJson("invalid_stay_period", "checkOut은 checkIn 이후 날짜여야 합니다.");
  }
  if (adults === null) return errorJson("invalid_adults", "adults/travelers는 1 이상의 숫자여야 합니다.");
  if (children === null) return errorJson("invalid_children", "children은 0 이상의 숫자여야 합니다.");
  if (rooms === null) return errorJson("invalid_rooms", "rooms는 1 이상의 숫자여야 합니다.");
  if (maxResult === null) return errorJson("invalid_max_result", "maxResult는 1 이상의 숫자여야 합니다.");

  const cityId = AGODA_CITY_IDS[city];
  const resultLimit = debugRelaxed ? 10 : maxResult;
  const requestBody = {
    // Agoda Affiliate Lite auth requires these body credentials to match the Authorization header.
    siteid: siteId,
    apikey: apiKey,
    criteria: {
      additional: {
        currency: "KRW",
        language: "ko-kr",
        maxResult: resultLimit,
        minimumReviewScore: debugRelaxed ? 0 : 7,
        minimumStarRating: debugRelaxed ? 0 : 3,
        discountOnly: false,
        occupancy: {
          numberOfAdult: adults,
          numberOfChildren: children,
          numberOfRooms: rooms,
        },
        sortBy: "Recommended",
      },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      cityId,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `${siteId}:${apiKey}`,
        "Accept-Encoding": "gzip,deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    const responseText = await response.text();
    let payload: unknown = null;
    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch {
      payload = responseText;
    }

    if (!response.ok) {
      return errorJson("agoda_api_error", "Agoda API 호출에 실패했습니다.", response.status, {
        status: response.status,
        statusText: response.statusText,
        debug: agodaDebug(siteId, apiKey, endpoint),
        agodaErrorBody: sanitizeAgodaErrorBody(responseText, apiKey, siteId),
      });
    }

    const rawHotels = findHotelArray(payload);
    const normalizedHotels = rawHotels
      .map((hotel) => normalizeHotel(hotel, nights, siteId, checkIn, checkOut, adults, children, rooms))
      .filter((hotel): hotel is NormalizedHotelResult => Boolean(hotel))
      .slice(0, resultLimit);
    const hotels = normalizedHotels.map(({ hotel }) => hotel);
    const debugSummary = {
      rawResultCount: rawHotels.length,
      normalizedCount: normalizedHotels.length,
      missingHotelIdCount: normalizedHotels.filter((hotel) => hotel.missingHotelId).length,
      missingBookingUrlCount: normalizedHotels.filter((hotel) => hotel.missingBookingUrl).length,
      generatedFallbackBookingUrlCount: normalizedHotels.filter((hotel) => hotel.generatedFallbackBookingUrl).length,
    };
    const debugRaw = shouldDebugRaw
      ? {
          ...debugRawHotel(rawHotels[0]),
          bookingUrlDebug: bookingUrlDebug(hotels[0]?.bookingUrl ?? null),
        }
      : undefined;

    if (!hotels.length) {
      return json({
        ok: true,
        city,
        cityId,
        checkIn,
        checkOut,
        nights,
        debugSummary,
        ...(debugRaw ? { debugRaw } : {}),
        hotels: [],
        message: "Agoda API 응답에 표시 가능한 숙소가 없습니다.",
      });
    }

    return json({
      ok: true,
      city,
      cityId,
      checkIn,
      checkOut,
      nights,
      debugSummary,
      ...(debugRaw ? { debugRaw } : {}),
      hotels,
    });
  } catch (error) {
    return errorJson("agoda_request_failed", "Agoda API 요청 처리 중 오류가 발생했습니다.", 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
