"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractLumaEventId, isLumaApiConfigured } from "@/lib/luma";
import { syncLumaGuestsForEvent } from "@/lib/luma-sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireMember } from "@/lib/community";

type ActionResult = {
  error?: string;
  ok: boolean;
};

export async function requestMagicLink(formData: FormData): Promise<ActionResult> {
  const email = requiredString(formData, "email").toLowerCase();
  const admin = createAdminClient();

  if (!admin) {
    return {
      error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY para enviar magic links con control de acceso.",
      ok: false,
    };
  }

  const allowed = await emailCanRequestAccess(admin, email);
  if (!allowed) {
    return {
      error: "Ese email todavia no esta aprobado para entrar.",
      ok: false,
    };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/club`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      error: error.message,
      ok: false,
    };
  }

  return { ok: true };
}

export async function requestWaitlistAccess(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const email = requiredString(formData, "email").toLowerCase();
  const fullName = requiredString(formData, "full_name");
  const company = requiredString(formData, "company");
  const reason = requiredString(formData, "reason");

  if (reason.length < 10 || reason.length > 300) {
    return {
      error: "Contanos un poco mas, entre 10 y 300 caracteres.",
      ok: false,
    };
  }

  const { error } = await supabase.from("whitelist_requests").insert({
    company,
    email,
    full_name: fullName,
    reason,
    status: "pending",
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Ese email ya esta en la lista."
          : "No pudimos guardar la solicitud. Proba de nuevo.",
      ok: false,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/waitlist");

  return { ok: true };
}

export async function activateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Tu sesion expiro. Volve a entrar con magic link.",
      ok: false,
    };
  }

  const fullName = requiredString(formData, "full_name");
  const role = requiredString(formData, "role");
  const company = requiredString(formData, "company");

  const { error } = await supabase.from("profiles").insert({
    availability: stringValue(formData, "availability") || "A coordinar",
    building: stringValue(formData, "building"),
    can_help_with: requiredString(formData, "can_help_with"),
    company,
    email: user.email?.toLowerCase() ?? null,
    focus: requiredString(formData, "focus"),
    full_name: fullName,
    is_active: true,
    is_admin: false,
    last_interaction: "Paisaporte activado",
    linkedin_url: stringValue(formData, "linkedin_url") || null,
    location: stringValue(formData, "location") || "Buenos Aires",
    looking_for: listValue(formData, "looking_for"),
    open_to: requiredString(formData, "open_to"),
    qr_base_url: `/p/${user.id}`,
    role,
    skills: listValue(formData, "skills"),
    user_id: user.id,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Este usuario ya tiene Paisaporte activo."
          : "Tu email todavia no esta aprobado para activar Paisaporte.",
      ok: false,
    };
  }

  revalidatePath("/club");
  revalidatePath("/directory");
  revalidatePath("/passport");
  revalidatePath("/admin");
  revalidatePath("/admin/members");

  return { ok: true };
}

export async function rsvpToEvent(formData: FormData) {
  const eventId = requiredString(formData, "event_id");
  const { supabase, user } = await requireMember();
  const event = await getActionEvent(supabase, eventId);

  if (!event) {
    throw new Error("Evento no encontrado.");
  }

  if (event.registration_mode !== "paisanos") {
    throw new Error("Este evento gestiona registros fuera de Paisanos.");
  }

  if (!["published", "active"].includes(event.status)) {
    throw new Error("Este evento todavia no esta abierto para RSVP.");
  }

  const { data: existingRsvp } = await supabase
    .from("rsvps")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingRsvp?.status === "confirmed") {
    revalidateEventPaths(eventId);
    return;
  }

  const status = (await eventIsFull(supabase, eventId, event.max_capacity))
    ? "waitlist"
    : "confirmed";

  const { error } = await supabase.from("rsvps").upsert(
    {
      cancelled_at: null,
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      event_id: eventId,
      status,
      user_id: user.id,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidateEventPaths(eventId);
}

export async function cancelRsvp(formData: FormData) {
  const eventId = requiredString(formData, "event_id");
  const { supabase, user } = await requireMember();

  const { error } = await supabase
    .from("rsvps")
    .update({
      cancelled_at: new Date().toISOString(),
      status: "cancelled",
    })
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateEventPaths(eventId);
}

export async function checkInMember(formData: FormData) {
  const eventId = requiredString(formData, "event_id");
  const userId = requiredString(formData, "user_id");
  const { supabase } = await requireAdmin();
  const event = await getActionEvent(supabase, eventId);

  if (!event) {
    throw new Error("Evento no encontrado.");
  }

  if (event.checkin_mode === "luma") {
    throw new Error("Este evento usa check-in en Luma.");
  }

  if (!["published", "active"].includes(event.status)) {
    throw new Error("Este evento no esta abierto para check-in.");
  }

  const { data: rsvp } = await supabase
    .from("rsvps")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("status", "confirmed")
    .maybeSingle();

  if (!rsvp) {
    throw new Error("El miembro necesita RSVP confirmado para hacer check-in.");
  }

  const { error } = await supabase.from("check_ins").upsert(
    {
      checked_in_at: new Date().toISOString(),
      event_id: eventId,
      method: "scanned_by_staff",
      user_id: userId,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/check-in");
  revalidateEventPaths(eventId);
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = requiredString(formData, "title");
  const date = requiredString(formData, "date");
  const time = requiredString(formData, "time");
  const eventDate = new Date(`${date}T${time}:00-03:00`).toISOString();
  const status = formData.get("status") === "published" ? "published" : "draft";
  const source = formData.get("source") === "luma" ? "luma" : "paisanos";
  const lumaUrl = stringValue(formData, "luma_url");
  const lumaEventId = stringValue(formData, "luma_event_id") || extractLumaEventId(lumaUrl);

  if (source === "luma" && !lumaUrl && !lumaEventId) {
    throw new Error("Para un evento Luma necesitamos URL o event ID.");
  }

  const { error } = await supabase.from("events").insert({
    active_token: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
    checkin_label: source === "luma" ? "Luma" : "Punto",
    checkin_mode: source === "luma" ? "luma" : "paisanos",
    created_by: user.id,
    description: stringValue(formData, "description"),
    event_date: eventDate,
    location: stringValue(formData, "location") || "A confirmar",
    luma_event_id: lumaEventId || null,
    luma_url: lumaUrl || null,
    max_capacity: numberValue(formData, "capacity"),
    registration_mode: source === "luma" ? "luma" : "paisanos",
    speaker_name: stringValue(formData, "host") || "Paisanos",
    source,
    status,
    sync_status: source === "luma" ? "manual" : "not_configured",
    subtitle: stringValue(formData, "subtitle"),
    tags: stringValue(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    title,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/club");
  revalidatePath("/events");
}

export async function syncLumaGuests(formData: FormData) {
  const eventId = requiredString(formData, "event_id");
  await requireAdmin();

  if (!isLumaApiConfigured()) {
    throw new Error("LUMA_API_KEY no esta configurada todavia.");
  }

  try {
    await syncLumaGuestsForEvent(eventId);
  } catch (error) {
    const supabase = createAdminClient();
    if (supabase) {
      await supabase
        .from("events")
        .update({
          luma_sync_error: error instanceof Error ? error.message : "Error desconocido",
          sync_status: "error",
        })
        .eq("id", eventId);
    }
    throw error;
  }

  revalidateEventPaths(eventId);
  revalidatePath("/admin/events");
}

export async function createContribution(formData: FormData) {
  const { supabase, user } = await requireMember();
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const type = formData.get("type") === "event_proposal" ? "event_proposal" : "solution";
  const category = stringValue(formData, "category") || "Club";

  const { error } = await supabase.from("contributions").insert({
    category,
    description,
    status: "pending",
    title,
    type,
    user_id: user.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/club");
  revalidatePath("/opportunities");
  revalidatePath("/admin");
}

export async function approveWaitlistRequest(formData: FormData) {
  const requestId = requiredString(formData, "request_id");
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("whitelist_requests")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      status: "approved",
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/waitlist");
}

export async function rejectWaitlistRequest(formData: FormData) {
  const requestId = requiredString(formData, "request_id");
  const { supabase, user } = await requireAdmin();

  const { error } = await supabase
    .from("whitelist_requests")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      status: "rejected",
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/waitlist");
}

function revalidateEventPaths(eventId: string) {
  revalidatePath("/club");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/passport");
  revalidatePath("/admin");
  revalidatePath("/admin/check-in");
}

async function getActionEvent(supabase: Awaited<ReturnType<typeof createClient>>, eventId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("id,status,max_capacity,registration_mode,checkin_mode")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as
    | {
        checkin_mode: "paisanos" | "luma" | "hybrid";
        id: string;
        max_capacity: number | null;
        registration_mode: "paisanos" | "luma";
        status: "draft" | "published" | "active" | "closed";
      }
    | null;
}

async function emailCanRequestAccess(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
) {
  const [{ data: profile, error: profileError }, { data: whitelist, error: whitelistError }, { data: invite, error: inviteError }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .eq("is_active", true)
        .maybeSingle(),
      admin
        .from("whitelist_requests")
        .select("id")
        .eq("email", email)
        .eq("status", "approved")
        .maybeSingle(),
      admin
        .from("invitations")
        .select("id")
        .eq("invited_email", email)
        .eq("status", "pending")
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .maybeSingle(),
    ]);

  if (profileError || whitelistError || inviteError) {
    throw new Error(profileError?.message ?? whitelistError?.message ?? inviteError?.message);
  }

  return Boolean(profile || whitelist || invite);
}

async function eventIsFull(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  maxCapacity: number | null,
) {
  if (!maxCapacity || maxCapacity <= 0) {
    return false;
  }

  const { count, error } = await supabase
    .from("rsvps")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "confirmed");

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) >= maxCapacity;
}

function requiredString(formData: FormData, key: string) {
  const value = stringValue(formData, key);

  if (!value) {
    throw new Error(`Falta ${key}`);
  }

  return value;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function listValue(formData: FormData, key: string) {
  return stringValue(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}
