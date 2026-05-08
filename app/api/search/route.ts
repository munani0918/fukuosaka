import { NextRequest, NextResponse } from "next/server";
import {
  searchAccommodationsSmart,
  searchTnaProductsViaApi,
  type TnaSearchItem,
  type TnaSort,
} from "@/src/lib/myrealtrip";

const MRT_MCP_URL = "https://mcp-servers.myrealtrip.com/mcp";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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

interface FlightItem {
  airline?: { name?: string; code?: string; logoUrl?: string };
  legs?: Array<{
    legIndex?: number;
    isDirect?: boolean;
    durationMinutes?: number;
    departDate?: string;
    departTime?: string;
    arriveDate?: string;
    arriveTime?: string;
    segments?: Array<{
      departure?: { cityCode?: string };
      arrival?: { cityCode?: string };
    }>;
  }>;
  price?: { total?: number };
  isCheapest?: boolean;
  reservationUrl?: string;
}

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
  });

  const json = (await response.json()) as {
    result?: { content?: Array<{ text?: string }> };
  };
  const text = json.result?.content?.[0]?.text;
  return text ? (JSON.parse(text) as Record<string, unknown>) : null;
}

function findListViewItems(node: WidgetNode, out: WidgetNode[] = []): WidgetNode[] {
  if (!node) return out;
  if (node.type === "ListViewItem") {
    out.push(node);
    return out;
  }

  node.children?.forEach((child) => findListViewItems(child, out));
  return out;
}

function extractFromItem(item: WidgetNode) {
  let name = "";
  let img = "";
  let rating = "";
  let reviewCount = "";
  let price = "";
  let bookUrl = "";

  function walk(node: WidgetNode) {
    if (!node) return;
    if (node.type === "Image" && node.src && !img) img = node.src;
    if (node.type === "Text" && node.weight === "bold" && !name) {
      name = String(node.value ?? "");
    }

    if (node.type === "Text" && !price) {
      const value = String(node.value ?? "");
      if (/[₩원]|만원|\/박|성인/.test(value)) {
        price = value;
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

    if (node.type === "Button" && node.onClickAction?.url) {
      bookUrl = node.onClickAction.url;
    }

    node.children?.forEach(walk);
  }

  walk(item);

  return { name, img, rating, reviewCount, price, bookUrl };
}

// Kept temporarily as a fallback parser while the TNA flow migrates from MCP to REST.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseTnas(data: Record<string, unknown> | null) {
  const widget = (data as { widget?: WidgetNode } | null)?.widget;
  if (!widget) return [];

  return findListViewItems(widget).slice(0, 8).map((item) => {
    const base = extractFromItem(item);
    let tag = "";

    function findBadge(node: WidgetNode) {
      if (node.type === "Badge" && node.label) tag = node.label;
      node.children?.forEach(findBadge);
    }

    findBadge(item);
    return { ...base, tag };
  });
}

function inferTnaCity(keyword: string) {
  const normalized = keyword.normalize("NFC").toLowerCase();
  if (
    normalized.includes("\uD6C4\uCFE0\uC624\uCE74") ||
    normalized.includes("fukuoka")
  ) {
    return "\uD6C4\uCFE0\uC624\uCE74";
  }

  return "\uC624\uC0AC\uCE74";
}

function toTnaCompatItem(item: TnaSearchItem) {
  return {
    gid: item.gid,
    name: item.itemName,
    itemName: item.itemName,
    description: item.description ?? "",
    price: item.priceDisplay,
    priceDisplay: item.priceDisplay,
    salePrice: item.salePrice,
    category: item.category ?? "",
    deepLink: item.deepLink ?? "",
    imageUrl: item.imageUrl ?? "",
    img: item.imageUrl ?? "",
    productUrl: item.productUrl,
    bookUrl: item.productUrl,
    reviewCount: item.reviewCount ?? 0,
    reviewScore: item.reviewScore ?? 0,
    rating: item.reviewScore ? String(item.reviewScore) : "",
    tags: item.tags ?? [],
  };
}

function fixReservationUrl(
  url: string,
  airCode: string,
  outDep?: string,
  outArr?: string,
  retDep?: string,
  retArr?: string,
) {
  if (!url) return url;

  const origAir = decodeURIComponent(url.match(/[?&]air=([^&]+)/)?.[1] ?? "").split(",")[0];
  const airMismatch = origAir && origAir !== airCode;
  let nextUrl = url;

  if (airCode) {
    nextUrl = nextUrl.replace(/(?<=\?|&)air=[^&]+/, `air=${airCode}%2C${airCode}`);
  }

  if (outDep && retDep) {
    nextUrl = nextUrl.replace(/(?<=\?|&)dtm=[^&]+/, `dtm=${outDep}%2C${retDep}`);
  }

  if (outArr && retArr) {
    nextUrl = nextUrl.replace(/(?<=\?|&)atm=[^&]+/, `atm=${outArr}%2C${retArr}`);
  }

  if (airMismatch) {
    nextUrl = nextUrl
      .replace(/[?&]fgtno=[^&]*/g, "")
      .replace(/[?&]itno=[^&]*/g, "")
      .replace(/[?&]sno=[^&]*/g, "");
  }

  return nextUrl;
}

function parseFlights(data: Record<string, unknown> | null, roundTrip = true) {
  const items: FlightItem[] =
    (data as { result?: { items?: FlightItem[] } } | null)?.result?.items ?? [];

  const formatTime = (value?: string) =>
    value ? `${value.substring(0, 2)}:${value.substring(2)}` : "";

  const filtered = roundTrip
    ? items.filter((item) => {
        const hasReturn = item.legs?.some((leg) => leg.legIndex === 2) || (item.legs?.length ?? 0) > 1;
        return hasReturn;
      })
    : items;

  return filtered
    .map((item) => {
    const outbound = item.legs?.find((leg) => leg.legIndex === 1) ?? item.legs?.[0];
    const inbound = item.legs?.find((leg) => leg.legIndex === 2) ?? item.legs?.[1];
    const airlineCode = item.airline?.code ?? "";

    return {
      airline: item.airline?.name ?? "",
      airlineCode,
      logoUrl: item.airline?.logoUrl ?? "",
      isDirect: outbound?.isDirect ?? true,
      isCheapest: item.isCheapest ?? false,
      price: item.price?.total ?? 0,
      reservationUrl: fixReservationUrl(
        item.reservationUrl ?? "",
        airlineCode,
        outbound?.departTime,
        outbound?.arriveTime,
        inbound?.departTime,
        inbound?.arriveTime,
      ),
      outbound: {
        date: outbound?.departDate ?? "",
        departTime: formatTime(outbound?.departTime),
        arriveTime: formatTime(outbound?.arriveTime),
        duration: outbound?.durationMinutes ?? 0,
        origin: outbound?.segments?.[0]?.departure?.cityCode ?? "",
        destination: outbound?.segments?.[0]?.arrival?.cityCode ?? "",
      },
      inbound: inbound
        ? {
            date: inbound.departDate ?? "",
            departTime: formatTime(inbound.departTime),
            arriveTime: formatTime(inbound.arriveTime),
            duration: inbound.durationMinutes ?? 0,
            origin: inbound.segments?.[0]?.departure?.cityCode ?? "",
            destination: inbound.segments?.[0]?.arrival?.cityCode ?? "",
          }
        : null,
    };
  })
    .filter((item) => item.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 30)
    .map((item, index) => ({ ...item, isCheapest: index === 0 }));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");

  try {
    if (type === "stays") {
      const keyword = params.get("keyword") ?? "오사카";
      const checkIn = params.get("checkIn") ?? "";
      const checkOut = params.get("checkOut") ?? "";
      const adultCount = Number.parseInt(params.get("adultCount") ?? "2", 10);
      const childCount = Number.parseInt(params.get("childCount") ?? "0", 10);
      const isDomestic = params.get("isDomestic") === "true";
      const page = Number.parseInt(params.get("page") ?? "0", 10);
      const size = Number.parseInt(params.get("size") ?? "8", 10);
      const hotelPriceMin = params.get("hotelPriceMin") ?? params.get("minPrice");
      const hotelPriceMax = params.get("hotelPriceMax") ?? params.get("maxPrice");

      const result = await searchAccommodationsSmart({
        keyword,
        checkIn,
        checkOut,
        adultCount,
        childCount,
        isDomestic,
        minPrice: hotelPriceMin
          ? Number.parseInt(hotelPriceMin, 10)
          : undefined,
        maxPrice: hotelPriceMax
          ? Number.parseInt(hotelPriceMax, 10)
          : undefined,
        page,
        size,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.message },
          { status: result.status, headers: CORS },
        );
      }

      return NextResponse.json(
        {
          stays: result.items,
          page: result.page,
          size: result.size,
          totalCount: result.totalCount,
        },
        { headers: CORS },
      );
    }

    if (type === "tnas") {
      const query = params.get("query") ?? params.get("keyword") ?? "\uC624\uC0AC\uCE74 \uD22C\uC5B4";
      const city = params.get("city") ?? inferTnaCity(query);
      const category = params.get("category") ?? "all";
      const sort = (params.get("sort") ?? "selling_count_desc") as TnaSort;
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      const perPage = Number.parseInt(params.get("perPage") ?? "8", 10);

      const result = await searchTnaProductsViaApi({
        keyword: query,
        city,
        category,
        sort,
        page: Number.parseInt(params.get("page") ?? "1", 10),
        perPage,
        minPrice: minPrice ? Number.parseInt(minPrice, 10) : undefined,
        maxPrice: maxPrice ? Number.parseInt(maxPrice, 10) : undefined,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.message },
          { status: result.status, headers: CORS },
        );
      }

      return NextResponse.json(
        {
          tnas: result.data.items.map(toTnaCompatItem),
          hasNextPage: result.data.hasNextPage,
          page: result.data.page,
          perPage: result.data.perPage,
          totalCount: result.data.totalCount,
        },
        { headers: CORS },
      );
    }

    if (type === "flights") {
      const origin = params.get("origin") ?? "ICN";
      const destination = params.get("destination") ?? "KIX";
      const departDate = params.get("departDate") ?? "";
      const returnDate = params.get("returnDate") ?? "";
      const requestedTripType = params.get("tripType");
      const tripType =
        requestedTripType === "OW" || !returnDate ? "ONE_WAY" : "ROUND_TRIP";
      const adult = Number.parseInt(params.get("adult") ?? "1", 10);
      const child = Number.parseInt(params.get("child") ?? "0", 10);
      const normalizedAdult = Number.isFinite(adult) && adult > 0 ? adult : 1;
      const normalizedChild = Number.isFinite(child) && child > 0 ? child : 0;
      const data = await callMrtMcp("searchInternationalFlights", {
        origin,
        destination,
        departDate,
        returnDate: tripType === "ROUND_TRIP" ? returnDate : "",
        tripType,
        adult: normalizedAdult,
        adultCount: normalizedAdult,
        adults: normalizedAdult,
        child: normalizedChild,
        childCount: normalizedChild,
        children: normalizedChild,
        infant: 0,
        infantCount: 0,
        infants: 0,
        passengers: {
          adult: normalizedAdult,
          child: normalizedChild,
          infant: 0,
        },
        maxResults: 50,
      });

      return NextResponse.json(
        { flights: parseFlights(data as Record<string, unknown>, tripType === "ROUND_TRIP") },
        { headers: CORS },
      );
    }

    return NextResponse.json(
      { error: "type parameter is required. (stays | tnas | flights)" },
      { status: 400, headers: CORS },
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500, headers: CORS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      ...CORS,
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
