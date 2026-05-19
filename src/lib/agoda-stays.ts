import type { StaySearchState } from "@/src/lib/stays";

export type AgodaStayCardItem = {
  id: string;
  source: "agoda";
  name: string;
  imageUrl: string | null;
  rating: number | null;
  ratingScale: 10;
  reviewCount: number | null;
  starRating: number | null;
  pricePerNight: number | null;
  totalPrice: number | null;
  currency: string;
  bookingUrl: string;
  isExternal: true;
  isBookable: true;
};

type AgodaSearchResponse = {
  ok?: boolean;
  hotels?: Array<{
    id?: string;
    source?: string;
    name?: string;
    imageUrl?: string | null;
    starRating?: number | null;
    reviewScore?: number | null;
    reviewCount?: number | null;
    pricePerNight?: number | null;
    totalPrice?: number | null;
    currency?: string;
    bookingUrl?: string | null;
    hasBookingUrl?: boolean;
  }>;
};

function agodaCityFromKeyword(keyword: string) {
  const normalized = keyword.trim();
  if (normalized.includes("후쿠오카") || normalized.includes("하카타")) {
    return "fukuoka";
  }
  if (
    normalized.includes("오사카") ||
    normalized.includes("난바") ||
    normalized.includes("우메다") ||
    normalized.includes("신사이바시")
  ) {
    return "osaka";
  }
  return null;
}

function normalizeAgodaStay(
  hotel: NonNullable<AgodaSearchResponse["hotels"]>[number],
): AgodaStayCardItem | null {
  const id = typeof hotel.id === "string" ? hotel.id.trim() : "";
  const name = typeof hotel.name === "string" ? hotel.name.trim() : "";
  const bookingUrl =
    typeof hotel.bookingUrl === "string" ? hotel.bookingUrl.trim() : "";

  if (!id || !name || !bookingUrl) return null;

  return {
    id,
    source: "agoda",
    name,
    imageUrl: hotel.imageUrl?.replace(/^http:/, "https:") ?? null,
    rating:
      typeof hotel.reviewScore === "number" && Number.isFinite(hotel.reviewScore)
        ? hotel.reviewScore
        : null,
    ratingScale: 10,
    reviewCount:
      typeof hotel.reviewCount === "number" && Number.isFinite(hotel.reviewCount)
        ? hotel.reviewCount
        : null,
    starRating:
      typeof hotel.starRating === "number" && Number.isFinite(hotel.starRating)
        ? hotel.starRating
        : null,
    pricePerNight:
      typeof hotel.pricePerNight === "number" &&
      Number.isFinite(hotel.pricePerNight)
        ? hotel.pricePerNight
        : null,
    totalPrice:
      typeof hotel.totalPrice === "number" && Number.isFinite(hotel.totalPrice)
        ? hotel.totalPrice
        : null,
    currency: hotel.currency || "KRW",
    bookingUrl,
    isExternal: true,
    isBookable: true,
  };
}

export async function fetchAgodaHotelsForStays({
  origin,
  state,
  maxResult = 10,
}: {
  origin: string | null | undefined;
  state: StaySearchState;
  maxResult?: number;
}): Promise<AgodaStayCardItem[]> {
  const city = agodaCityFromKeyword(state.keyword);
  if (!origin || !city || !state.checkIn || !state.checkOut) return [];

  const url = new URL("/api/agoda/hotels/search", origin);
  url.searchParams.set("city", city);
  url.searchParams.set("checkIn", state.checkIn);
  url.searchParams.set("checkOut", state.checkOut);
  url.searchParams.set("travelers", String(Math.max(1, state.adultCount)));
  url.searchParams.set("maxResult", String(maxResult));

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return [];

    const payload = (await response.json().catch(() => null)) as
      | AgodaSearchResponse
      | null;

    if (!payload?.ok || !Array.isArray(payload.hotels)) return [];

    return payload.hotels
      .map((hotel) => normalizeAgodaStay(hotel))
      .filter((hotel): hotel is AgodaStayCardItem => hotel !== null);
  } catch (error) {
    console.warn("Agoda stays unavailable", error instanceof Error ? error.message : "unknown error");
    return [];
  }
}
