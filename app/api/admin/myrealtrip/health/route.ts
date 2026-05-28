import { NextRequest } from "next/server";
import {
  fetchMyRealTripPartnerJson,
  partnerFailure,
  partnerSuccess,
  requireAdminApiToken,
} from "@/src/lib/myrealtripPartner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = requireAdminApiToken(request);
  if (!auth.ok) return auth.response;

  const result = await fetchMyRealTripPartnerJson("/health", undefined, {
    includeAuth: false,
    timeoutMs: 5_000,
  });
  if (!result.ok) return partnerFailure(result);

  return partnerSuccess("health", result.data);
}
