import { NextRequest, NextResponse } from "next/server";
import {
  searchTnaProductsViaApi,
  type TnaSearchRequest,
  type TnaSort,
} from "@/src/lib/myrealtrip";
import {
  optionsResponse,
  readJsonBody,
  requiredString,
  tnaJson,
  TNA_CORS_HEADERS,
} from "@/app/api/myrealtrip/tna/_utils";

const SORT_VALUES = new Set<TnaSort>([
  "price_asc",
  "price_desc",
  "review_score_desc",
  "selling_count_desc",
]);

function optionalNumber(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: NextRequest) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const keyword = requiredString(parsed.body, "keyword");
  if (!keyword) {
    return NextResponse.json(
      { ok: false, message: "keyword(string) is required." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  const minPrice = optionalNumber(parsed.body, "minPrice");
  const maxPrice = optionalNumber(parsed.body, "maxPrice");
  const page = optionalNumber(parsed.body, "page");
  const perPage = optionalNumber(parsed.body, "perPage");

  if ([minPrice, maxPrice, page, perPage].includes(null)) {
    return NextResponse.json(
      { ok: false, message: "Numeric fields must be valid numbers." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  const sort = requiredString(parsed.body, "sort");
  if (sort && !SORT_VALUES.has(sort as TnaSort)) {
    return NextResponse.json(
      { ok: false, message: "sort has an unsupported value." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  const body: TnaSearchRequest = {
    keyword,
    city: requiredString(parsed.body, "city") ?? undefined,
    category: requiredString(parsed.body, "category") ?? undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
    sort: sort ? (sort as TnaSort) : undefined,
    page: page ?? undefined,
    perPage: perPage ?? undefined,
  };

  return tnaJson(await searchTnaProductsViaApi(body));
}

export function OPTIONS() {
  return optionsResponse();
}
