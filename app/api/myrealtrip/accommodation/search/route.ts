import { NextResponse } from "next/server";
import { MYREALTRIP_API_BASE } from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// 마이리얼트립 숙소 검색 API 테스트 라우트
//
// 관리자페이지 예제와 동일한 body로 1회 테스트용.
// 호출: GET /api/myrealtrip/accommodation/search
// ─────────────────────────────────────────────

const SEARCH_ENDPOINT = "/v1/products/accommodation/search";

// ── 관리자페이지 예제 그대로 고정 ───────────────
// isDomestic: 문서 예제처럼 문자열 "true" 로 전송
const SEARCH_BODY = {
  keyword:    "서울",
  regionId:   6139291,
  checkIn:    "2026-04-15",
  checkOut:   "2026-04-17",
  adultCount: 2,
  childCount:  0,
  isDomestic: "true",   // boolean 아닌 문자열 "true" — 문서 예제 기준
  starRating: "fourstar",
  stayPoi:    14048,
  order:      "price_asc",
  minPrice:   50000,
  maxPrice:   300000,
  page:       0,
  size:       20,
} as const;

// ── 마이리얼트립 API 응답 내 개별 아이템 (추정 스키마) ──
// TODO: 실제 응답 필드명을 파트너 API 문서에서 확인 후 조정하세요.
interface RawAccommodationItem {
  itemName?:    string;
  name?:        string;
  salePrice?:   number;
  price?:       number;
  reviewScore?: number;
  score?:       number;
  [key: string]: unknown;
}

// ── 성공 시 반환할 요약 아이템 ──────────────────
interface SummaryItem {
  itemName:    string | null;
  salePrice:   number | null;
  reviewScore: number | null;
}

function toSummaryItem(raw: RawAccommodationItem): SummaryItem {
  return {
    itemName:    raw.itemName  ?? raw.name  ?? null,
    salePrice:   raw.salePrice ?? raw.price ?? null,
    reviewScore: raw.reviewScore ?? raw.score ?? null,
  };
}

export async function GET(): Promise<NextResponse> {
  // 1. API 키 로드 (서버 전용 — 절대 응답·로그에 포함하지 않는다)
  const apiKey = process.env.MYREALTRIP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        message: "MYREALTRIP_API_KEY 환경 변수가 설정되어 있지 않습니다.",
        detail: null,
      },
      { status: 500 },
    );
  }

  // 2. 마이리얼트립 파트너 API에 POST 요청
  let response: Response;
  try {
    response = await fetch(`${MYREALTRIP_API_BASE}${SEARCH_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,  // API 키는 헤더에만 사용
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(SEARCH_BODY),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        message: isTimeout
          ? "마이리얼트립 API 연결 시간이 초과되었습니다. (10초)"
          : "마이리얼트립 API에 연결할 수 없습니다.",
        detail: null,
      },
      { status: 503 },
    );
  }

  // 3. 응답 파싱
  let rawBody: unknown;
  try {
    rawBody = await response.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        status: response.status,
        message: "마이리얼트립 API 응답을 JSON으로 파싱할 수 없습니다.",
        detail: null,
      },
      { status: response.status },
    );
  }

  // 4. API 오류 응답 처리
  if (!response.ok) {
    const detail =
      typeof rawBody === "object" && rawBody !== null ? rawBody : null;

    return NextResponse.json(
      {
        ok: false,
        status: response.status,
        message: `마이리얼트립 API가 ${response.status} 상태를 반환했습니다.`,
        detail,
      },
      { status: response.status },
    );
  }

  // 5. 성공 응답 — itemName / salePrice / reviewScore 만 요약
  // TODO: 실제 응답 구조에 맞게 items 추출 경로를 수정하세요.
  //       예: data.items / data.result / data.products 등
  const data = rawBody as Record<string, unknown>;

  const rawItems: RawAccommodationItem[] = Array.isArray(data.items)
    ? (data.items as RawAccommodationItem[])
    : Array.isArray(data.result)
    ? (data.result as RawAccommodationItem[])
    : Array.isArray(data.products)
    ? (data.products as RawAccommodationItem[])
    : [];

  const items = rawItems.map(toSummaryItem);
  const count = items.length;

  return NextResponse.json(
    {
      ok: true,
      status: response.status,
      query: {
        keyword:    SEARCH_BODY.keyword,
        regionId:   SEARCH_BODY.regionId,
        checkIn:    SEARCH_BODY.checkIn,
        checkOut:   SEARCH_BODY.checkOut,
        adultCount: SEARCH_BODY.adultCount,
        isDomestic: SEARCH_BODY.isDomestic,
        starRating: SEARCH_BODY.starRating,
      },
      count,
      ...(count === 0 && {
        message: "검색 결과가 없습니다. keyword 또는 날짜를 바꿔 테스트하세요.",
      }),
      items,
    },
    { status: 200 },
  );
}
