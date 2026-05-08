import { NextRequest, NextResponse } from "next/server";
import { searchTnaCategoriesViaApi } from "@/src/lib/myrealtrip";
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

  const city = requiredString(parsed.body, "city");
  if (!city) {
    return NextResponse.json(
      { ok: false, message: "city(string) is required." },
      { status: 400, headers: TNA_CORS_HEADERS },
    );
  }

  return tnaJson(await searchTnaCategoriesViaApi({ city }));
}

export function OPTIONS() {
  return optionsResponse();
}
