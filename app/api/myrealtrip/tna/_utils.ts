import { NextRequest, NextResponse } from "next/server";

type ApiResult<T> =
  | {
      ok: true;
      status: number;
      data: T;
      meta?: unknown;
      result?: unknown;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export const TNA_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function optionsResponse() {
  return new NextResponse(null, { headers: TNA_CORS_HEADERS });
}

export async function readJsonBody(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return {
        ok: false as const,
        response: NextResponse.json(
          { ok: false, message: "Request body must be a JSON object." },
          { status: 400, headers: TNA_CORS_HEADERS },
        ),
      };
    }

    return { ok: true as const, body: body as Record<string, unknown> };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "Request body must be valid JSON." },
        { status: 400, headers: TNA_CORS_HEADERS },
      ),
    };
  }
}

export function requiredString(
  body: Record<string, unknown>,
  key: string,
): string | null {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function tnaJson<T>(result: ApiResult<T>) {
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.status, headers: TNA_CORS_HEADERS },
    );
  }

  return NextResponse.json(
    {
      data: result.data,
      meta: result.meta,
      result: result.result,
    },
    { status: result.status, headers: TNA_CORS_HEADERS },
  );
}
