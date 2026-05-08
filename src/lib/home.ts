import {
  type BudgetPreset,
  homeMockData,
  type FlightDealData,
  type HomePageData,
  type ProductCardData,
  type SearchTabData,
} from "@/src/data/home";
import {
  fetchAccommodationImageUrl,
  searchTnaProductsViaApi,
  searchAccommodationsSmart,
} from "@/src/lib/myrealtrip";
import { buildStayDetailHref } from "@/src/lib/stays";
import { buildTourDetailHref } from "@/src/lib/tours";

const MRT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";
const MRT_PARTNER_API = "https://partner-ext-api.myrealtrip.com";

const BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: "budget",
    label: "가성비",
    displayRange: "1인 50~70만원",
    summary: "시내 중심 + 가까운 근교 선택",
    icon: "wallet",
    defaultBudgetPerPerson: 600000,
    nights: 2,
    days: 3,
    defaultPackageType: "flight_hotel",
    nearbyMode: "light",
  },
  {
    id: "standard",
    label: "표준",
    displayRange: "1인 80~120만원",
    summary: "시내 + 대표 근교 1곳 추천",
    icon: "sparkles",
    defaultBudgetPerPerson: 1000000,
    nights: 3,
    days: 4,
    defaultPackageType: "flight_hotel_tour",
    nearbyMode: "standard",
  },
  {
    id: "premium",
    label: "프리미엄",
    displayRange: "1인 150만원+",
    summary: "좋은 숙소 + 근교/테마 경험",
    icon: "crown",
    defaultBudgetPerPerson: 1500000,
    nights: 4,
    days: 5,
    defaultPackageType: "flight_hotel_tour",
    nearbyMode: "comfort",
  },
];

type CityCode = "FUK" | "KIX";

type WidgetNode = {
  type?: string;
  value?: unknown;
  src?: string;
  weight?: string;
  label?: string;
  url?: string;
  onClickAction?: { url?: string };
  children?: WidgetNode[];
};

type ParsedWidgetItem = {
  name: string;
  imageUrl: string;
  rating: string;
  reviewCount: string;
  priceText: string;
  bookUrl: string;
  tag: string;
};

type FareEntry = {
  departureDate: string;
  returnDate: string;
  fromCity: string;
  toCity: string;
  totalPrice: number;
  averagePrice: number;
  airline: string;
  period: number;
  transfer: number;
};

const HOME_CITY_CONFIG = {
  FUK: {
    city: "후쿠오카",
    keyword: "후쿠오카",
    stayArt: "stay-fukuoka",
    tourArt: "tour-fukuoka",
    flightArt: "flight-fukuoka",
    stayOffset: 35,
    fallbackFlightOffset: 35,
  },
  KIX: {
    city: "오사카",
    keyword: "오사카",
    stayArt: "stay-osaka",
    tourArt: "tour-osaka",
    flightArt: "flight-osaka",
    stayOffset: 42,
    fallbackFlightOffset: 42,
  },
} as const;

function futureDate(offsetDays: number) {
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  return target.toISOString().slice(0, 10);
}

function buildFlightHref(
  destination: CityCode,
  departDate = futureDate(HOME_CITY_CONFIG[destination].fallbackFlightOffset),
  returnDate = futureDate(HOME_CITY_CONFIG[destination].fallbackFlightOffset + 3),
) {
  const params = new URLSearchParams({
    origin: "ICN",
    destination,
    tripType: "RT",
    departDate,
    returnDate,
    adult: "1",
  });

  return `/flights?${params.toString()}`;
}

async function buildFlightPartnerHref(
  destination: CityCode,
  departDate: string,
  returnDate: string,
) {
  return buildFlightHref(destination, departDate, returnDate);
}

function compactPriceLabel(totalPrice: number) {
  const man = totalPrice / 10_000;
  const text = man >= 100 ? man.toFixed(0) : man.toFixed(1);
  return `${text.replace(/\.0$/, "")}만~`;
}

function normalizeExternalUrl(url: string) {
  if (!url) return "";

  try {
    return new URL(url).toString();
  } catch {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `https://www.myrealtrip.com${path}`;
  }
}

// Kept temporarily for fallback while live home data moves from MCP to partner REST APIs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function callMrtMcp(toolName: string, args: Record<string, unknown>) {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: { name: toolName, arguments: args },
  });

  const response = await fetch(MRT_MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`MCP ${toolName} failed: ${response.status}`);
  }

  const json = (await response.json()) as {
    result?: { content?: Array<{ text?: string }> };
  };
  const text = json.result?.content?.[0]?.text;
  return text ? (JSON.parse(text) as Record<string, unknown>) : null;
}

function findListViewItems(node: WidgetNode, out: WidgetNode[] = []) {
  if (!node) return out;
  if (node.type === "ListViewItem") {
    out.push(node);
    return out;
  }

  node.children?.forEach((child) => findListViewItems(child, out));
  return out;
}

function extractWidgetItem(item: WidgetNode): ParsedWidgetItem {
  let name = "";
  let imageUrl = "";
  let rating = "";
  let reviewCount = "";
  let priceText = "";
  let bookUrl = "";
  let tag = "";

  function walk(node: WidgetNode) {
    if (!node) return;

    if (node.type === "Image" && typeof node.src === "string" && !imageUrl) {
      imageUrl = node.src;
    }

    if (node.type === "Text" && node.weight === "bold" && !name) {
      name = String(node.value ?? "").trim();
    }

    if (node.type === "Text" && !priceText) {
      const value = String(node.value ?? "").trim();
      if (/[₩원]|만원|\/박|성인/.test(value)) {
        priceText = value;
      }
    }

    if (node.type === "Text" && !rating) {
      const value = String(node.value ?? "");
      const match = value.match(/([\d.]+)\s*\(([^)]+)\)/);
      if (match) {
        rating = match[1];
        reviewCount = match[2];
      }
    }

    if (node.type === "Badge" && typeof node.label === "string" && !tag) {
      tag = node.label;
    }

    if (node.type === "Button" && node.onClickAction?.url && !bookUrl) {
      bookUrl = node.onClickAction.url;
    }

    node.children?.forEach(walk);
  }

  walk(item);

  return {
    name,
    imageUrl,
    rating,
    reviewCount,
    priceText,
    bookUrl,
    tag,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseWidgetItems(data: Record<string, unknown> | null, limit: number) {
  const widget = (data as { widget?: WidgetNode } | null)?.widget;
  if (!widget) return [];

  return findListViewItems(widget).slice(0, limit).map(extractWidgetItem);
}

function formatStayPriceFromNumber(price: number | null) {
  if (!price || price <= 0) return "1박 요금 확인";

  return `1박 최저 ${price.toLocaleString("ko-KR")}원~`;
}

function formatTourPrice(rawPrice: string) {
  const cleaned = rawPrice.trim();
  if (!cleaned) return "성인 요금 확인";
  return cleaned.startsWith("성인") ? cleaned : `성인 ${cleaned}`;
}

function fallbackReviewCount(value: string) {
  return value || "0";
}

function fallbackRating(value: string) {
  return value || "4.5";
}

function keywordList(items: ProductCardData[], fallback: string[]) {
  const names = items
    .map((item) => item.name.split(" ").slice(0, 2).join(" ").trim())
    .filter(Boolean);

  return Array.from(new Set([...names, ...fallback])).slice(0, 3);
}

function pickCheapest(items: FareEntry[], toCity: CityCode) {
  const filtered = items
    .filter((item) => item.toCity === toCity && item.totalPrice > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);

  return filtered[0] ?? null;
}

async function getLiveFlightDeals() {
  const apiKey = process.env.MRT_PARTNER_API_KEY ?? process.env.MYREALTRIP_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(`${MRT_PARTNER_API}/v1/products/flight/calendar/lowest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depCityCd: "ICN",
      arrCityCds: ["FUK", "KIX"],
      period: 4,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Flight calendar failed: ${response.status}`);
  }

  const raw = (await response.json()) as
    | FareEntry[]
    | { data?: FareEntry[]; items?: FareEntry[]; result?: FareEntry[]; results?: FareEntry[] };

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
      ? raw.data
      : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.result)
          ? raw.result
          : Array.isArray(raw.results)
            ? raw.results
            : [];

  return {
    FUK: pickCheapest(items, "FUK"),
    KIX: pickCheapest(items, "KIX"),
  };
}

async function getLiveStayCards() {
  const entries: Array<ProductCardData | null> = await Promise.all(
    (Object.keys(HOME_CITY_CONFIG) as CityCode[]).map(async (cityCode) => {
      const config = HOME_CITY_CONFIG[cityCode];
      const checkIn = futureDate(config.stayOffset);
      const checkOut = futureDate(config.stayOffset + 1);
      const serviceKeyword = cityCode === "FUK" ? "Fukuoka" : "Osaka";
      const result = await searchAccommodationsSmart({
        keyword: serviceKeyword,
        checkIn,
        checkOut,
        adultCount: 2,
        childCount: 0,
        isDomestic: false,
        page: 0,
        size: 4,
      });

      if (!result.ok) return null;

      const item = result.items[0];
      if (!item?.itemName || !item.bookUrl) return null;

      const imageUrl =
        item.imageUrl ||
        (await fetchAccommodationImageUrl(item.itemId, {
          checkIn,
          checkOut,
          adultCount: 2,
          childCount: 0,
          isDomestic: false,
        }));

      return {
        id: `live-stay-${cityCode.toLowerCase()}`,
        name: item.itemName,
        rating: fallbackRating(item.reviewScore ?? ""),
        reviewCount: fallbackReviewCount(
          item.reviewCount !== null ? item.reviewCount.toLocaleString("ko-KR") : "",
        ),
        priceLabel: formatStayPriceFromNumber(item.salePrice),
        metaLabel: `${config.city} · 마이리얼트립`,
        href: buildStayDetailHref(item, {
          keyword: config.city,
          checkIn,
          checkOut,
          adultCount: 2,
          childCount: 0,
          isDomestic: false,
        }),
        ctaLabel: "예약하기",
        imageUrl: imageUrl ? normalizeExternalUrl(imageUrl) : undefined,
        artVariant: config.stayArt,
      } satisfies ProductCardData;
    }),
  );

  return entries.filter((entry): entry is ProductCardData => entry !== null);
}

async function getLiveTourCards() {
  const entries: Array<ProductCardData | null> = await Promise.all(
    (Object.keys(HOME_CITY_CONFIG) as CityCode[]).map(async (cityCode) => {
      const config = HOME_CITY_CONFIG[cityCode];
      const result = await searchTnaProductsViaApi({
        keyword: `${config.keyword} 관광`,
        city: config.keyword,
        category: "all",
        sort: "selling_count_desc",
        page: 1,
        perPage: 4,
      });

      if (!result.ok) return null;

      const item = result.data.items[0];
      if (!item?.itemName || !item.productUrl) return null;

      return {
        id: `live-tour-${cityCode.toLowerCase()}`,
        name: item.itemName,
        rating: fallbackRating(item.reviewScore ? String(item.reviewScore) : ""),
        reviewCount: fallbackReviewCount(
          item.reviewCount ? item.reviewCount.toLocaleString("ko-KR") : "",
        ),
        priceLabel: formatTourPrice(item.priceDisplay),
        metaLabel: `${config.city} · ${item.category || "인기 투어"}`,
        href: buildTourDetailHref(item, {
          keyword: `${config.keyword} 관광`,
          city: config.keyword,
          category: "all",
          sort: "selling_count_desc",
          page: 1,
          perPage: 12,
        }),
        ctaLabel: "상세 보기",
        imageUrl: item.imageUrl ? normalizeExternalUrl(item.imageUrl) : undefined,
        artVariant: config.tourArt,
      } satisfies ProductCardData;
    }),
  );

  return entries.filter((entry): entry is ProductCardData => entry !== null);
}

async function mergeFlightDeals(
  liveDeals: Awaited<ReturnType<typeof getLiveFlightDeals>>,
): Promise<FlightDealData[]> {
  return Promise.all(
    homeMockData.flightDeals.map(async (deal) => {
      const live = liveDeals?.[deal.cityCode];
      const departDate =
        live?.departureDate ?? futureDate(HOME_CITY_CONFIG[deal.cityCode].fallbackFlightOffset);
      const returnDate =
        live?.returnDate ??
        futureDate(HOME_CITY_CONFIG[deal.cityCode].fallbackFlightOffset + 3);
      const href = await buildFlightPartnerHref(deal.cityCode, departDate, returnDate);

      if (!live) {
        return {
          ...deal,
          href,
        };
      }

      return {
        ...deal,
        priceLabel: compactPriceLabel(live.totalPrice),
        basisLabel: "인천 출발 · 편도 기준",
        note:
          deal.cityCode === "FUK"
            ? "실시간 캘린더 기준"
            : live.transfer === 0
              ? "직항 포함 최저가"
              : "최근 조회 기준 요약",
        href,
      };
    }),
  );
}

function mergeProductCards(
  liveCards: ProductCardData[],
  fallbackCards: ProductCardData[],
) {
  if (!liveCards.length) return fallbackCards;

  return fallbackCards.map((fallback, index) => ({
    ...fallback,
    ...(liveCards[index] ?? {}),
    artVariant: liveCards[index]?.artVariant ?? fallback.artVariant,
  }));
}

function buildSearchTabs(
  stayCards: ProductCardData[],
  tourCards: ProductCardData[],
  flightDeals: FlightDealData[],
): SearchTabData[] {
  return homeMockData.searchTabs.map((tab) => {
    if (tab.id === "stay") {
      return {
        ...tab,
        href: stayCards[0]?.href || tab.href,
        helper:
          "후쿠오사카 안에서 실시간 숙소 결과를 먼저 보고, 마음에 드는 숙소만 상세로 살펴볼 수 있어요.",
        keywords: keywordList(stayCards, tab.keywords),
        defaultQuery: stayCards[0]?.metaLabel.includes("후쿠오카")
          ? "후쿠오카"
          : "오사카",
      };
    }

    if (tab.id === "tour") {
      return {
        ...tab,
        href: "/tours",
        helper:
          "마이리얼트립 투어·티켓 데이터를 기준으로 원하는 상품을 바로 찾아드려요.",
        keywords: keywordList(tourCards, tab.keywords),
        defaultQuery: tourCards[0]?.metaLabel.includes("후쿠오카")
          ? "후쿠오카 관광"
          : "오사카 관광",
      };
    }

    const cheapestFlight = [...flightDeals].sort((a, b) => {
      const parse = (value: string) =>
        Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 999;

      return parse(a.priceLabel) - parse(b.priceLabel);
    })[0];

    return {
      ...tab,
      href: cheapestFlight?.href || tab.href,
      helper:
        "실시간 항공 기준으로 오사카와 후쿠오카 항공 검색 페이지로 바로 이동할 수 있어요.",
      keywords: Array.from(
        new Set([
          ...flightDeals.map((deal) => deal.city),
          "편도 기준",
          "실시간 최저가",
        ]),
      ).slice(0, 3),
      defaultQuery: cheapestFlight?.city || tab.defaultQuery,
    };
  });
}

export async function getHomePageData(): Promise<HomePageData> {
  const [liveFareDealsResult, liveStayCardsResult, liveTourCardsResult] =
    await Promise.allSettled([
      getLiveFlightDeals(),
      getLiveStayCards(),
      getLiveTourCards(),
    ]);

  const liveFareDeals =
    liveFareDealsResult.status === "fulfilled" ? liveFareDealsResult.value : null;
  const liveStayCards =
    liveStayCardsResult.status === "fulfilled" ? liveStayCardsResult.value : [];
  const liveTourCards =
    liveTourCardsResult.status === "fulfilled" ? liveTourCardsResult.value : [];

  const flightDeals = await mergeFlightDeals(liveFareDeals);
  const stayCards = mergeProductCards(liveStayCards, homeMockData.stayCards);
  const tourCards = mergeProductCards(liveTourCards, homeMockData.tourCards);
  const searchTabs = buildSearchTabs(stayCards, tourCards, flightDeals);

  return {
    ...homeMockData,
    budgetPresets: BUDGET_PRESETS,
    flightDeals,
    stayCards,
    tourCards,
    searchTabs,
  };
}
