"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireMember } from "@/lib/community";

export async function rsvpToEvent(formData: FormData) {
  const eventId = requiredString(formData, "event_id");
  const { supabase, user } = await requireMember();

  const { error } = await supabase.from("rsvps").upsert(
    {
      cancelled_at: null,
      confirmed_at: new Date().toISOString(),
      event_id: eventId,
      status: "confirmed",
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
  const lumaEventId = stringValue(formData, "luma_event_id");

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

export async function createContribution(formData: FormData) {
  const { supabase, user } = await requireMember();
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const type = formData.get("type") === "event_proposal" ? "event_proposal" : "solution";
  const category = stringValue(formData, "category") || "Comunidad";

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

function numberValue(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}
