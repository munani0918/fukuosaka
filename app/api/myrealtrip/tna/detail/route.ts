import { NextRequest, NextResponse } from "next/server";
import { fetchTnaProductDetailViaApi } from "@/src/lib/myrealtrip";
import {
  optionsResponse,
  readJsonBody,
  requiredString,
  tnaJson,
  TNA_CORS_HEADERS,
} from "@/app/api/myrealtrip/tna/_utils";

export async function POST(request: NextRequest) {
  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const gid = requiredString(parsed.body, "gid");
  if (!gid) {
    return NextResponse.json(
      { ok: false, message: "gid(string) is required." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  return tnaJson(await fetchTnaProductDetailViaApi({ gid }));
}

export function OPTIONS() {
  return optionsResponse();
}
