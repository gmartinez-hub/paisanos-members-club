import { createHmac, timingSafeEqual } from "node:crypto";

const LUMA_BASE_URL = "https://public-api.luma.com/v1";

export type LumaGuestSnapshot = {
  approvalStatus: string | null;
  checkedInAt: string | null;
  email: string | null;
  fullName: string | null;
  guestId: string;
  raw: Record<string, unknown>;
  registeredAt: string | null;
};

type LumaListResponse = {
  entries?: unknown[];
  event_guests?: unknown[];
  guests?: unknown[];
  has_more?: boolean;
  next_cursor?: string | null;
  pagination?: {
    has_more?: boolean;
    next_cursor?: string | null;
  };
};

export function isLumaApiConfigured() {
  return Boolean(process.env.LUMA_API_KEY);
}

export function isLumaWebhookConfigured() {
  return Boolean(process.env.LUMA_WEBHOOK_SECRET);
}

export function extractLumaEventId(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.match(/evt-[A-Za-z0-9_-]+/)?.[0] ?? "";
}

export async function getLumaGuests(eventId: string): Promise<LumaGuestSnapshot[]> {
  const guests: LumaGuestSnapshot[] = [];
  let cursor: string | null = null;

  do {
    const response: LumaListResponse = await lumaGet<LumaListResponse>("/event/get-guests", {
      event_id: eventId,
      pagination_cursor: cursor ?? undefined,
      pagination_limit: "50",
      sort_column: "registered_at",
      sort_direction: "asc",
    });

    const rows = pickRows(response);
    guests.push(...rows.map(normalizeLumaGuest).filter(isLumaGuestSnapshot));
    cursor = response.next_cursor ?? response.pagination?.next_cursor ?? null;

    if (!response.has_more && !response.pagination?.has_more) {
      cursor = null;
    }
  } while (cursor);

  return guests;
}

export function normalizeLumaGuest(value: unknown): LumaGuestSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const guest = objectValue(raw.guest) ?? raw;
  const person = objectValue(raw.person) ?? objectValue(guest.person);
  const email = stringValue(guest.email) ?? stringValue(person?.email);
  const fullName =
    stringValue(guest.name) ??
    stringValue(guest.full_name) ??
    stringValue(person?.name) ??
    stringValue(person?.full_name);
  const guestId =
    stringValue(raw.event_guest_id) ??
    stringValue(raw.guest_api_id) ??
    stringValue(raw.api_id) ??
    stringValue(raw.id) ??
    stringValue(guest.api_id) ??
    stringValue(guest.id) ??
    email;

  if (!guestId) {
    return null;
  }

  return {
    approvalStatus:
      stringValue(raw.approval_status) ??
      stringValue(raw.status) ??
      stringValue(guest.approval_status),
    checkedInAt:
      stringValue(raw.checked_in_at) ??
      stringValue(raw.check_in_at) ??
      stringValue(guest.checked_in_at),
    email: email?.toLowerCase() ?? null,
    fullName: fullName ?? null,
    guestId,
    raw,
    registeredAt:
      stringValue(raw.registered_at) ??
      stringValue(raw.created_at) ??
      stringValue(guest.registered_at),
  };
}

export function verifyLumaWebhookSignature(signatureHeader: string, body: string) {
  const secret = process.env.LUMA_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((part) => part.split("="))
      .filter((part): part is [string, string] => part.length === 2),
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(signature, "hex");
    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

async function lumaGet<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const apiKey = process.env.LUMA_API_KEY;

  if (!apiKey) {
    throw new Error("LUMA_API_KEY no esta configurada.");
  }

  const url = new URL(`${LUMA_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    headers: {
      "x-luma-api-key": apiKey,
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Luma respondio ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

function pickRows(response: LumaListResponse): unknown[] {
  return response.entries ?? response.guests ?? response.event_guests ?? [];
}

function isLumaGuestSnapshot(value: LumaGuestSnapshot | null): value is LumaGuestSnapshot {
  return Boolean(value);
}

function objectValue(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
