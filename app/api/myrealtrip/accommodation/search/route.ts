import { NextResponse } from "next/server";
import { MYREALTRIP_API_BASE } from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// 마이리얼트립 숙소 검색 조건별 비교 테스트
//
// A: 넓은 조건 (keyword + 날짜 + 기본값)
// B: stayPoi 추가
// C: 관리자페이지 예제 전체 필터
//
// 호출: GET /api/myrealtrip/accommodation/search
// ─────────────────────────────────────────────

const SEARCH_ENDPOINT = "/v1/products/accommodation/search";

// ── 공통 파라미터 ──────────────────────────────
const COMMON = {
  keyword:    "서울",
  regionId:   6139291,
  checkIn:    "2026-06-15",
  checkOut:   "2026-06-17",
  adultCount: 2,
  childCount:  0,
  isDomestic: "true",
  page:       0,
  size:       20,
} as const;

// ── 테스트 케이스 정의 ─────────────────────────
const TEST_CASES = [
  {
    name: "A_wide",
    body: { ...COMMON },
  },
  {
    name: "B_with_stayPoi",
    body: { ...COMMON, stayPoi: 14048 },
  },
  {
    name: "C_full_filters",
    body: {
      ...COMMON,
      stayPoi:    14048,
      starRating: "fourstar",
      order:      "price_asc",
      minPrice:   50000,
      maxPrice:   300000,
    },
  },
] as const;

type TestCaseName = (typeof TEST_CASES)[number]["name"];

// ── 단일 케이스 실행 ───────────────────────────
async function runTestCase(
  name: TestCaseName,
  body: Record<string, unknown>,
  apiKey: string,
): Promise<{ name: TestCaseName; count: number; firstItem: unknown; error?: string }> {
  try {
    const response = await fetch(`${MYREALTRIP_API_BASE}${SEARCH_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,  // API 키는 헤더에만 사용
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    let rawBody: unknown;
    try { rawBody = await response.json(); } catch { rawBody = null; }

    if (!response.ok) {
      return {
        name,
        count: 0,
        firstItem: null,
        error: `HTTP ${response.status}`,
      };
    }

    const data = rawBody as Record<string, unknown>;

    // items 추출 — 가능한 경로 순서대로 시도
    const items: unknown[] = Array.isArray(data.items)    ? data.items
      : Array.isArray(data.result)   ? data.result
      : Array.isArray(data.products) ? data.products
      : Array.isArray(data.data)     ? data.data
      : [];

    return {
      name,
      count:     items.length,
      firstItem: items.length > 0 ? items[0] : null,
    };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      name,
      count: 0,
      firstItem: null,
      error: isTimeout ? "연결 시간 초과 (10초)" : "네트워크 연결 실패",
    };
  }
}

export async function GET(): Promise<NextResponse> {
  // API 키 로드 (절대 응답에 포함하지 않는다)
  const apiKey = process.env.MYREALTRIP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "MYREALTRIP_API_KEY 환경 변수가 설정되어 있지 않습니다.",
      },
      { status: 500 },
    );
  }

  // 3개 케이스 병렬 실행
  const results = await Promise.all(
    TEST_CASES.map((tc) =>
      runTestCase(tc.name, tc.body as Record<string, unknown>, apiKey),
    ),
  );

  return NextResponse.json(
    { ok: true, tests: results },
    { status: 200 },
  );
}
