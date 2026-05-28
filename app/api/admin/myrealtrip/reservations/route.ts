import { NextRequest } from "next/server";
import {
  fetchMyRealTripPartnerJson,
  partnerFailure,
  partnerSuccess,
  requireAdminApiToken,
  validateReservationsQuery,
} from "@/src/lib/myrealtripPartner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdminApiToken(request);
  if (!auth.ok) return auth.response;

  const query = validateReservationsQuery(request.nextUrl.searchParams);
  if (!query.ok) return query.response;

  const result = await fetchMyRealTripPartnerJson(
    "/v1/reservations",
    query.params,
  );
  if (!result.ok) return partnerFailure(result);

  return partnerSuccess("reservations", result.data);
}
