import { NextResponse } from "next/server";
import { MYREALTRIP_API_BASE } from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// 마이리얼트립 정산 내역 조회 테스트
//
// 공식 기준:
//   GET https://partner-ext-api.myrealtrip.com/v1/revenues
//       ?dateSearchType=SETTLEMENT&startDate=2025-01-01&endDate=2025-01-07
//   Authorization: Bearer MYREALTRIP_API_KEY
//
// 공통 응답 구조:
//   { data, meta: { totalCount, result: { status, message, code } } }
//
// 호출: GET /api/myrealtrip/revenues
// ─────────────────────────────────────────────

const REVENUES_ENDPOINT =
  "/v1/revenues?dateSearchType=SETTLEMENT&startDate=2025-01-01&endDate=2025-01-07";

// ── 실제 확인된 응답 스키마 ───────────────────
// {
//   data: [...],
//   meta: { totalCount: number },
//   result: { status: number, message: string, code: string }
// }
interface MrtResult {
  status:  number;
  message: string;
  code:    string;
}

interface MrtMeta {
  totalCount: number;
}

interface MrtResponse {
  data:   unknown;
  meta:   MrtMeta;
  result: MrtResult;
}

function isMrtResponse(v: unknown): v is MrtResponse {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.meta !== "object"   || obj.meta   === null) return false;
  if (typeof obj.result !== "object" || obj.result === null) return false;
  return true;
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

  // 2. 마이리얼트립 정산 API 호출
  let response: Response;
  try {
    response = await fetch(`${MYREALTRIP_API_BASE}${REVENUES_ENDPOINT}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,  // API 키는 헤더에만 사용
        Accept: "application/json",
      },
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

  // 4. HTTP 오류 처리
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

  // 5. 공식 공통 응답 구조로 파싱
  if (!isMrtResponse(rawBody)) {
    // 구조가 예상과 다르면 raw body 전체를 data로 감싸서 반환
    return NextResponse.json(
      {
        ok: true,
        status: response.status,
        message: "응답 구조가 예상과 다릅니다. raw data를 확인하세요.",
        totalCount: null,
        data: rawBody,
      },
      { status: 200 },
    );
  }

  const { data, meta, result } = rawBody;

  return NextResponse.json(
    {
      ok:         true,
      status:     result.status,
      message:    result.message,
      totalCount: meta.totalCount,
      data,
    },
    { status: 200 },
  );
}
