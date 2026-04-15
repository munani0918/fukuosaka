import { NextRequest, NextResponse } from "next/server";
import {
  buildMylinkUrl,
  createMylinkViaApi,
} from "@/src/lib/myrealtrip";

// ─────────────────────────────────────────────
// POST /api/myrealtrip/mylink
//
// 방식 1 (API) + 방식 2 (URL 파라미터) 연결 테스트
//
// Request body:
//   { targetUrl: string }
//
// Response:
//   {
//     api:   MylinkApiResult,          // 방식 1 결과
//     param: BuildMylinkUrlResult,     // 방식 2 결과
//   }
// ─────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 요청 파싱 ──────────────────────────────
  let targetUrl: string;

  try {
    const body = (await request.json()) as unknown;

    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as Record<string, unknown>).targetUrl !== "string"
    ) {
      return NextResponse.json(
        { ok: false, message: "body에 targetUrl(string)이 필요합니다." },
        { status: 400 },
      );
    }

    targetUrl = (body as { targetUrl: string }).targetUrl;
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 body를 JSON으로 파싱할 수 없습니다." },
      { status: 400 },
    );
  }

  // ── 방식 1: API 호출 ───────────────────────
  const apiResult = await createMylinkViaApi(targetUrl);

  // ── 방식 2: URL 파라미터 조립 ──────────────
  const paramResult = buildMylinkUrl({
    targetUrl,
    utmContent: "test",
  });

  // ── 응답 ───────────────────────────────────
  // API 방식이 성공하든 실패하든 두 결과를 모두 반환한다.
  // (연결 테스트 목적이므로 두 방식 비교가 필요)
  const httpStatus = apiResult.ok ? 200 : apiResult.status;

  return NextResponse.json(
    {
      api: apiResult,   // 방식 1 결과 (API 키 값 절대 포함 안 됨)
      param: paramResult, // 방식 2 결과
    },
    { status: httpStatus },
  );
}
