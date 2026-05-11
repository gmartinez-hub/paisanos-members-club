import { createAdminClient } from "@/lib/supabase/admin";
import { getLumaGuests, normalizeLumaGuest, type LumaGuestSnapshot } from "@/lib/luma";

type SyncResult = {
  matched: number;
  total: number;
};

export async function syncLumaGuestsForEvent(eventId: string): Promise<SyncResult> {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY para sincronizar Luma.");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id,luma_event_id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!event?.luma_event_id) {
    throw new Error("Este evento no tiene luma_event_id.");
  }

  const guests = await getLumaGuests(event.luma_event_id as string);
  const result = await upsertLumaGuestSnapshots(event.id as string, event.luma_event_id as string, guests);

  await supabase
    .from("events")
    .update({
      luma_last_synced_at: new Date().toISOString(),
      luma_sync_error: null,
      sync_status: "synced",
    })
    .eq("id", eventId);

  return result;
}

export async function upsertLumaGuestSnapshots(
  eventId: string,
  lumaEventId: string,
  guests: LumaGuestSnapshot[],
): Promise<SyncResult> {
  const supabase = createAdminClient();

  if (!supabase) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY para escribir snapshots de Luma.");
  }

  const emails = guests.map((guest) => guest.email).filter(Boolean) as string[];
  const { data: profiles } = emails.length
    ? await supabase.from("profiles").select("user_id,email").in("email", emails)
    : { data: [] };
  const memberByEmail = new Map(
    (profiles ?? []).map((profile) => [String(profile.email).toLowerCase(), profile.user_id as string]),
  );

  const rows = guests.map((guest) => ({
    approval_status: guest.approvalStatus,
    checked_in_at: guest.checkedInAt,
    email: guest.email,
    event_id: eventId,
    full_name: guest.fullName,
    luma_event_id: lumaEventId,
    luma_guest_id: guest.guestId,
    matched_user_id: guest.email ? memberByEmail.get(guest.email) ?? null : null,
    raw: guest.raw,
    registered_at: guest.registeredAt,
  }));

  if (rows.length) {
    const { error } = await supabase
      .from("luma_guest_snapshots")
      .upsert(rows, { onConflict: "luma_event_id,luma_guest_id" });

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    matched: rows.filter((row) => row.matched_user_id).length,
    total: rows.length,
  };
}

export async function upsertLumaGuestFromWebhook(eventId: string, lumaEventId: string, payload: unknown) {
  const guest = normalizeLumaGuest(payload);

  if (!guest) {
    return { matched: 0, total: 0 };
  }

  return upsertLumaGuestSnapshots(eventId, lumaEventId, [guest]);
}
