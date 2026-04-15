import { NextResponse } from "next/server";
import { MYREALTRIP_API_BASE } from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// 마이리얼트립 숙소 상품 가격 조회 테스트
//
// 호출: GET /api/myrealtrip/accommodation/product
//
// 전략:
//   1단계) productId 직접 조회 시도
//          GET /v1/products/accommodation/{productId}?checkIn=...
//          → 문서에 명시적으로 없는 엔드포인트이므로 404/405 가능
//
//   2단계) 1단계 실패 시 검색 API로 fallback
//          POST /v1/products/accommodation/search (keyword = 호텔명)
//          → 결과 중 productId 일치 항목만 필터링
//          → 검색 기반이므로 매칭이 불안정할 수 있음
//
// TODO: 마이리얼트립 파트너 API 문서에서 아래를 확인하세요.
//   ① productId 직접 조회 엔드포인트 (예: /v1/products/accommodation/{id})
//   ② 개별 상품 가용성(availability) 엔드포인트
//   ③ 정확한 응답 스키마 (itemId, salePrice, currency 등 필드명)
//   확인 후 DIRECT_ENDPOINT 상수와 toProductSummary()를 업데이트하세요.
// ─────────────────────────────────────────────

// ── 테스트 고정값 ──────────────────────────────
const TEST = {
  productId:  "1101376",
  hotelName:  "스위소텔 난카이 오사카",
  checkIn:    "2026-06-28",
  checkOut:   "2026-06-29",
  adultCount: 2,
  childCount:  0,
  isDomestic: false,
} as const;

// ── 시도할 직접 조회 경로 후보 ─────────────────
// TODO: 실제 문서 확인 후 정확한 경로로 교체하세요.
const DIRECT_ENDPOINT = `/v1/products/accommodation/${TEST.productId}`;
const DIRECT_QUERY    = `?checkIn=${TEST.checkIn}&checkOut=${TEST.checkOut}&adultCount=${TEST.adultCount}&childCount=${TEST.childCount}&isDomestic=${TEST.isDomestic}`;

// ── 검색 fallback 엔드포인트 ───────────────────
const SEARCH_ENDPOINT = "/v1/products/accommodation/search";

// ── 원시 아이템 스키마 (추정) ──────────────────
// TODO: 실제 응답 필드명 확인 후 조정하세요.
interface RawItem {
  itemId?:       string | number;
  id?:           string | number;
  productId?:    string | number;
  itemName?:     string;
  name?:         string;
  salePrice?:    number;
  price?:        number;
  originalPrice?: number;
  currency?:     string;
  [key: string]: unknown;
}

interface ProductSummary {
  ok:            true;
  productId:     string;
  hotelName:     string | null;
  salePrice:     number | null;
  originalPrice: number | null;
  currency:      string;
  checkIn:       string;
  checkOut:      string;
  rawSummary:    Record<string, unknown>;
}

function toProductSummary(raw: RawItem): ProductSummary {
  return {
    ok:            true,
    productId:     TEST.productId,
    hotelName:     raw.itemName      ?? raw.name      ?? null,
    salePrice:     raw.salePrice     ?? raw.price     ?? null,
    originalPrice: raw.originalPrice                  ?? null,
    currency:      (raw.currency as string | undefined) ?? "KRW",
    checkIn:       TEST.checkIn,
    checkOut:      TEST.checkOut,
    rawSummary:    raw as Record<string, unknown>,
  };
}

// ── 공통 fetch 헬퍼 ───────────────────────────
async function fetchMrt(
  url: string,
  options: RequestInit,
): Promise<{ response: Response; body: unknown } | { error: string }> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10_000),
    });
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }
    return { response, body };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      error: isTimeout
        ? "연결 시간 초과 (10초)"
        : "네트워크 연결 실패",
    };
  }
}

export async function GET(): Promise<NextResponse> {
  // 1. API 키 로드
  const apiKey = process.env.MYREALTRIP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "MYREALTRIP_API_KEY 환경 변수가 설정되어 있지 않습니다.",
        reason:  "missing_api_key",
        nextAction: ".env.local에 MYREALTRIP_API_KEY를 추가하세요.",
      },
      { status: 500 },
    );
  }

  const authHeader = { Authorization: `Bearer ${apiKey}` };

  // ── 1단계: productId 직접 조회 시도 ──────────
  const directResult = await fetchMrt(
    `${MYREALTRIP_API_BASE}${DIRECT_ENDPOINT}${DIRECT_QUERY}`,
    { method: "GET", headers: { ...authHeader, Accept: "application/json" } },
  );

  if ("error" in directResult) {
    // 네트워크 자체 실패 → 바로 에러 반환
    return NextResponse.json(
      {
        ok: false,
        message: `직접 조회 요청 실패: ${directResult.error}`,
        reason:  "network_error",
        nextAction: "서버 연결 상태를 확인하세요.",
      },
      { status: 503 },
    );
  }

  const { response: directRes, body: directBody } = directResult;

  if (directRes.ok) {
    // 직접 조회 성공
    const raw = (
      typeof directBody === "object" && directBody !== null
        ? ((directBody as Record<string, unknown>).data ?? directBody)
        : {}
    ) as RawItem;

    return NextResponse.json(toProductSummary(raw), { status: 200 });
  }

  // ── 2단계: 직접 조회 실패 → 검색 API fallback ─
  // (404 / 405 / 501 등 — 엔드포인트 미존재 가능성 있음)
  const directFailStatus = directRes.status;

  const searchResult = await fetchMrt(
    `${MYREALTRIP_API_BASE}${SEARCH_ENDPOINT}`,
    {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        keyword:    TEST.hotelName,
        checkIn:    TEST.checkIn,
        checkOut:   TEST.checkOut,
        adultCount: TEST.adultCount,
        childCount:  TEST.childCount,
        isDomestic:  TEST.isDomestic,
        order:       "price_asc",
        size:        20,
      }),
    },
  );

  if ("error" in searchResult) {
    return NextResponse.json(
      {
        ok: false,
        message: `검색 fallback 요청 실패: ${searchResult.error}`,
        reason:  "search_fallback_network_error",
        nextAction: "서버 연결 상태를 확인하세요.",
      },
      { status: 503 },
    );
  }

  const { response: searchRes, body: searchBody } = searchResult;

  if (!searchRes.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: `직접 조회 ${directFailStatus}, 검색 fallback도 ${searchRes.status} 실패.`,
        reason:  "both_methods_failed",
        nextAction:
          "마이리얼트립 파트너 API 문서에서 productId 직접 조회 엔드포인트를 확인하세요.",
      },
      { status: searchRes.status },
    );
  }

  // 검색 결과에서 productId 일치 항목 필터링
  const data = searchBody as Record<string, unknown>;
  const rawItems: RawItem[] = Array.isArray(data.items)
    ? (data.items as RawItem[])
    : Array.isArray(data.result)
    ? (data.result as RawItem[])
    : Array.isArray(data.products)
    ? (data.products as RawItem[])
    : [];

  const matched = rawItems.find(
    (item) =>
      String(item.itemId ?? item.id ?? item.productId ?? "") === TEST.productId,
  );

  if (matched) {
    // productId 매칭 성공
    return NextResponse.json(toProductSummary(matched), { status: 200 });
  }

  // TODO: productId 직접 조회 API가 문서에 없어 검색 기반 매칭을 시도했으나
  //       검색 결과에서도 productId 일치 항목을 찾지 못했습니다.
  //       마이리얼트립 파트너 API 문서에서 아래를 확인하세요:
  //       - productId 기반 단건 조회 엔드포인트
  //       - 검색 응답 내 상품 식별자 필드명 (itemId / id / productId 등)
  return NextResponse.json(
    {
      ok: false,
      message: `직접 조회 ${directFailStatus}. 검색 결과 ${rawItems.length}건 중 productId(${TEST.productId}) 일치 없음.`,
      reason: "product_id_not_found_in_search",
      nextAction:
        "마이리얼트립 파트너 API 문서에서 productId 직접 조회 엔드포인트를 확인하거나, " +
        "검색 응답의 상품 식별자 필드명을 확인해 toProductSummary()의 id 매핑을 수정하세요.",
    },
    { status: 404 },
  );
}
