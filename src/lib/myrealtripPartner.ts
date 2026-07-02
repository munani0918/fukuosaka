import { NextRequest, NextResponse } from "next/server";

export const MYREALTRIP_PARTNER_API_BASE =
  "https://partner-ext-api.myrealtrip.com";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const GENERAL_RESERVATION_MAX_DAYS = 186;
const FLIGHT_RESERVATION_MAX_DAYS = 31;
const SENSITIVE_QUERY_KEYS = new Set([
  "apiKey",
  "api_key",
  "authorization",
  "key",
  "mylink_id",
  "partnerId",
  "partner_id",
  "secret",
  "token",
]);
const PERSONAL_DATA_KEYS = new Set([
  "booker",
  "bookeremail",
  "bookername",
  "bookerphone",
  "customer",
  "customeremail",
  "customername",
  "customerphone",
  "email",
  "passenger",
  "passengers",
  "paymentinfo",
  "phone",
  "phonenumber",
  "traveler",
  "travelers",
]);
const MASKED_IDENTIFIER_KEYS = new Set([
  "flightReservationNo",
  "linkId",
  "reservationNo",
]);
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

export type QueryValidationResult =
  | { ok: true; params: URLSearchParams }
  | { ok: false; response: NextResponse };

export type PartnerFetchResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; error: string; detail?: unknown };

export function requireAdminApiToken(request: NextRequest): AdminAuthResult {
  const adminToken = process.env.ADMIN_API_TOKEN;

  if (!adminToken) {
    return {
      ok: false,
      response: jsonNoStore(
        { ok: false, error: "Admin API token is not configured." },
        { status: 500 },
      ),
    };
  }

  if (request.headers.get("authorization") !== `Bearer ${adminToken}`) {
    return {
      ok: false,
      response: jsonNoStore(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      ),
    };
  }

  return { ok: true };
}

export function validateRevenueQuery(
  params: URLSearchParams,
  allowedDateSearchTypes: readonly string[],
): QueryValidationResult {
  const startDate = params.get("startDate")?.trim() ?? "";
  const endDate = params.get("endDate")?.trim() ?? "";
  const dateSearchType = params.get("dateSearchType")?.trim() ?? "";
  const outbound = new URLSearchParams();

  const requiredError = validateRequiredDate("startDate", startDate);
  if (requiredError) return badRequest(requiredError);

  const endDateError = validateRequiredDate("endDate", endDate);
  if (endDateError) return badRequest(endDateError);

  if (!allowedDateSearchTypes.includes(dateSearchType)) {
    return badRequest(
      `dateSearchType must be one of: ${allowedDateSearchTypes.join(", ")}.`,
    );
  }

  outbound.set("startDate", startDate);
  outbound.set("endDate", endDate);
  outbound.set("dateSearchType", dateSearchType);

  return { ok: true, params: outbound };
}

export function validateReservationsQuery(
  params: URLSearchParams,
): QueryValidationResult {
  const base = validateRevenueQuery(params, [
    "RESERVATION_DATE",
    "TRIP_END_DATE",
  ]);

  if (!base.ok) return base;

  const rangeError = validateDateRange(base.params, GENERAL_RESERVATION_MAX_DAYS);
  if (rangeError) return badRequest(rangeError);

  const statuses = parseStatuses(params);
  if (!statuses.ok) return badRequest(statuses.error);

  const page = parsePositiveInt(params.get("page"), "page");
  if (!page.ok) return badRequest(page.error);

  const pageSize = parsePositiveInt(params.get("pageSize"), "pageSize");
  if (!pageSize.ok) return badRequest(pageSize.error);

  if (statuses.values.length > 0) {
    base.params.set("statuses", statuses.values.join(","));
  }

  if (page.value !== null) {
    base.params.set("page", String(page.value));
  }

  if (pageSize.value !== null) {
    base.params.set("pageSize", String(Math.min(pageSize.value, 300)));
  }

  return base;
}

export function validateFlightReservationsQuery(
  params: URLSearchParams,
): QueryValidationResult {
  const startDate = params.get("startDate")?.trim() ?? "";
  const endDate = params.get("endDate")?.trim() ?? "";
  const outbound = new URLSearchParams();

  const startError = validateRequiredDate("startDate", startDate);
  if (startError) return badRequest(startError);
  const endError = validateRequiredDate("endDate", endDate);
  if (endError) return badRequest(endError);

  outbound.set("startDate", startDate);
  outbound.set("endDate", endDate);

  const rangeError = validateDateRange(outbound, FLIGHT_RESERVATION_MAX_DAYS);
  if (rangeError) return badRequest(rangeError);

  const statuses = parseAllowedStatuses(params, [
    "WAITING",
    "RESERVED",
    "IN_PAY",
    "CONFIRMED",
    "NOT_PAID_CONFIRMED",
    "CANCELLED",
  ]);
  if (!statuses.ok) return badRequest(statuses.error);
  if (statuses.values.length > 0) {
    outbound.set("statuses", statuses.values.join(","));
  }

  for (const name of ["page", "pageSize"] as const) {
    const value = parsePositiveInt(params.get(name), name);
    if (!value.ok) return badRequest(value.error);
    if (value.value !== null) outbound.set(name, String(value.value));
  }

  return { ok: true, params: outbound };
}

export function getMyRealTripConfigurationStatus() {
  return {
    partnerApiKeyConfigured: Boolean(
      process.env.MRT_PARTNER_API_KEY || process.env.MYREALTRIP_API_KEY,
    ),
    mylinkIdConfigured: Boolean(process.env.MYREALTRIP_MYLINK_ID),
  };
}

export async function fetchMyRealTripPartnerJson(
  path: string,
  params?: URLSearchParams,
  options: { includeAuth?: boolean; timeoutMs?: number } = {},
): Promise<PartnerFetchResult> {
  const includeAuth = options.includeAuth ?? true;
  const apiKey =
    process.env.MRT_PARTNER_API_KEY || process.env.MYREALTRIP_API_KEY;

  if (includeAuth && !apiKey) {
    return {
      ok: false,
      status: 500,
      error: "MyRealTrip partner API key is not configured.",
    };
  }

  const url = new URL(path, MYREALTRIP_PARTNER_API_BASE);
  params?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(includeAuth && apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => null);
    const redactedPayload = redactSensitive(payload);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `MyRealTrip partner API returned ${response.status}.`,
        detail: redactedPayload,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: redactedPayload,
    };
  } catch (error: unknown) {
    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      status: 503,
      error: isTimeout
        ? "MyRealTrip partner API timed out."
        : "Failed to reach the MyRealTrip partner API.",
    };
  }
}

export function partnerSuccess(endpoint: string, data: unknown) {
  return jsonNoStore({
    ok: true,
    source: "myrealtrip-partner",
    endpoint,
    data,
  });
}

export function partnerFailure(result: Extract<PartnerFetchResult, { ok: false }>) {
  return jsonNoStore(
    {
      ok: false,
      error: result.error,
      ...(result.detail === undefined ? {} : { detail: result.detail }),
    },
    { status: result.status },
  );
}

function badRequest(error: string): QueryValidationResult {
  return {
    ok: false,
    response: jsonNoStore({ ok: false, error }, { status: 400 }),
  };
}

function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  Object.entries(NO_STORE_HEADERS).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function validateRequiredDate(name: string, value: string) {
  if (!value) return `${name} is required.`;
  if (!DATE_RE.test(value)) return `${name} must use yyyy-MM-dd format.`;
  return "";
}

function parsePositiveInt(value: string | null, name: string) {
  if (value === null || value.trim() === "") {
    return { ok: true as const, value: null };
  }

  if (!/^\d+$/.test(value)) {
    return { ok: false as const, error: `${name} must be a positive integer.` };
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return { ok: false as const, error: `${name} must be a positive integer.` };
  }

  return { ok: true as const, value: parsed };
}

function parseStatuses(params: URLSearchParams) {
  return parseAllowedStatuses(params, [
    "TEMP",
    "WAIT_DEPOSIT",
    "PENDING_PAYMENT",
    "WAIT_CONFIRM",
    "CONFIRM",
    "REQUEST_CANCEL",
    "FINISH",
    "CANCEL",
    "FAIL",
  ]);
}

function parseAllowedStatuses(
  params: URLSearchParams,
  allowedValues: readonly string[],
) {
  const allowed = new Set(allowedValues);
  const values = params
    .getAll("statuses")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const invalid = values.find((value) => !allowed.has(value));

  if (invalid) {
    return {
      ok: false as const,
      error: `statuses contains an unsupported value: ${invalid}.`,
    };
  }

  return { ok: true as const, values };
}

function validateDateRange(params: URLSearchParams, maxDays: number) {
  const start = parseDate(params.get("startDate") ?? "");
  const end = parseDate(params.get("endDate") ?? "");
  if (!start || !end) return "Dates must be valid calendar dates.";
  if (end < start) return "endDate must be on or after startDate.";

  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (days > maxDays) return `Date range must not exceed ${maxDays} days.`;
  return "";
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function maskIdentifier(value: unknown) {
  const text = String(value ?? "");
  if (!text) return "";
  return text.length <= 4 ? "****" : `****${text.slice(-4)}`;
}

function maskMiddle(value: string) {
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
}

function redactString(value: string) {
  let output = value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer ***")
    .replace(/(api[_-]?key|token|secret)=([^&\s]+)/gi, "$1=***");

  for (const secret of [
    process.env.ADMIN_API_TOKEN,
    process.env.MRT_PARTNER_API_KEY,
    process.env.MYREALTRIP_API_KEY,
    process.env.MYREALTRIP_MYLINK_ID,
  ]) {
    if (secret && output.includes(secret)) {
      output = output.split(secret).join(maskMiddle(secret));
    }
  }

  try {
    const url = new URL(output);
    SENSITIVE_QUERY_KEYS.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, "***");
      }
    });
    output = url.toString();
  } catch {
    // Plain strings are fine; the regex-based redaction above still applies.
  }

  return output;
}

function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 6) return "[redacted-depth-limit]";
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }
  if (typeof value !== "object" || value === null) return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      const normalizedKey = key.toLowerCase();
      if (SENSITIVE_QUERY_KEYS.has(key)) return [key, "***"];
      if (
        PERSONAL_DATA_KEYS.has(normalizedKey) ||
        normalizedKey.includes("email") ||
        normalizedKey.includes("phone")
      ) {
        return [key, "***"];
      }
      if (MASKED_IDENTIFIER_KEYS.has(key)) return [key, maskIdentifier(item)];
      return [key, redactSensitive(item, depth + 1)];
    }),
  );
}
