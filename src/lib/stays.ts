import type { AccommodationSearchItem } from "@/src/lib/myrealtrip";
import type { AgodaStayCardItem } from "@/src/lib/agoda-stays";

export type StayPriceFilterOption = {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
};

export const STAY_PRICE_FILTERS: StayPriceFilterOption[] = [
  { id: "under-100k", label: "10만원 이하", min: null, max: 100000 },
  { id: "100k-200k", label: "10~20만원", min: 100000, max: 200000 },
  { id: "200k-300k", label: "20~30만원", min: 200000, max: 300000 },
  { id: "over-300k", label: "30만원+", min: 300000, max: null },
];

export type StaySearchState = {
  keyword: string;
  checkIn: string;
  checkOut: string;
  adultCount: number;
  childCount: number;
  roomCount: number;
  isDomestic: boolean;
  hotelPriceMin: number | null;
  hotelPriceMax: number | null;
  page: number;
  size: number;
};

export type StaySnapshot = Pick<
  AccommodationSearchItem,
  "itemId" | "itemName" | "salePrice" | "reviewScore" | "reviewCount" | "imageUrl" | "bookUrl"
>;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isValidDateString(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function addStayDays(dateValue: string, days: number) {
  if (!isValidDateString(dateValue)) return dateValue;
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return formatDate(date);
}

export function normalizeStayDates(checkIn: string, checkOut: string) {
  const safeCheckIn = isValidDateString(checkIn) ? checkIn : futureStayDate(35);
  const minCheckOut = addStayDays(safeCheckIn, 1);
  const safeCheckOut =
    isValidDateString(checkOut) && checkOut > safeCheckIn ? checkOut : minCheckOut;

  return {
    checkIn: safeCheckIn,
    checkOut: safeCheckOut,
    minCheckOut,
  };
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function budgetQueryToPriceRange(value: string | undefined) {
  switch (value) {
    case "100000":
      return { min: null, max: 100000 };
    case "200000":
      return { min: null, max: 200000 };
    case "300000":
      return { min: null, max: 300000 };
    case "premium":
    case "300000-plus":
      return { min: 300000, max: null };
    case "all":
      return { min: null, max: null };
    default:
      return undefined;
  }
}

function priceRangeToBudgetQuery(
  state: Pick<StaySearchState, "hotelPriceMin" | "hotelPriceMax">,
) {
  if (state.hotelPriceMin === 300000 && state.hotelPriceMax === null) {
    return "premium";
  }
  if (state.hotelPriceMax === 300000) return "300000";
  if (state.hotelPriceMax === 200000) return "200000";
  if (state.hotelPriceMax === 100000) return "100000";
  return "all";
}

export function futureStayDate(offsetDays: number, now = new Date()) {
  const target = new Date(now);
  target.setDate(target.getDate() + offsetDays);
  return formatDate(target);
}

export function getDefaultStaySearchState(
  keyword = "오사카",
  overrides?: Partial<StaySearchState>,
): StaySearchState {
  const base = {
    keyword,
    checkIn: futureStayDate(35),
    checkOut: futureStayDate(38),
    adultCount: 2,
    childCount: 0,
    roomCount: 1,
    isDomestic: false,
    hotelPriceMin: null,
    hotelPriceMax: null,
    page: 0,
    size: 12,
    ...overrides,
  };
  const dates = normalizeStayDates(base.checkIn, base.checkOut);

  return {
    ...base,
    ...dates,
    adultCount: clampInt(base.adultCount, 1, 8),
    childCount: clampInt(base.childCount, 0, 6),
    roomCount: clampInt(base.roomCount, 1, 4),
  };
}

export function coerceStaySearchState(
  input: Record<string, string | string[] | undefined>,
  fallbackKeyword = "오사카",
): StaySearchState {
  const pick = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const toInt = (value: string | undefined, fallback: number) => {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const toNullableInt = (value: string | undefined) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const adultCount = toInt(pick(input.adultCount) ?? pick(input.adults), 2);
  const childCount = toInt(pick(input.childCount) ?? pick(input.children), 0);
  const roomCount = toInt(pick(input.roomCount) ?? pick(input.rooms), 1);
  const city = pick(input.city)?.trim().toLowerCase();
  const keyword =
    pick(input.keyword)?.trim() ||
    (city === "fukuoka" ? "후쿠오카" : city === "osaka" ? "오사카" : fallbackKeyword);
  const budgetRange = budgetQueryToPriceRange(pick(input.budget));
  const hotelPriceMin = toNullableInt(
    pick(input.hotelPriceMin) ?? pick(input.minPrice),
  );
  const hotelPriceMax = toNullableInt(
    pick(input.hotelPriceMax) ?? pick(input.maxPrice),
  );

  return getDefaultStaySearchState(keyword, {
    checkIn: pick(input.checkIn) || futureStayDate(35),
    checkOut: pick(input.checkOut) || futureStayDate(38),
    adultCount,
    childCount,
    roomCount,
    isDomestic: pick(input.isDomestic) === "true",
    hotelPriceMin: hotelPriceMin ?? budgetRange?.min ?? null,
    hotelPriceMax: hotelPriceMax ?? budgetRange?.max ?? null,
    page: toInt(pick(input.page), 0),
    size: toInt(pick(input.size), 12),
  });
}

function appendHotelPriceParams(
  params: URLSearchParams,
  state: Pick<StaySearchState, "hotelPriceMin" | "hotelPriceMax">,
) {
  params.set("budget", priceRangeToBudgetQuery(state));

  if (state.hotelPriceMin !== null) {
    params.set("hotelPriceMin", String(state.hotelPriceMin));
  }

  if (state.hotelPriceMax !== null) {
    params.set("hotelPriceMax", String(state.hotelPriceMax));
  }
}

export function buildStayResultsHref(state: Partial<StaySearchState> & { keyword: string }) {
  const normalized = getDefaultStaySearchState(state.keyword, state);
  const params = new URLSearchParams({
    keyword: normalized.keyword,
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adultCount: String(normalized.adultCount),
    childCount: String(normalized.childCount),
    roomCount: String(normalized.roomCount),
    adults: String(normalized.adultCount),
    children: String(normalized.childCount),
    rooms: String(normalized.roomCount),
    isDomestic: String(normalized.isDomestic),
    page: String(normalized.page),
    size: String(normalized.size),
  });
  appendHotelPriceParams(params, normalized);

  return `/stays?${params.toString()}`;
}

export function buildStayDetailHref(
  snapshot: StaySnapshot,
  state: Partial<StaySearchState> & { keyword: string },
) {
  const normalized = getDefaultStaySearchState(state.keyword, state);
  const params = new URLSearchParams({
    keyword: normalized.keyword,
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adultCount: String(normalized.adultCount),
    childCount: String(normalized.childCount),
    roomCount: String(normalized.roomCount),
    adults: String(normalized.adultCount),
    children: String(normalized.childCount),
    rooms: String(normalized.roomCount),
    isDomestic: String(normalized.isDomestic),
    name: snapshot.itemName,
    salePrice: snapshot.salePrice !== null ? String(snapshot.salePrice) : "",
    reviewScore: snapshot.reviewScore ?? "",
    reviewCount: snapshot.reviewCount !== null ? String(snapshot.reviewCount) : "",
    imageUrl: snapshot.imageUrl ?? "",
    bookUrl: snapshot.bookUrl,
  });
  appendHotelPriceParams(params, normalized);

  return `/stays/${snapshot.itemId}?${params.toString()}`;
}

function cityQueryFromKeyword(keyword: string) {
  return keyword.includes("후쿠오카") || keyword.includes("하카타")
    ? "fukuoka"
    : "osaka";
}

export function buildAgodaStayBridgeHref(
  snapshot: AgodaStayCardItem,
  state: Partial<StaySearchState> & { keyword: string },
) {
  const normalized = getDefaultStaySearchState(state.keyword, state);
  const params = new URLSearchParams({
    city: cityQueryFromKeyword(normalized.keyword),
    keyword: normalized.keyword,
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adultCount: String(normalized.adultCount),
    childCount: String(normalized.childCount),
    roomCount: String(normalized.roomCount),
    adults: String(normalized.adultCount),
    children: String(normalized.childCount),
    rooms: String(normalized.roomCount),
    name: snapshot.name,
    imageUrl: snapshot.imageUrl ?? "",
    pricePerNight:
      snapshot.pricePerNight !== null ? String(snapshot.pricePerNight) : "",
    totalPrice: snapshot.totalPrice !== null ? String(snapshot.totalPrice) : "",
    rating: snapshot.rating !== null ? String(snapshot.rating) : "",
    reviewCount:
      snapshot.reviewCount !== null ? String(snapshot.reviewCount) : "",
    starRating:
      snapshot.starRating !== null ? String(snapshot.starRating) : "",
    currency: snapshot.currency,
    bookingUrl: snapshot.bookingUrl,
  });
  appendHotelPriceParams(params, normalized);

  return `/stays/agoda/${snapshot.id}?${params.toString()}`;
}

export function formatStayPriceLabel(price: number | null) {
  if (!price || price <= 0) {
    return "가격 확인";
  }

  return `1박 ${price.toLocaleString("ko-KR")}원~`;
}
