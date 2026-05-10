import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type ProfileRow = {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  company: string;
  avatar_url: string | null;
  skills: string[];
  building: string | null;
  looking_for: string[];
  qr_base_url: string | null;
  linkedin_url: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  location: string;
  member_since: string;
  focus: string;
  can_help_with: string;
  open_to: string;
  availability: string;
  last_interaction: string | null;
};

export type EventRow = {
  id: string;
  title: string;
  subtitle: string;
  description: string | null;
  speaker_name: string | null;
  location: string | null;
  event_date: string;
  max_capacity: number | null;
  status: "draft" | "published" | "active" | "closed";
  active_token: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  tags: string[];
  checkin_label: string;
  source: "paisanos" | "luma";
  luma_url: string | null;
  luma_event_id: string | null;
  registration_mode: "paisanos" | "luma";
  checkin_mode: "paisanos" | "luma" | "hybrid";
  sync_status: "not_configured" | "manual" | "synced" | "error";
};

export type RsvpRow = {
  event_id: string;
  user_id: string;
  status: "confirmed" | "cancelled" | "waitlist";
  confirmed_at: string | null;
  cancelled_at: string | null;
};

export type CheckInRow = {
  event_id: string;
  user_id: string;
  checked_in_at: string;
};

export type MemberView = {
  id: string;
  userId: string;
  name: string;
  role: string;
  company: string;
  email?: string;
  location: string;
  memberSince: string;
  lastInteraction: string;
  attendedEvents: number;
  feedbackGiven: number;
  focus: string;
  avatar: string;
  building: string;
  lookingFor: string;
  canHelpWith: string;
  openTo: string;
  availability: string;
  skills: string[];
  interests: string[];
  qrValue: string;
};

export type EventView = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  time: string;
  point: string;
  location: string;
  status: string;
  rawStatus: EventRow["status"];
  capacity: number;
  confirmed: number;
  checkedIn: number;
  noShows: number;
  host: string;
  tags: string[];
  userRsvpStatus?: RsvpRow["status"];
  source: EventRow["source"];
  sourceLabel: string;
  lumaUrl: string | null;
  lumaEventId: string | null;
  registrationMode: EventRow["registration_mode"];
  checkinMode: EventRow["checkin_mode"];
  syncStatus: EventRow["sync_status"];
  usesLumaRegistration: boolean;
  usesLumaCheckIn: boolean;
};

export type FeedbackProcessView = {
  id: string;
  title: string;
  status: string;
  deadline: string;
  selectedMembers: number;
  responses: number;
  questions: string[];
};

export const requireMember = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return {
    email: user.email ?? "",
    profile: profile as ProfileRow,
    supabase,
    user,
  };
});

export async function requireAdmin() {
  const viewer = await requireMember();

  if (!viewer.profile.is_admin) {
    redirect("/club");
  }

  return viewer;
}

export async function getMembers(supabase: SupabaseServerClient) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const profiles = (data ?? []) as ProfileRow[];
  const stats = await getMemberStats(supabase, profiles.map((profile) => profile.user_id));

  return profiles.map((profile) => profileToMember(profile, stats[profile.user_id]));
}

export async function getEvents(
  supabase: SupabaseServerClient,
  options: { includeDrafts?: boolean; viewerId?: string } = {},
) {
  let query = supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (!options.includeDrafts) {
    query = query.in("status", ["published", "active", "closed"]);
  }

  const { data } = await query;
  const events = (data ?? []) as EventRow[];
  return enrichEvents(supabase, events, options.viewerId);
}

export async function getEventById(
  supabase: SupabaseServerClient,
  eventId: string,
  options: { viewerId?: string } = {},
) {
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const [event] = await enrichEvents(supabase, [data as EventRow], options.viewerId);
  return event;
}

export async function getEventAttendees(supabase: SupabaseServerClient, eventId: string) {
  const { data: rsvpData } = await supabase
    .from("rsvps")
    .select("event_id,user_id,status,confirmed_at,cancelled_at")
    .eq("event_id", eventId)
    .eq("status", "confirmed")
    .order("created_at", { ascending: true });

  const rsvps = (rsvpData ?? []) as RsvpRow[];
  const userIds = rsvps.map((rsvp) => rsvp.user_id);

  if (userIds.length === 0) {
    return [];
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", userIds);

  const { data: checkInData } = await supabase
    .from("check_ins")
    .select("event_id,user_id,checked_in_at")
    .eq("event_id", eventId)
    .in("user_id", userIds);

  const checkedIn = new Set((checkInData ?? []).map((row) => (row as CheckInRow).user_id));
  const stats = await getMemberStats(supabase, userIds);

  return ((profileData ?? []) as ProfileRow[]).map((profile) => ({
    checkedIn: checkedIn.has(profile.user_id),
    member: profileToMember(profile, stats[profile.user_id]),
  }));
}

export async function getFeedbackProcesses(supabase: SupabaseServerClient) {
  const { data: processes } = await supabase
    .from("feedback_processes")
    .select("id,name,questions,target_members,deadline,status")
    .order("created_at", { ascending: false });

  if (!processes?.length) {
    return [];
  }

  const processIds = processes.map((process) => process.id as string);
  const { data: responses } = await supabase
    .from("feedback_responses")
    .select("process_id,completed")
    .in("process_id", processIds);

  return processes.map((process) => {
    const responseCount = (responses ?? []).filter(
      (response) => response.process_id === process.id && response.completed,
    ).length;

    return {
      id: process.id as string,
      title: process.name as string,
      status: process.status === "active" ? "Activo" : "Cerrado",
      deadline: process.deadline ? formatDate(process.deadline as string) : "Sin fecha",
      selectedMembers: Array.isArray(process.target_members) ? process.target_members.length : 0,
      responses: responseCount,
      questions: normalizeQuestions(process.questions),
    };
  }) satisfies FeedbackProcessView[];
}

async function enrichEvents(
  supabase: SupabaseServerClient,
  events: EventRow[],
  viewerId?: string,
) {
  const eventIds = events.map((event) => event.id);

  if (eventIds.length === 0) {
    return [];
  }

  const { data: rsvpData } = await supabase
    .from("rsvps")
    .select("event_id,user_id,status,confirmed_at,cancelled_at")
    .in("event_id", eventIds);

  const { data: checkInData } = await supabase
    .from("check_ins")
    .select("event_id,user_id,checked_in_at")
    .in("event_id", eventIds);

  const rsvps = (rsvpData ?? []) as RsvpRow[];
  const checkIns = (checkInData ?? []) as CheckInRow[];

  return events.map((event) => {
    const eventRsvps = rsvps.filter((rsvp) => rsvp.event_id === event.id);
    const confirmed = eventRsvps.filter((rsvp) => rsvp.status === "confirmed").length;
    const checkedIn = checkIns.filter((checkIn) => checkIn.event_id === event.id).length;
    const viewerRsvp = viewerId
      ? eventRsvps.find((rsvp) => rsvp.user_id === viewerId)
      : undefined;

    return {
      id: event.id,
      title: event.title,
      subtitle: event.subtitle || "Encuentro Paisanos",
      description: event.description ?? "",
      date: formatDate(event.event_date),
      time: formatTime(event.event_date),
      point:
        event.source === "luma"
          ? "Luma"
          : event.checkin_label && event.active_token
            ? event.active_token.slice(0, 3).toUpperCase()
            : "PMC",
      location: event.location ?? "A confirmar",
      status: statusLabel(event.status),
      rawStatus: event.status,
      capacity: event.max_capacity ?? 0,
      confirmed,
      checkedIn,
      noShows: Math.max(confirmed - checkedIn, 0),
      host: event.speaker_name ?? "Paisanos",
      tags: event.tags ?? [],
      userRsvpStatus: viewerRsvp?.status,
      source: event.source ?? "paisanos",
      sourceLabel: event.source === "luma" ? "Luma" : "Paisanos",
      lumaUrl: event.luma_url ?? null,
      lumaEventId: event.luma_event_id ?? null,
      registrationMode: event.registration_mode ?? "paisanos",
      checkinMode: event.checkin_mode ?? "paisanos",
      syncStatus: event.sync_status ?? "not_configured",
      usesLumaRegistration: event.registration_mode === "luma",
      usesLumaCheckIn: event.checkin_mode === "luma" || event.checkin_mode === "hybrid",
    };
  }) satisfies EventView[];
}

async function getMemberStats(supabase: SupabaseServerClient, userIds: string[]) {
  if (userIds.length === 0) {
    return {};
  }

  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("user_id")
    .in("user_id", userIds);

  const { data: feedbackResponses } = await supabase
    .from("feedback_responses")
    .select("user_id,completed")
    .in("user_id", userIds);

  return userIds.reduce<Record<string, { attendedEvents: number; feedbackGiven: number }>>(
    (acc, userId) => {
      acc[userId] = {
        attendedEvents: (checkIns ?? []).filter((item) => item.user_id === userId).length,
        feedbackGiven: (feedbackResponses ?? []).filter(
          (item) => item.user_id === userId && item.completed,
        ).length,
      };
      return acc;
    },
    {},
  );
}

export function profileToMember(
  profile: ProfileRow,
  stats: { attendedEvents: number; feedbackGiven: number } = {
    attendedEvents: 0,
    feedbackGiven: 0,
  },
): MemberView {
  return {
    id: profile.id,
    userId: profile.user_id,
    name: profile.full_name,
    role: profile.role,
    company: profile.company,
    location: profile.location,
    memberSince: formatMonth(profile.member_since),
    lastInteraction: profile.last_interaction ?? "Sin contacto registrado",
    attendedEvents: stats.attendedEvents,
    feedbackGiven: stats.feedbackGiven,
    focus: profile.focus,
    avatar: initials(profile.full_name),
    building: profile.building ?? "Todavia no cargo que esta construyendo.",
    lookingFor: profile.looking_for?.join(", ") || "A definir",
    canHelpWith: profile.can_help_with,
    openTo: profile.open_to,
    availability: profile.availability,
    skills: profile.skills ?? [],
    interests: profile.looking_for ?? [],
    qrValue: profile.qr_base_url ?? `/p/${profile.user_id}`,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeQuestions(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [];
}

function statusLabel(status: EventRow["status"]) {
  const labels: Record<EventRow["status"], string> = {
    active: "Activo",
    closed: "Cerrado",
    draft: "Borrador",
    published: "Publicado",
  };

  return labels[status];
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
  }).format(new Date(date));
}

export function formatTime(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatMonth(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
