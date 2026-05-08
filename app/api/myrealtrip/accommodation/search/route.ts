import { NextRequest, NextResponse } from "next/server";
import {
  type AccommodationOrder,
  type AccommodationSearchRequest,
  type AccommodationStarRating,
  searchAccommodationsSmart,
} from "@/src/lib/myrealtrip";

function toInteger(value: string | null) {
  if (!value) return undefined;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toBoolean(value: string | null) {
  if (!value) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function fromSearchParams(params: URLSearchParams): AccommodationSearchRequest | null {
  const keyword = params.get("keyword");
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  const adultCount = toInteger(params.get("adultCount"));

  if (!keyword || !checkIn || !checkOut || adultCount === undefined) {
    return null;
  }

  return {
    keyword,
    checkIn,
    checkOut,
    adultCount,
    regionId: toInteger(params.get("regionId")),
    childCount: toInteger(params.get("childCount")),
    isDomestic: toBoolean(params.get("isDomestic")),
    starRating: (params.get("starRating") as AccommodationStarRating | null) ?? undefined,
    stayPoi: toInteger(params.get("stayPoi")),
    order: (params.get("order") as AccommodationOrder | null) ?? undefined,
    minPrice: toInteger(params.get("minPrice")),
    maxPrice: toInteger(params.get("maxPrice")),
    page: toInteger(params.get("page")),
    size: toInteger(params.get("size")),
  };
}

function toResponse(result: Awaited<ReturnType<typeof searchAccommodationsSmart>>) {
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      items: result.items,
      page: result.page,
      size: result.size,
      totalCount: result.totalCount,
    },
    meta: {
      totalCount: result.totalCount,
    },
    result: {
      status: result.status,
      message: "SUCCESS",
      code: "success",
    },
  });
}

export async function GET(request: NextRequest) {
  const payload = fromSearchParams(request.nextUrl.searchParams);

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        message: "keyword, checkIn, checkOut, adultCount are required.",
      },
      { status: 400 },
    );
  }

  const result = await searchAccommodationsSmart(payload);
  return toResponse(result);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AccommodationSearchRequest;

    if (!body.keyword || !body.checkIn || !body.checkOut || !body.adultCount) {
      return NextResponse.json(
        {
          ok: false,
          message: "keyword, checkIn, checkOut, adultCount are required.",
        },
        { status: 400 },
      );
    }

    const result = await searchAccommodationsSmart(body);
    return toResponse(result);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Request body must be valid JSON.",
      },
      { status: 400 },
    );
  }
}
