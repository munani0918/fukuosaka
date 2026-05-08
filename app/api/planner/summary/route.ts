import { NextRequest, NextResponse } from "next/server";
import { createPlan, getPlanSummaryVerificationCases } from "@/src/lib/planner/plan";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => ({}));
  try {
    return NextResponse.json(createPlan(raw), { headers: CORS });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "INVALID_PLAN_INPUT" },
      { status: 400, headers: CORS },
    );
  }
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("verify") === "1") {
    return NextResponse.json({ cases: getPlanSummaryVerificationCases() }, { headers: CORS });
  }

  try {
    return NextResponse.json(
      createPlan(Object.fromEntries(request.nextUrl.searchParams.entries())),
      { headers: CORS },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "INVALID_PLAN_INPUT" },
      { status: 400, headers: CORS },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}
