import { NextRequest, NextResponse } from "next/server";
import { buildMylinkUrl, createMylinkViaApi } from "@/src/lib/myrealtrip";

type RequestBody = {
  targetUrl: string;
  utmContent?: string;
  openInApp?: boolean;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RequestBody;

  try {
    const parsed = (await request.json()) as unknown;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).targetUrl !== "string"
    ) {
      return NextResponse.json(
        { ok: false, message: "targetUrl(string) is required." },
        { status: 400 },
      );
    }

    body = parsed as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const apiResult = await createMylinkViaApi(body.targetUrl, {
    utmContent: body.utmContent ?? "myrealtrip_link",
    openInApp: body.openInApp ?? false,
  });
  const paramResult = buildMylinkUrl({
    targetUrl: body.targetUrl,
    utmContent: body.utmContent ?? "myrealtrip_link",
    openInApp: body.openInApp ?? false,
  });

  return NextResponse.json({
    api: apiResult,
    param: paramResult,
    preferredUrl: apiResult.ok ? apiResult.mylinkUrl : paramResult.url,
  });
}
