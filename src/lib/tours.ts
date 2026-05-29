import type { TnaSearchItem, TnaSort } from "@/src/lib/myrealtrip";

export type TourSearchState = {
  keyword: string;
  city: string;
  category: string;
  sort: TnaSort;
  page: number;
  perPage: number;
};

export type TourSnapshot = Pick<
  TnaSearchItem,
  | "gid"
  | "itemName"
  | "productUrl"
  | "salePrice"
  | "priceDisplay"
  | "category"
  | "deepLink"
  | "description"
  | "imageUrl"
  | "reviewCount"
  | "reviewScore"
  | "tags"
>;

const validSorts = new Set<TnaSort>([
  "price_asc",
  "price_desc",
  "review_score_desc",
  "selling_count_desc",
]);

type TourRegion = "osaka" | "fukuoka";

function normalizeRegionText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function detectTourRegionKeyword(value: string): TourRegion | null {
  const normalized = normalizeRegionText(value);
  if (["후쿠오카", "후쿠오까", "fukuoka", "fuk"].includes(normalized)) {
    return "fukuoka";
  }
  if (["오사카", "오사까", "osaka", "kix"].includes(normalized)) {
    return "osaka";
  }

  return null;
}

function tourRegionLabel(region: TourRegion) {
  return region === "fukuoka" ? "후쿠오카" : "오사카";
}

function categoryFallbackKeyword(region: TourRegion, category: string) {
  const value = category.trim().toLowerCase();
  if (!value || value === "all") return "";

  if (value.includes("근교") || value.includes("suburb")) {
    return region === "fukuoka" ? "후쿠오카 다자이후" : "오사카 근교투어";
  }
  if (value.includes("티켓") || value.includes("입장") || value.includes("ticket")) {
    return region === "fukuoka" ? "후쿠오카 입장권" : "USJ 입장권";
  }
  if (
    value.includes("이동") ||
    value.includes("교통") ||
    value.includes("패스") ||
    value.includes("transportation")
  ) {
    return region === "fukuoka" ? "후쿠오카 산큐패스" : "라피트";
  }
  if (
    value.includes("와이파이") ||
    value.includes("wifi") ||
    value.includes("esim") ||
    value.includes("유심") ||
    value.includes("usim")
  ) {
    return "일본 eSIM";
  }
  if (value.includes("tour") || value.includes("투어")) {
    return region === "fukuoka" ? "후쿠오카 시티투어" : "오사카 시티투어";
  }

  return "";
}

function regionFallbackCategories(region: TourRegion) {
  return region === "fukuoka"
    ? ["tour", "transportation", "ticket"]
    : ["suburb_tour", "ticket_v2", "transportation_v2"];
}

export function buildTourRegionFallbackSearches(
  state: Pick<TourSearchState, "keyword" | "city" | "category">,
) {
  const keywordRegion = detectTourRegionKeyword(state.keyword);
  if (!keywordRegion) return [];

  const region = keywordRegion;
  const city = tourRegionLabel(region);
  const category = state.category || "all";

  if (category !== "all") {
    const categoryKeyword = categoryFallbackKeyword(region, category);
    const searches = [
      { keyword: state.keyword, city, category },
      categoryKeyword ? { keyword: categoryKeyword, city, category } : null,
      categoryKeyword ? { keyword: categoryKeyword, city, category: "all" } : null,
    ];

    return searches.filter(Boolean) as Array<
      Pick<TourSearchState, "keyword" | "city" | "category">
    >;
  }

  return regionFallbackCategories(region).map((categoryName) => ({
    keyword: city,
    city,
    category: categoryName,
  }));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function futureTourDate(offsetDays: number, now = new Date()) {
  const target = new Date(now);
  target.setDate(target.getDate() + offsetDays);
  return formatDate(target);
}

export function inferTourCity(input: string) {
  const value = input.trim().toLowerCase();
  if (value.includes("후쿠오카") || value.includes("fukuoka")) {
    return "후쿠오카";
  }

  return "오사카";
}

export function getDefaultTourSearchState(
  keyword = "오사카",
  overrides?: Partial<TourSearchState>,
): TourSearchState {
  const city = overrides?.city?.trim() || inferTourCity(keyword);

  return {
    keyword,
    city,
    category: "all",
    sort: "selling_count_desc",
    page: 1,
    perPage: 12,
    ...overrides,
  };
}

export function coerceTourSearchState(
  input: Record<string, string | string[] | undefined>,
  fallbackKeyword = "오사카",
): TourSearchState {
  const pick = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const keyword = pick(input.keyword)?.trim() || pick(input.query)?.trim() || fallbackKeyword;
  const city = pick(input.city)?.trim() || inferTourCity(keyword);
  const sortValue = pick(input.sort) as TnaSort | undefined;
  const page = Number.parseInt(pick(input.page) ?? "", 10);
  const perPage = Number.parseInt(pick(input.perPage) ?? "", 10);

  return getDefaultTourSearchState(keyword, {
    city,
    category: pick(input.category)?.trim() || "all",
    sort: sortValue && validSorts.has(sortValue) ? sortValue : "selling_count_desc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: Number.isFinite(perPage) && perPage > 0 ? Math.min(perPage, 100) : 12,
  });
}

export function buildTourResultsHref(
  state: Partial<TourSearchState> & { keyword: string },
) {
  const normalized = getDefaultTourSearchState(state.keyword, state);
  const params = new URLSearchParams({
    keyword: normalized.keyword,
    city: normalized.city,
    category: normalized.category,
    sort: normalized.sort,
    page: String(normalized.page),
    perPage: String(normalized.perPage),
  });

  return `/tours?${params.toString()}`;
}

export function buildTourDetailHref(
  snapshot: TourSnapshot,
  state: Partial<TourSearchState> & { keyword: string },
) {
  const normalized = getDefaultTourSearchState(state.keyword, state);
  const params = new URLSearchParams({
    keyword: normalized.keyword,
    city: normalized.city,
    category: normalized.category,
    sort: normalized.sort,
    name: snapshot.itemName,
    salePrice: String(snapshot.salePrice || ""),
    priceDisplay: snapshot.priceDisplay || "",
    reviewScore:
      typeof snapshot.reviewScore === "number" ? String(snapshot.reviewScore) : "",
    reviewCount:
      typeof snapshot.reviewCount === "number" ? String(snapshot.reviewCount) : "",
    imageUrl: snapshot.imageUrl ?? "",
    productUrl: snapshot.productUrl,
    deepLink: snapshot.deepLink ?? "",
    description: snapshot.description ?? "",
    itemCategory: snapshot.category ?? "",
    tags: snapshot.tags?.join(",") ?? "",
  });

  return `/tours/${snapshot.gid}?${params.toString()}`;
}

export function formatTourPriceLabel(priceDisplay?: string, salePrice?: number | null) {
  if (priceDisplay?.trim()) return priceDisplay.trim();
  if (salePrice && salePrice > 0) {
    return `${salePrice.toLocaleString("ko-KR")}원~`;
  }

  return "요금 확인";
}

export function formatTourReviewLabel(score?: number | null, count?: number | null) {
  const scoreLabel =
    typeof score === "number" && score > 0
      ? score.toFixed(1).replace(/\.0$/, "")
      : "";
  const countLabel =
    typeof count === "number" && count > 0 ? count.toLocaleString("ko-KR") : "";

  if (scoreLabel && countLabel) return `평점 ${scoreLabel} · 후기 ${countLabel}개`;
  if (scoreLabel) return `평점 ${scoreLabel}`;
  if (countLabel) return `후기 ${countLabel}개`;
  return "후기 정보 확인";
}
