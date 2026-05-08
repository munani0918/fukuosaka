import { NextRequest, NextResponse } from "next/server";
import { fetchTnaOptionsViaApi } from "@/src/lib/myrealtrip";
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
  const selectedDate = requiredString(parsed.body, "selectedDate");
  if (!gid || !selectedDate) {
    return NextResponse.json(
      { ok: false, message: "gid and selectedDate are required strings." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  return tnaJson(await fetchTnaOptionsViaApi({ gid, selectedDate }));
}

export function OPTIONS() {
  return optionsResponse();
}
