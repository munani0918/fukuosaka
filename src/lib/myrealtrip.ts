/**
 * 마이리얼트립 서버 전용 유틸리티
 *
 * ⚠️  이 파일은 서버 컴포넌트 / Route Handler에서만 import하세요.
 *     'use client' 파일에서 import하면 API 키가 브라우저 번들에 포함됩니다.
 */

// ─────────────────────────────────────────────
// 공통 상수
// ─────────────────────────────────────────────

export const MYREALTRIP_API_BASE = "https://partner-ext-api.myrealtrip.com";
export const MYLINK_API_PATH = "/v1/mylink";

// ─────────────────────────────────────────────
// 방식 1 — API 방식 (서버 Route Handler 전용)
//
// 사용처: app/api/myrealtrip/mylink/route.ts
//
// 특징:
//   - Bearer 토큰 인증으로 마이링크 URL을 서버에서 동적 생성
//   - MYREALTRIP_API_KEY 필요
//   - mylink_id는 body에 넣지 않는다 (API가 서버 측에서 계정 매핑)
// ─────────────────────────────────────────────

export interface MylinkApiRequest {
  targetUrl: string;
}

export interface MylinkApiSuccess {
  ok: true;
  status: number;
  mylinkUrl: string;
}

export interface MylinkApiError {
  ok: false;
  status: number;
  message: string;
}

export type MylinkApiResult = MylinkApiSuccess | MylinkApiError;

/**
 * 마이리얼트립 파트너 API를 호출해 마이링크 URL을 생성한다.
 *
 * @param targetUrl - 추적을 붙일 마이리얼트립 상품 URL
 * @returns MylinkApiResult
 */
export async function createMylinkViaApi(
  targetUrl: string,
): Promise<MylinkApiResult> {
  const apiKey = process.env.MYREALTRIP_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "MYREALTRIP_API_KEY 환경 변수가 설정되어 있지 않습니다.",
    };
  }

  const url = `${MYREALTRIP_API_BASE}${MYLINK_API_PATH}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ targetUrl } satisfies MylinkApiRequest),
      signal: AbortSignal.timeout(8_000),
    });

    if (response.ok) {
      // TODO: 실제 응답 스키마 확인 후 필드명 조정
      //       마이리얼트립 파트너 API 문서에서 응답 body 구조를 확인하세요.
      //       예상 응답: { url: "https://..." } 또는 { mylink_url: "..." }
      const data = (await response.json()) as Record<string, unknown>;
      const mylinkUrl =
        (data.url as string | undefined) ??
        (data.mylink_url as string | undefined) ??
        "";

      return { ok: true, status: response.status, mylinkUrl };
    }

    // 4xx / 5xx — API 키 값은 절대 노출하지 않는다
    return {
      ok: false,
      status: response.status,
      message: `마이리얼트립 API가 ${response.status} 상태를 반환했습니다.`,
    };
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      status: 503,
      message: isTimeout
        ? "마이리얼트립 API 연결 시간이 초과되었습니다. (8초)"
        : "마이리얼트립 API에 연결할 수 없습니다.",
    };
  }
}

// ─────────────────────────────────────────────
// 방식 2 — URL 파라미터 방식 (서버 컴포넌트에서도 사용 가능)
//
// 특징:
//   - API 호출 없이 서버에서 URL을 조립만 한다
//   - MYREALTRIP_MYLINK_ID 필요
//   - mylink_id가 없으면 원본 targetUrl을 그대로 반환 (graceful fallback)
// ─────────────────────────────────────────────

export interface BuildMylinkUrlOptions {
  /** 마이리얼트립 상품 URL (예: https://www.myrealtrip.com/offers/123) */
  targetUrl: string;
  /**
   * utm_content 값. 어느 숙소·버튼에서 나온 링크인지 식별할 때 사용한다.
   * 예: "OSA001-agoda", "family-page", "top-button"
   */
  utmContent?: string;
}

export interface BuildMylinkUrlResult {
  /** 최종 URL (mylink_id 있으면 파라미터 포함, 없으면 원본 URL) */
  url: string;
  /** MYREALTRIP_MYLINK_ID 환경 변수가 있었는지 여부 */
  hasMylink: boolean;
}

/**
 * URL 파라미터 방식으로 마이링크 추적 URL을 조립한다.
 *
 * 사용 예:
 * ```ts
 * // Server Component 또는 Route Handler 안에서
 * const { url } = buildMylinkUrl({
 *   targetUrl: "https://www.myrealtrip.com/offers/123",
 *   utmContent: "OSA001-top-button",
 * });
 * ```
 */
export function buildMylinkUrl({
  targetUrl,
  utmContent = "test",
}: BuildMylinkUrlOptions): BuildMylinkUrlResult {
  const mylinkId = process.env.MYREALTRIP_MYLINK_ID;

  if (!mylinkId) {
    return { url: targetUrl, hasMylink: false };
  }

  const parsed = new URL(targetUrl);
  parsed.searchParams.set("mylink_id", mylinkId);
  parsed.searchParams.set("utm_content", utmContent);

  return { url: parsed.toString(), hasMylink: true };
}
