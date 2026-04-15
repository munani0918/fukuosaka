import { NextResponse } from "next/server";

// ─────────────────────────────────────────────
// 마이리얼트립 API 연결 테스트 엔드포인트
//
// 용도: API 키 유효성 및 서버 연결 여부만 확인한다.
//       실제 예약·조회 기능은 여기에 구현하지 않는다.
//
// 호출: GET /api/myrealtrip/health
// ─────────────────────────────────────────────

// TODO: 마이리얼트립 파트너 API 문서(docs.myrealtrip.com)에서
//       실제 base URL과 헬스체크·인증 확인 엔드포인트를 확인 후
//       아래 두 상수를 교체하세요.
const MYREALTRIP_BASE_URL = "https://api.myrealtrip.com"; // TODO: 실제 base URL로 교체
const HEALTH_ENDPOINT = "/v1/health";                      // TODO: 실제 엔드포인트로 교체

export async function GET(): Promise<NextResponse> {
  // 1. 서버 환경 변수에서 API 키 로드 (브라우저로 절대 노출되지 않음)
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

  const url = `${MYREALTRIP_BASE_URL}${HEALTH_ENDPOINT}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // TODO: 마이리얼트립 파트너 API 인증 방식에 맞게 헤더를 조정하세요.
        //       Bearer 토큰 방식이 아닌 경우 아래를 수정합니다.
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      // 연결 테스트용이므로 짧은 타임아웃 설정
      signal: AbortSignal.timeout(5_000),
    });

    if (response.ok) {
      return NextResponse.json(
        { ok: true, status: response.status },
        { status: 200 },
      );
    }

    // API 키 값은 절대 응답에 포함하지 않는다
    return NextResponse.json(
      {
        ok: false,
        status: response.status,
        message: `마이리얼트립 API가 ${response.status} 상태를 반환했습니다.`,
      },
      { status: response.status },
    );
  } catch (err: unknown) {
    // 네트워크 오류 또는 타임아웃 — API 키 절대 노출 금지
    const isTimeout =
      err instanceof Error && err.name === "TimeoutError";

    return NextResponse.json(
      {
        ok: false,
        status: 503,
        message: isTimeout
          ? "마이리얼트립 API 연결 시간이 초과되었습니다. (5초)"
          : "마이리얼트립 API에 연결할 수 없습니다.",
      },
      { status: 503 },
    );
  }
}
