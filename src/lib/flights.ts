import type { FlightTripTypeCode } from "@/src/lib/myrealtrip";

export type FlightAirportCode = "ALL" | "ICN" | "GMP" | "PUS" | "TAE" | "CJJ";
export type FlightDestinationCode = "KIX" | "FUK";
export type FlightTripType = Extract<FlightTripTypeCode, "OW" | "RT">;

export type FlightSearchState = {
  origin: FlightAirportCode;
  destination: FlightDestinationCode;
  tripType: FlightTripType;
  departDate: string;
  returnDate: string;
  adult: number;
};

export type MyRealTripFlightListParams = {
  origin: Exclude<FlightAirportCode, "ALL"> | FlightAirportCode;
  destination: FlightDestinationCode;
  tripType: FlightTripType;
  departDate: string;
  returnDate?: string;
  adult?: number;
  child?: number;
};

export type AirportOption = {
  code: Exclude<FlightAirportCode, "ALL">;
  name: string;
  city: string;
};

export const KOREA_DIRECT_FLIGHT_AIRPORTS: AirportOption[] = [
  { code: "ICN", name: "인천국제공항", city: "서울/인천" },
  { code: "GMP", name: "김포국제공항", city: "서울/김포" },
  { code: "PUS", name: "김해국제공항", city: "부산" },
  { code: "TAE", name: "대구국제공항", city: "대구" },
  { code: "CJJ", name: "청주국제공항", city: "청주" },
];

export const JAPAN_FLIGHT_DESTINATIONS: Array<{
  code: FlightDestinationCode;
  name: string;
  city: string;
}> = [
  { code: "KIX", name: "간사이국제공항", city: "오사카" },
  { code: "FUK", name: "후쿠오카공항", city: "후쿠오카" },
];

const DIRECT_ROUTE_ORIGINS: Record<FlightDestinationCode, AirportOption["code"][]> = {
  KIX: ["ICN", "GMP", "PUS", "TAE", "CJJ"],
  FUK: ["ICN", "PUS", "TAE", "CJJ"],
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function futureFlightDate(offsetDays: number, now = new Date()) {
  const target = new Date(now);
  target.setDate(target.getDate() + offsetDays);
  return formatDate(target);
}

export function addFlightDays(dateValue: string, days: number) {
  const base = new Date(dateValue);
  if (Number.isNaN(base.getTime())) {
    return futureFlightDate(days);
  }

  base.setDate(base.getDate() + days);
  return formatDate(base);
}

export function getAirportLabel(code: FlightAirportCode) {
  if (code === "ALL") return "전체 직항 공항";
  const airport = KOREA_DIRECT_FLIGHT_AIRPORTS.find((item) => item.code === code);
  return airport ? `${airport.city}(${airport.code})` : code;
}

export function getDestinationLabel(code: FlightDestinationCode) {
  const destination = JAPAN_FLIGHT_DESTINATIONS.find((item) => item.code === code);
  return destination ? `${destination.city}(${destination.code})` : code;
}

export function getAvailableFlightOrigins(destination: FlightDestinationCode) {
  const codes = DIRECT_ROUTE_ORIGINS[destination];
  return KOREA_DIRECT_FLIGHT_AIRPORTS.filter((airport) => codes.includes(airport.code));
}

export function isDirectFlightRoute(
  origin: FlightAirportCode,
  destination: FlightDestinationCode,
) {
  if (origin === "ALL") return true;
  return DIRECT_ROUTE_ORIGINS[destination].includes(origin);
}

export function inferFlightDestination(input: string): FlightDestinationCode {
  const value = input.trim().toLowerCase();
  if (value.includes("후쿠") || value.includes("fuk") || value.includes("fukuoka")) {
    return "FUK";
  }

  return "KIX";
}

export function getDefaultFlightSearchState(
  overrides?: Partial<FlightSearchState>,
): FlightSearchState {
  const departDate = overrides?.departDate || futureFlightDate(35);

  return {
    origin: "ICN",
    destination: "KIX",
    tripType: "RT",
    departDate,
    returnDate: overrides?.returnDate || addFlightDays(departDate, 3),
    adult: 1,
    ...overrides,
  };
}

export function coerceFlightSearchState(
  input: Record<string, string | string[] | undefined>,
): FlightSearchState {
  const pick = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const origin = pick(input.origin) as FlightAirportCode | undefined;
  const destination = pick(input.destination) as FlightDestinationCode | undefined;
  const tripType = pick(input.tripType) as FlightTripType | undefined;
  const departDate = pick(input.departDate) || futureFlightDate(35);
  const returnDate = pick(input.returnDate) || addFlightDays(departDate, 3);
  const adult = Number.parseInt(pick(input.adult) ?? "", 10);

  const normalizedDestination =
    destination === "FUK" || destination === "KIX" ? destination : "KIX";
  const normalizedOrigin =
    origin === "ALL" ||
    KOREA_DIRECT_FLIGHT_AIRPORTS.some((airport) => airport.code === origin)
      ? origin
      : "ICN";

  return getDefaultFlightSearchState({
    origin: normalizedOrigin,
    destination: normalizedDestination,
    tripType: tripType === "OW" ? "OW" : "RT",
    departDate,
    returnDate,
    adult: Number.isFinite(adult) && adult > 0 ? Math.min(adult, 9) : 1,
  });
}

export function buildFlightResultsHref(state: Partial<FlightSearchState>) {
  const normalized = getDefaultFlightSearchState(state);
  const params = new URLSearchParams({
    origin: normalized.origin,
    destination: normalized.destination,
    tripType: normalized.tripType,
    departDate: normalized.departDate,
    adult: String(normalized.adult),
  });

  if (normalized.tripType === "RT") {
    params.set("returnDate", normalized.returnDate);
  }

  return `/flights?${params.toString()}`;
}

export function buildLegacyFlightResultsHref(state: FlightSearchState) {
  const params = new URLSearchParams({
    origin: state.origin === "ALL" ? "ICN" : state.origin,
    destination: state.destination,
    departDate: state.departDate,
  });

  if (state.tripType === "RT") {
    params.set("returnDate", state.returnDate);
  }

  return `/flight-results.html?${params.toString()}`;
}

export function buildMyRealTripFlightListRedirectHref(
  state: MyRealTripFlightListParams,
) {
  const origin = state.origin === "ALL" ? "ICN" : state.origin;
  const tripType = state.tripType === "OW" ? "OW" : "RT";
  const params = new URLSearchParams({
    origin,
    destination: state.destination,
    tripType,
    departDate: state.departDate,
    adult: String(Math.max(1, state.adult ?? 1)),
    child: String(Math.max(0, state.child ?? 0)),
  });

  if (tripType === "RT" && state.returnDate) {
    params.set("returnDate", state.returnDate);
  }

  return `/api/myrealtrip/flight-redirect?${params.toString()}`;
}

export function formatFlightPrice(price?: number | null) {
  if (!price || price <= 0) return "요금 확인";
  return `${price.toLocaleString("ko-KR")}원~`;
}
