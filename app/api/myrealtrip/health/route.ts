import { NextResponse } from "next/server";
import { MYREALTRIP_API_BASE } from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// 마이리얼트립 서버 헬스체크
//
// 공식 기준: GET https://partner-ext-api.myrealtrip.com/health
// API 키 불필요 — 서버 가동 여부만 확인한다.
//
// 호출: GET /api/myrealtrip/health
// ─────────────────────────────────────────────

const HEALTH_ENDPOINT = "/health";

// 마이리얼트립 /health 응답 예: { "status": "UP" }
interface HealthResponse {
  status?: string;
  [key: string]: unknown;
}

export async function GET(): Promise<NextResponse> {
  const url = `${MYREALTRIP_API_BASE}${HEALTH_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });

    let body: HealthResponse = {};
    try {
      body = (await response.json()) as HealthResponse;
    } catch {
      // 응답 body가 JSON이 아니어도 HTTP 상태로만 판단
    }

    const isUp = response.ok && body.status === "UP";

    if (isUp) {
      return NextResponse.json(
        { ok: true, status: body.status ?? "UP" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        status: body.status ?? response.status,
        message: `마이리얼트립 서버가 비정상 상태입니다. (HTTP ${response.status})`,
      },
      { status: response.status },
    );
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        message: isTimeout
          ? "마이리얼트립 서버 연결 시간이 초과되었습니다. (5초)"
          : "마이리얼트립 서버에 연결할 수 없습니다.",
      },
      { status: 503 },
    );
  }
}
