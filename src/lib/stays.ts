import type { AccommodationSearchItem } from "@/src/lib/myrealtrip";

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

  return getDefaultStaySearchState(pick(input.keyword)?.trim() || fallbackKeyword, {
    checkIn: pick(input.checkIn) || futureStayDate(35),
    checkOut: pick(input.checkOut) || futureStayDate(38),
    adultCount,
    childCount,
    roomCount,
    isDomestic: pick(input.isDomestic) === "true",
    hotelPriceMin: toNullableInt(
      pick(input.hotelPriceMin) ?? pick(input.minPrice),
    ),
    hotelPriceMax: toNullableInt(
      pick(input.hotelPriceMax) ?? pick(input.maxPrice),
    ),
    page: toInt(pick(input.page), 0),
    size: toInt(pick(input.size), 12),
  });
}

function appendHotelPriceParams(
  params: URLSearchParams,
  state: Pick<StaySearchState, "hotelPriceMin" | "hotelPriceMax">,
) {
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

export function formatStayPriceLabel(price: number | null) {
  if (!price || price <= 0) {
    return "가격 확인";
  }

  return `1박 ${price.toLocaleString("ko-KR")}원~`;
}
