import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearSessionCookie(response);
  return response;
}
