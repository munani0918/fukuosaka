/**
 * Server-side helpers for MyRealTrip partner integrations.
 *
 * Import this file only from Server Components or Route Handlers so that
 * partner API keys never end up in the client bundle.
 */

export const MYREALTRIP_API_BASE = "https://partner-ext-api.myrealtrip.com";
export const MYLINK_API_PATH = "/v1/mylink";
export const FLIGHT_FARE_QUERY_LANDING_API_PATH =
  "/v1/products/flight/fare-query-landing-url";
export const FLIGHT_LOWEST_CALENDAR_API_PATH =
  "/v1/products/flight/calendar/lowest";
export const ACCOMMODATION_SEARCH_API_PATH =
  "/v1/products/accommodation/search";
export const TNA_CATEGORIES_API_PATH = "/v1/products/tna/categories";
export const TNA_SEARCH_API_PATH = "/v1/products/tna/search";
export const TNA_DETAIL_API_PATH = "/v1/products/tna/detail";
export const TNA_OPTIONS_API_PATH = "/v1/products/tna/options";
export const TNA_CALENDARS_API_PATH = "/v1/products/tna/calendars";

type PartnerApiEnvelope<T> = {
  data?: T;
  meta?: unknown;
  result?: {
    status?: number;
    message?: string;
    code?: string;
  };
};

function getMyRealTripApiKey() {
  return process.env.MRT_PARTNER_API_KEY ?? process.env.MYREALTRIP_API_KEY ?? "";
}

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function readMessage(
  fallback: string,
  payload: PartnerApiEnvelope<unknown> | Record<string, unknown> | null,
) {
  if (!payload) return fallback;

  const result =
    "result" in payload && typeof payload.result === "object" && payload.result !== null
      ? (payload.result as { message?: unknown })
      : undefined;

  return readString(
    result?.message,
    "message" in payload ? payload.message : undefined,
    fallback,
  );
}

type PartnerPostSuccess<T> = {
  ok: true;
  status: number;
  data: T;
  meta?: unknown;
  result?: PartnerApiEnvelope<T>["result"];
};

type PartnerPostError = {
  ok: false;
  status: number;
  message: string;
};

type PartnerPostResult<T> = PartnerPostSuccess<T> | PartnerPostError;

async function postMyRealTripPartnerApi<T>(
  path: string,
  body: Record<string, unknown>,
  timeoutMs = 10_000,
): Promise<PartnerPostResult<T>> {
  const apiKey = getMyRealTripApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MRT_PARTNER_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch(`${MYREALTRIP_API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | (PartnerApiEnvelope<T> & Record<string, unknown>)
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readMessage(
          `MyRealTrip partner API returned ${response.status}.`,
          payload,
        ),
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload?.data as T,
      meta: payload?.meta,
      result: payload?.result,
    };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip partner API timed out."
        : "Failed to reach the MyRealTrip partner API.",
    };
  }
}

export type TnaSort =
  | "price_asc"
  | "price_desc"
  | "review_score_desc"
  | "selling_count_desc";

export interface TnaCategory {
  name: string;
  value: string;
}

export interface TnaCategoriesData {
  categories: TnaCategory[];
  totalCount: number;
}

export interface TnaCategoriesRequest {
  city: string;
}

export interface TnaSearchRequest {
  keyword: string;
  city?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: TnaSort;
  page?: number;
  perPage?: number;
}

export interface TnaSearchItem {
  gid: string;
  itemName: string;
  productUrl: string;
  salePrice: number;
  priceDisplay: string;
  category?: string;
  deepLink?: string;
  description?: string;
  imageUrl?: string;
  reviewCount?: number;
  reviewScore?: number;
  tags?: string[];
}

export interface TnaSearchData {
  hasNextPage: boolean;
  items: TnaSearchItem[];
  page: number;
  perPage: number;
  totalCount: number;
}

export interface TnaDetailRequest {
  gid: string;
}

export interface TnaDetailData {
  gid: string;
  title: string;
  description?: string;
  excluded?: string[];
  included?: string[];
  itineraries?: Array<{
    description?: string;
    title?: string;
  }>;
  reviewCount?: number;
  reviewScore?: number;
}

export interface TnaOptionsRequest {
  gid: string;
  selectedDate: string;
}

export interface TnaOptionUnit {
  id: number;
  name: string;
}

export interface TnaOption {
  id: number;
  name: string;
  selectedDate: string;
  units?: TnaOptionUnit[];
  defaultOption?: unknown;
  availablePurchaseQuantity?: number | null;
  currency: string;
  minPurchaseQuantity?: number;
  salePrice: number;
}

export interface TnaOptionsData {
  options: TnaOption[];
  selectedDate: string;
  defaultOption?: TnaOption | null;
  units?: TnaOptionUnit[];
}

export interface TnaCalendarsRequest {
  gid: string;
  selectedDate: string;
}

export interface TnaCalendarsData {
  basePrice: string;
  blockDates: string[];
  date: string;
  excludedOptionDates: string[];
  instantConfirm: boolean;
}

export type TnaCategoriesResult = PartnerPostResult<TnaCategoriesData>;
export type TnaSearchResult = PartnerPostResult<TnaSearchData>;
export type TnaDetailResult = PartnerPostResult<TnaDetailData>;
export type TnaOptionsResult = PartnerPostResult<TnaOptionsData>;
export type TnaCalendarsResult = PartnerPostResult<TnaCalendarsData>;

export function searchTnaCategoriesViaApi(
  params: TnaCategoriesRequest,
): Promise<TnaCategoriesResult> {
  return postMyRealTripPartnerApi<TnaCategoriesData>(
    TNA_CATEGORIES_API_PATH,
    params as unknown as Record<string, unknown>,
  );
}

export function searchTnaProductsViaApi(
  params: TnaSearchRequest,
): Promise<TnaSearchResult> {
  return postMyRealTripPartnerApi<TnaSearchData>(
    TNA_SEARCH_API_PATH,
    params as unknown as Record<string, unknown>,
  );
}

export function fetchTnaProductDetailViaApi(
  params: TnaDetailRequest,
): Promise<TnaDetailResult> {
  return postMyRealTripPartnerApi<TnaDetailData>(
    TNA_DETAIL_API_PATH,
    params as unknown as Record<string, unknown>,
  );
}

export function fetchTnaOptionsViaApi(
  params: TnaOptionsRequest,
): Promise<TnaOptionsResult> {
  return postMyRealTripPartnerApi<TnaOptionsData>(
    TNA_OPTIONS_API_PATH,
    params as unknown as Record<string, unknown>,
  );
}

export function fetchTnaCalendarsViaApi(
  params: TnaCalendarsRequest,
): Promise<TnaCalendarsResult> {
  return postMyRealTripPartnerApi<TnaCalendarsData>(
    TNA_CALENDARS_API_PATH,
    params as unknown as Record<string, unknown>,
  );
}

export interface MylinkApiRequest {
  targetUrl: string;
}

export interface MylinkApiSuccess {
  ok: true;
  status: number;
  mylinkUrl: string;
}

export interface MylinkApiError {
  ok: false;
  status: number;
  message: string;
}

export type MylinkApiResult = MylinkApiSuccess | MylinkApiError;

export async function createMylinkViaApi(
  targetUrl: string,
): Promise<MylinkApiResult> {
  const apiKey = getMyRealTripApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MRT_PARTNER_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch(`${MYREALTRIP_API_BASE}${MYLINK_API_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ targetUrl } satisfies MylinkApiRequest),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | PartnerApiEnvelope<Record<string, unknown> | string>
      | (Record<string, unknown> & { result?: { message?: string } })
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readMessage(
          `MyRealTrip mylink API returned ${response.status}.`,
          payload,
        ),
      };
    }

    const nested =
      payload && typeof payload.data === "object" && payload.data !== null
        ? payload.data
        : null;

    const mylinkUrl = readString(
      typeof payload?.data === "string" ? payload.data : undefined,
      nested && "mylink" in nested ? nested.mylink : undefined,
      nested && "url" in nested ? nested.url : undefined,
      nested && "mylinkUrl" in nested ? nested.mylinkUrl : undefined,
      payload && "url" in payload ? payload.url : undefined,
      payload && "mylink_url" in payload ? payload.mylink_url : undefined,
      payload && "mylinkUrl" in payload ? payload.mylinkUrl : undefined,
    );

    if (!mylinkUrl) {
      return {
        ok: false,
        status: response.status,
        message: "MyRealTrip mylink API succeeded but no short URL was returned.",
      };
    }

    return { ok: true, status: response.status, mylinkUrl };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip mylink API timed out."
        : "Failed to reach the MyRealTrip mylink API.",
    };
  }
}

export type FlightTripTypeCode = "OW" | "RT" | "MT";
export type FlightCabinClass =
  | "FIRST"
  | "BUSINESS"
  | "PREMIUM_ECONOMY"
  | "ECONOMY"
  | "NONE";

export interface FlightFareQueryLandingRequest {
  depAirportCd: string;
  arrAirportCd: string;
  tripTypeCd: FlightTripTypeCode;
  depDate: string;
  arrDate?: string;
  adult?: number;
  child?: number;
  infant?: number;
  airline?: string;
  cabinClass?: FlightCabinClass;
}

export interface FlightLowestCalendarRequest {
  depCityCd: string;
  arrCityCds: string[];
  period?: number;
}

export interface FlightLowestCalendarEntry {
  departureDate: string;
  returnDate: string;
  fromCity: string;
  toCity: string;
  totalPrice: number;
  averagePrice: number;
  airline: string;
  period: number;
  transfer: number;
}

export type FlightLowestCalendarResult =
  PartnerPostResult<FlightLowestCalendarEntry[]>;

export interface FlightFareQueryLandingSuccess {
  ok: true;
  status: number;
  landingUrl: string;
}

export interface FlightFareQueryLandingError {
  ok: false;
  status: number;
  message: string;
}

export type FlightFareQueryLandingResult =
  | FlightFareQueryLandingSuccess
  | FlightFareQueryLandingError;

export async function createFlightFareQueryLandingUrlViaApi(
  params: FlightFareQueryLandingRequest,
): Promise<FlightFareQueryLandingResult> {
  const apiKey = getMyRealTripApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MRT_PARTNER_API_KEY is not configured.",
    };
  }

  const body: Record<string, unknown> = {
    depAirportCd: params.depAirportCd,
    arrAirportCd: params.arrAirportCd,
    tripTypeCd: params.tripTypeCd,
    depDate: params.depDate,
    adult: params.adult ?? 1,
    child: params.child ?? 0,
    infant: params.infant ?? 0,
  };

  if (params.arrDate) {
    body.arrDate = params.arrDate;
  }

  if (params.airline) {
    body.airline = params.airline;
  }

  if (params.cabinClass) {
    body.cabinClass = params.cabinClass;
  }

  try {
    const response = await fetch(
      `${MYREALTRIP_API_BASE}${FLIGHT_FARE_QUERY_LANDING_API_PATH}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | PartnerApiEnvelope<string | Record<string, unknown>>
      | (Record<string, unknown> & { result?: { message?: string } })
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readMessage(
          `MyRealTrip flight landing API returned ${response.status}.`,
          payload,
        ),
      };
    }

    const nested =
      payload && typeof payload.data === "object" && payload.data !== null
        ? payload.data
        : null;

    const landingUrl = readString(
      typeof payload?.data === "string" ? payload.data : undefined,
      nested && "url" in nested ? nested.url : undefined,
      nested && "landingUrl" in nested ? nested.landingUrl : undefined,
      payload && "url" in payload ? payload.url : undefined,
    );

    if (!landingUrl) {
      return {
        ok: false,
        status: response.status,
        message:
          "MyRealTrip flight landing API succeeded but did not return a URL.",
      };
    }

    return { ok: true, status: response.status, landingUrl };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip flight landing API timed out."
        : "Failed to reach the MyRealTrip flight landing API.",
    };
  }
}

export async function fetchFlightLowestCalendarViaApi(
  params: FlightLowestCalendarRequest,
): Promise<FlightLowestCalendarResult> {
  const apiKey = getMyRealTripApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MRT_PARTNER_API_KEY is not configured.",
    };
  }

  try {
    const response = await fetch(
      `${MYREALTRIP_API_BASE}${FLIGHT_LOWEST_CALENDAR_API_PATH}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          depCityCd: params.depCityCd,
          arrCityCds: params.arrCityCds,
          period: params.period ?? 4,
        }),
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | PartnerApiEnvelope<FlightLowestCalendarEntry[]>
      | FlightLowestCalendarEntry[]
      | (Record<string, unknown> & {
          data?: FlightLowestCalendarEntry[];
          items?: FlightLowestCalendarEntry[];
          result?: FlightLowestCalendarEntry[];
          results?: FlightLowestCalendarEntry[];
        })
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readMessage(
          `MyRealTrip flight lowest calendar API returned ${response.status}.`,
          Array.isArray(payload) ? null : payload,
        ),
      };
    }

    const record =
      payload && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : null;
    const data = Array.isArray(payload)
      ? payload
      : Array.isArray(record?.data)
        ? (record.data as FlightLowestCalendarEntry[])
        : Array.isArray(record?.items)
          ? (record.items as FlightLowestCalendarEntry[])
          : Array.isArray(record?.result)
            ? (record.result as FlightLowestCalendarEntry[])
            : Array.isArray(record?.results)
              ? (record.results as FlightLowestCalendarEntry[])
              : [];

    return {
      ok: true,
      status: response.status,
      data,
    };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip flight lowest calendar API timed out."
        : "Failed to reach the MyRealTrip flight lowest calendar API.",
    };
  }
}

export type AccommodationStarRating = "threestar" | "fourstar" | "fivestar";
export type AccommodationOrder = "price_asc" | "price_desc" | "review_desc";

export interface AccommodationSearchRequest {
  keyword: string;
  regionId?: number;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount?: number;
  isDomestic?: boolean;
  starRating?: AccommodationStarRating;
  stayPoi?: number;
  order?: AccommodationOrder;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export interface AccommodationSearchItem {
  itemId: string;
  itemName: string;
  originalPrice: number | null;
  salePrice: number | null;
  reviewCount: number | null;
  reviewScore: string | null;
  starRating: number | null;
  imageUrl?: string;
  bookUrl: string;
  raw: Record<string, unknown>;
}

export interface AccommodationSearchSuccess {
  ok: true;
  status: number;
  items: AccommodationSearchItem[];
  page: number;
  size: number;
  totalCount: number;
  searchedKeyword?: string;
}

export interface AccommodationSearchError {
  ok: false;
  status: number;
  message: string;
}

export type AccommodationSearchResult =
  | AccommodationSearchSuccess
  | AccommodationSearchError;

export type AccommodationBookingParams = Pick<
  AccommodationSearchRequest,
  "checkIn" | "checkOut" | "adultCount" | "childCount" | "isDomestic"
> & {
  roomCount?: number;
  providerRoomId?: string;
  segment?: string;
  childAges?: number[];
};

type AccommodationImageLookupParams = AccommodationBookingParams;

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function buildAccommodationBookUrl(
  itemId: string,
  params: AccommodationBookingParams,
) {
  const url = new URL(
    `https://accommodation.myrealtrip.com/union/products/${itemId}`,
  );

  url.searchParams.set("checkIn", params.checkIn);
  url.searchParams.set("checkOut", params.checkOut);
  url.searchParams.set("roomCount", String(params.roomCount ?? 1));
  url.searchParams.set("adultCount", String(params.adultCount));
  url.searchParams.set("childCount", String(params.childCount ?? 0));
  url.searchParams.set("providerRoomId", params.providerRoomId ?? "");
  url.searchParams.set("segment", params.segment ?? "");
  url.searchParams.set("isDomestic", String(params.isDomestic ?? false));
  url.searchParams.set("childAges", params.childAges?.join(",") ?? "");

  return url.toString();
}

function toRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toRecordArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => toRecord(entry))
    .filter((entry): entry is Record<string, unknown> => entry !== null);
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => toStringValue(entry))
    .filter((entry): entry is string => entry !== null);
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractAccommodationImageFromHtml(html: string) {
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  );

  if (ogImageMatch?.[1]) {
    return decodeHtmlEntities(ogImageMatch[1]);
  }

  const originalImageMatch = html.match(
    /"imageUrls":\{[^}]*"original":"([^"]+)"/,
  );

  if (originalImageMatch?.[1]) {
    return decodeHtmlEntities(originalImageMatch[1].replace(/\\u0026/g, "&"));
  }

  return "";
}

function extractNextDataPayload(html: string) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );

  if (!match?.[1]) {
    return null;
  }

  try {
    return toRecord(JSON.parse(match[1]));
  } catch {
    return null;
  }
}

function readIconTitles(value: unknown) {
  return toRecordArray(value)
    .map((entry) => toStringValue(entry.title))
    .filter((entry): entry is string => entry !== null);
}

function readBadgeTitles(value: unknown) {
  return toRecordArray(value)
    .map((badge) => {
      const titles = toRecordArray(badge.titles)
        .map((title) => toStringValue(title.text))
        .filter((title): title is string => title !== null);

      return titles.join("");
    })
    .filter(Boolean);
}

function readInfoPairs(value: unknown) {
  return toRecordArray(value)
    .map((entry) => {
      const title = toStringValue(entry.title);
      const description = toStringValue(entry.description);

      if (!title || !description) {
        return null;
      }

      return { title, description };
    })
    .filter(
      (entry): entry is { title: string; description: string } => entry !== null,
    );
}

export interface AccommodationProductRoom {
  roomKey: string;
  roomId: string | null;
  providerRoomId: string;
  title: string;
  headline: string | null;
  imageUrl: string | undefined;
  imageUrls: string[];
  attributes: string[];
  badges: string[];
  infos: Array<{ title: string; description: string }>;
  priceLabel: string | null;
  originalPriceText: string | null;
  averagePrice: number | null;
  averagePriceText: string | null;
  totalPrice: number | null;
  totalPriceText: string | null;
  priceDescription: string | null;
  footerPriceText: string | null;
  footerSubPriceText: string | null;
  status: string | null;
  isRecommendOption: boolean;
  isSoonSoldOut: boolean;
  bookUrl: string;
}

export interface AccommodationProductDetailSuccess {
  ok: true;
  status: number;
  title: string;
  ratingScore: number | null;
  address: string | null;
  heroImageUrl?: string;
  roomOptions: AccommodationProductRoom[];
}

export interface AccommodationProductDetailError {
  ok: false;
  status: number;
  message: string;
}

export type AccommodationProductDetailResult =
  | AccommodationProductDetailSuccess
  | AccommodationProductDetailError;

function toAccommodationProductRoom(
  itemId: string,
  params: AccommodationBookingParams,
  raw: Record<string, unknown>,
) {
  const header = toRecord(raw.header);
  const ratePlan = toRecord(raw.ratePlan);
  const priceDetail = toRecord(ratePlan?.priceDetail);

  if (!header && !ratePlan) {
    return null;
  }

  const providerRoomId =
    readString(ratePlan?.providerRoomId, header?.providerRoomId) ?? "";
  const roomIdNumber = toNumber(header?.roomId) ?? toNumber(ratePlan?.roomId);
  const imageUrls = dedupeStrings(
    [...readStringArray(header?.representImageUrls), ...readStringArray(header?.imageUrls)].map(
      (value) => decodeHtmlEntities(value.replace(/\\u0026/g, "&")),
    ),
  );
  const attributes = dedupeStrings(readIconTitles(header?.representAttributesWithIcon));
  const badges = dedupeStrings(readBadgeTitles(priceDetail?.badges));
  const title =
    readString(header?.title, priceDetail?.roomName, ratePlan?.optionName) ||
    "객실 옵션";
  const headline = readString(toRecord(toRecord(header?.headLine)?.left)?.title) || null;
  const averagePrice = toNumber(ratePlan?.averagePrice);
  const totalPrice = toNumber(ratePlan?.totalPrice) ?? toNumber(ratePlan?.salePrice);
  const roomKey =
    providerRoomId ||
    readString(ratePlan?.rateOptionId, ratePlan?.bedGroupId) ||
    String(roomIdNumber ?? title);

  return {
    roomKey,
    roomId: roomIdNumber !== null ? String(roomIdNumber) : null,
    providerRoomId,
    title,
    headline,
    imageUrl: imageUrls[0] || undefined,
    imageUrls,
    attributes,
    badges,
    infos: readInfoPairs(priceDetail?.infos),
    priceLabel: readString(ratePlan?.priceLabel) || null,
    originalPriceText: readString(ratePlan?.originalPriceText) || null,
    averagePrice,
    averagePriceText: readString(ratePlan?.averagePriceText) || null,
    totalPrice,
    totalPriceText:
      readString(ratePlan?.totalPriceText, priceDetail?.footerPriceText) || null,
    priceDescription: readString(ratePlan?.priceDescription) || null,
    footerPriceText: readString(priceDetail?.footerPriceText) || null,
    footerSubPriceText: readString(priceDetail?.footerSubPriceText) || null,
    status: readString(ratePlan?.status) || null,
    isRecommendOption: Boolean(ratePlan?.isRecommendOption),
    isSoonSoldOut: Boolean(ratePlan?.isSoonSoldOut),
    bookUrl: buildAccommodationBookUrl(itemId, {
      ...params,
      providerRoomId,
    }),
  } satisfies AccommodationProductRoom;
}

export async function fetchAccommodationProductDetail(
  itemId: string,
  params: AccommodationBookingParams,
): Promise<AccommodationProductDetailResult> {
  const targetUrl = buildAccommodationBookUrl(itemId, params);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: `MyRealTrip accommodation detail page returned ${response.status}.`,
      };
    }

    const html = await response.text();
    const nextData = extractNextDataPayload(html);
    const pageProps = toRecord(toRecord(nextData?.props)?.pageProps);
    const dehydratedState = toRecord(pageProps?.dehydratedState);
    const queries = toRecordArray(dehydratedState?.queries);
    const detailQuery = queries.find((entry) => {
      const queryKey = entry.queryKey;
      return (
        Array.isArray(queryKey) &&
        queryKey[0] === "unionProduct" &&
        queryKey[1] === "detailV3"
      );
    });
    const detailData = toRecord(toRecord(toRecord(detailQuery?.state)?.data)?.data);
    const sections = toRecordArray(detailData?.sections);
    const profileSection =
      sections.find((section) => toStringValue(section.type) === "STAY_PROFILE") ??
      sections[0];
    const ratePlanSection = sections.find((section) =>
      Array.isArray(section.ratePlanCards),
    );
    const roomOptions = toRecordArray(ratePlanSection?.ratePlanCards)
      .map((entry) => toAccommodationProductRoom(itemId, params, entry))
      .filter((entry): entry is AccommodationProductRoom => entry !== null);
    const heroImageUrl =
      roomOptions.find((room) => room.imageUrl)?.imageUrl ??
      (extractAccommodationImageFromHtml(html) || undefined);
    const title =
      readString(profileSection?.title, pageProps?.title) || `숙소 ${itemId}`;

    return {
      ok: true,
      status: response.status,
      title,
      ratingScore: toNumber(profileSection?.ratingScore),
      address: readString(toRecord(profileSection?.location)?.address) || null,
      heroImageUrl,
      roomOptions,
    };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip accommodation detail page timed out."
        : "Failed to reach the MyRealTrip accommodation detail page.",
    };
  }
}

export async function fetchAccommodationImageUrl(
  itemId: string,
  params: AccommodationImageLookupParams,
) {
  const targetUrl = buildAccommodationBookUrl(itemId, params);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 12 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return "";
    }

    const html = await response.text();
    return extractAccommodationImageFromHtml(html);
  } catch {
    return "";
  }
}

export async function hydrateAccommodationImages(
  items: AccommodationSearchItem[],
  params: AccommodationImageLookupParams,
  limit = 6,
) {
  const entries = await Promise.all(
    items.map(async (item, index) => {
      if (item.imageUrl || index >= limit) {
        return item;
      }

      const imageUrl = await fetchAccommodationImageUrl(item.itemId, params);
      if (!imageUrl) {
        return item;
      }

      return {
        ...item,
        imageUrl,
      };
    }),
  );

  return entries;
}

function pickAccommodationItems(payload: Record<string, unknown> | null) {
  const data =
    payload && typeof payload.data === "object" && payload.data !== null
      ? (payload.data as Record<string, unknown>)
      : null;

  const items = Array.isArray(data?.items)
    ? (data.items as Array<Record<string, unknown>>)
    : Array.isArray(payload?.items)
      ? (payload.items as Array<Record<string, unknown>>)
      : [];

  const page = toNumber(data?.page) ?? toNumber(payload?.page) ?? 0;
  const size = toNumber(data?.size) ?? toNumber(payload?.size) ?? items.length;
  const totalCount =
    toNumber(data?.totalCount) ??
    (payload &&
    typeof payload.meta === "object" &&
    payload.meta !== null &&
    "totalCount" in payload.meta
      ? toNumber((payload.meta as Record<string, unknown>).totalCount)
      : null) ??
    items.length;

  return {
    items,
    page,
    size,
    totalCount,
  };
}

function toAccommodationItem(
  raw: Record<string, unknown>,
  params: Pick<
    AccommodationSearchRequest,
    "checkIn" | "checkOut" | "adultCount" | "childCount" | "isDomestic"
  >,
): AccommodationSearchItem | null {
  const itemId =
    toStringValue(raw.itemId) ??
    toStringValue(raw.id) ??
    toStringValue(raw.productId) ??
    (toNumber(raw.itemId) !== null ? String(toNumber(raw.itemId)) : null) ??
    (toNumber(raw.id) !== null ? String(toNumber(raw.id)) : null) ??
    (toNumber(raw.productId) !== null ? String(toNumber(raw.productId)) : null);

  const itemName = toStringValue(raw.itemName) ?? toStringValue(raw.name);

  if (!itemId || !itemName) {
    return null;
  }

  const imageUrl =
    toStringValue(raw.imageUrl) ??
    toStringValue(raw.thumbnailUrl) ??
    toStringValue(raw.thumbnail) ??
    toStringValue(raw.image);

  return {
    itemId,
    itemName,
    originalPrice: toNumber(raw.originalPrice),
    salePrice: toNumber(raw.salePrice) ?? toNumber(raw.price),
    reviewCount: toNumber(raw.reviewCount),
    reviewScore: toStringValue(raw.reviewScore),
    starRating: toNumber(raw.starRating),
    imageUrl: imageUrl ?? undefined,
    bookUrl:
      toStringValue(raw.bookUrl) ??
      toStringValue(raw.productUrl) ??
      toStringValue(raw.url) ??
      buildAccommodationBookUrl(itemId, params),
    raw,
  };
}

export async function searchAccommodationsViaApi(
  params: AccommodationSearchRequest,
): Promise<AccommodationSearchResult> {
  const apiKey = getMyRealTripApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MRT_PARTNER_API_KEY is not configured.",
    };
  }

  const body: Record<string, unknown> = {
    keyword: params.keyword,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    adultCount: params.adultCount,
    childCount: params.childCount ?? 0,
    isDomestic: params.isDomestic ?? false,
    page: params.page ?? 0,
    size: params.size ?? 20,
  };

  if (params.regionId !== undefined) body.regionId = params.regionId;
  if (params.starRating) body.starRating = params.starRating;
  if (params.stayPoi !== undefined) body.stayPoi = params.stayPoi;
  if (params.order) body.order = params.order;
  if (params.minPrice !== undefined) body.minPrice = params.minPrice;
  if (params.maxPrice !== undefined) body.maxPrice = params.maxPrice;

  try {
    const response = await fetch(
      `${MYREALTRIP_API_BASE}${ACCOMMODATION_SEARCH_API_PATH}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | (PartnerApiEnvelope<Record<string, unknown>> & Record<string, unknown>)
      | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: readMessage(
          `MyRealTrip accommodation search API returned ${response.status}.`,
          payload,
        ),
      };
    }

    const parsed = pickAccommodationItems(payload);
    const items = parsed.items
      .map((item) =>
        toAccommodationItem(item, {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          adultCount: params.adultCount,
          childCount: params.childCount,
          isDomestic: params.isDomestic,
        }),
      )
      .filter((item): item is AccommodationSearchItem => item !== null);

    return {
      ok: true,
      status: response.status,
      items,
      page: parsed.page,
      size: parsed.size,
      totalCount: parsed.totalCount,
      searchedKeyword: params.keyword,
    };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";

    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "MyRealTrip accommodation search API timed out."
        : "Failed to reach the MyRealTrip accommodation search API.",
    };
  }
}

function accommodationKeywordCandidates(keyword: string) {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const normalized = trimmed.normalize("NFC");

  if (/\uC624\uC0AC\uCE74/.test(normalized)) {
    return [trimmed, "Osaka", "Namba", "Tennoji", "Umeda"];
  }

  if (/\uD6C4\uCFE0\uC624\uCE74/.test(normalized)) {
    return [trimmed, "Fukuoka", "Hakata", "Tenjin"];
  }

  if (/\uB09C\uBC14/.test(normalized)) {
    return [trimmed, "Namba", "Osaka Namba", "Osaka"];
  }

  if (/\uD150\uB178\uC9C0/.test(normalized)) {
    return [trimmed, "Tennoji", "Osaka Tennoji", "Osaka"];
  }

  if (/\uD558\uCE74\uD0C0/.test(normalized)) {
    return [trimmed, "Hakata", "Fukuoka Hakata", "Fukuoka"];
  }

  if (/\uB3C4\uD1A4\uBCF4\uB9AC/.test(normalized)) {
    return [trimmed, "Dotonbori", "Osaka Dotonbori", "Osaka"];
  }

  if (/\uC6B0\uBA54\uB2E4/.test(normalized)) {
    return [trimmed, "Umeda", "Osaka Umeda", "Osaka"];
  }

  return [trimmed];
}

export async function searchAccommodationsSmart(
  params: AccommodationSearchRequest,
): Promise<AccommodationSearchResult> {
  const candidates = accommodationKeywordCandidates(params.keyword);
  let lastError: AccommodationSearchError | null = null;

  for (const keyword of candidates) {
    const result = await searchAccommodationsViaApi({
      ...params,
      keyword,
    });

    if (!result.ok) {
      lastError = result;
      continue;
    }

    if (result.items.length > 0 || keyword === candidates[candidates.length - 1]) {
      return result;
    }
  }

  return (
    lastError ?? {
      ok: false,
      status: 404,
      message: "No accommodation results were returned for the given keyword.",
    }
  );
}

export interface BuildMylinkUrlOptions {
  targetUrl: string;
  utmContent?: string;
  openInApp?: boolean;
}

export interface BuildMylinkUrlResult {
  url: string;
  hasMylink: boolean;
}

function buildSafeUtmContent(value: string | undefined) {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

export function buildMylinkUrl({
  targetUrl,
  utmContent = "home",
  openInApp = false,
}: BuildMylinkUrlOptions): BuildMylinkUrlResult {
  const mylinkId = process.env.MYREALTRIP_MYLINK_ID;
  const originalUrl = targetUrl || "";

  if (!originalUrl || !mylinkId) {
    return { url: originalUrl, hasMylink: false };
  }

  try {
    const parsed = new URL(originalUrl);
    parsed.searchParams.set("mylink_id", mylinkId);

    const safeUtmContent = buildSafeUtmContent(utmContent);
    if (safeUtmContent) {
      parsed.searchParams.set("utm_content", safeUtmContent);
    }

    if (openInApp) {
      parsed.searchParams.set("open_in_app", "true");
    }

    return { url: parsed.toString(), hasMylink: true };
  } catch {
    return { url: originalUrl, hasMylink: false };
  }
}
