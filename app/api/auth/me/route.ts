import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { loggedIn: false, user: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    {
      loggedIn: true,
      user: {
        provider: session.provider,
        nickname: session.nickname,
        profileImage: session.profileImage,
        email: session.email,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
