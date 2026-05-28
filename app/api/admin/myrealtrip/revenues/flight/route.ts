import { NextRequest } from "next/server";
import {
  fetchMyRealTripPartnerJson,
  partnerFailure,
  partnerSuccess,
  requireAdminApiToken,
  validateRevenueQuery,
} from "@/src/lib/myrealtripPartner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdminApiToken(request);
  if (!auth.ok) return auth.response;

  const query = validateRevenueQuery(request.nextUrl.searchParams, [
    "SETTLEMENT",
    "PAYMENT",
  ]);
  if (!query.ok) return query.response;

  const result = await fetchMyRealTripPartnerJson(
    "/v1/revenues/flight",
    query.params,
  );
  if (!result.ok) return partnerFailure(result);

  return partnerSuccess("revenues/flight", result.data);
}
