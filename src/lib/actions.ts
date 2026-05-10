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

  const { error } = await supabase.from("events").insert({
    active_token: crypto.randomUUID().replaceAll("-", "").slice(0, 24),
    checkin_label: "Punto",
    created_by: user.id,
    description: stringValue(formData, "description"),
    event_date: eventDate,
    location: stringValue(formData, "location") || "A confirmar",
    max_capacity: numberValue(formData, "capacity"),
    speaker_name: stringValue(formData, "host") || "Paisanos",
    status,
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
