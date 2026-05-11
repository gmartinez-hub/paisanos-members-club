import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

loadLocalEnv();

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const qaPassword = process.env.QA_SEED_PASSWORD || "PaisanosQA2026!";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const qaUsers = [
  {
    availability: "Martes y jueves, despues de las 18",
    building: "Armando el sistema operativo de miembros y eventos.",
    canHelpWith: "Producto, partnerships, research con founders.",
    company: "Paisanos",
    email: "admin.qa@paisanos.io",
    focus: "Operar el club y cerrar el circuito de eventos.",
    fullName: "Gabi Martinez QA",
    isAdmin: true,
    location: "Buenos Aires",
    lookingFor: ["Ops", "Eventos", "Feedback"],
    openTo: "Revisar flujos, invitar miembros y auditar eventos.",
    role: "Admin",
    skills: ["Producto", "Ops", "Partnerships"],
  },
  {
    availability: "Viernes por la tarde",
    building: "Un copiloto de ventas para equipos B2B.",
    canHelpWith: "Go-to-market, discovery y venta consultiva.",
    company: "Ruta Labs",
    email: "member.qa@paisanos.io",
    focus: "Encontrar beta testers y advisors.",
    fullName: "Sofia Alvarez",
    isAdmin: false,
    location: "Palermo",
    lookingFor: ["Beta testers", "Ventas", "AI"],
    openTo: "Demos tempranas y conversaciones uno a uno.",
    role: "Founder",
    skills: ["B2B", "Sales", "AI"],
  },
  {
    availability: "Miercoles al mediodia",
    building: "Herramientas internas para equipos de soporte.",
    canHelpWith: "Sistemas internos, soporte y automatizacion.",
    company: "Nube Sur",
    email: "builder.qa@paisanos.io",
    focus: "Validar integraciones y flujos operativos.",
    fullName: "Mateo Rivas",
    isAdmin: false,
    location: "Colegiales",
    lookingFor: ["Integraciones", "Soporte", "SaaS"],
    openTo: "Dar feedback tecnico y probar herramientas.",
    role: "Product Lead",
    skills: ["SaaS", "Ops", "No-code"],
  },
  {
    availability: "A coordinar",
    building: "Definiendo que quiere construir dentro del club.",
    canHelpWith: "Research, contenido y conversaciones con founders.",
    company: "Pasaje Studio",
    email: "onboarding.qa@paisanos.io",
    focus: "Completar el Paisaporte por primera vez.",
    fullName: "Camila Torres",
    isAdmin: false,
    location: "Buenos Aires",
    lookingFor: ["Onboarding", "Research"],
    openTo: "Probar el flujo de primer ingreso.",
    role: "Researcher",
    skills: ["Research", "Contenido"],
    skipProfile: true,
  },
];

const authUsers = new Map();

for (const qaUser of qaUsers) {
  const authUser = await upsertAuthUser(qaUser);
  authUsers.set(qaUser.email, authUser);
  await approveAccess(qaUser);

  if (!qaUser.skipProfile) {
    await upsertProfile(qaUser, authUser.id);
  }
}

const adminUser = authUsers.get("admin.qa@paisanos.io");
const memberUser = authUsers.get("member.qa@paisanos.io");
const builderUser = authUsers.get("builder.qa@paisanos.io");

const nativeEventId = await upsertEvent({
  active_token: "QAFLIGHT20260522",
  checkin_label: "A12",
  checkin_mode: "paisanos",
  description:
    "Mesa chica para probar el flujo completo: RSVP nativo, check-in, directorio y acciones posteriores.",
  event_date: "2026-05-22T19:30:00-03:00",
  location: "Paisanos HQ",
  max_capacity: 24,
  registration_mode: "paisanos",
  source: "paisanos",
  speaker_name: "Paisanos",
  status: "published",
  subtitle: "QA del circuito completo dentro de Paisanos",
  sync_status: "not_configured",
  tags: ["Producto", "Founders", "QA"],
  title: "Boarding Night: Producto en pista",
});

const lumaEventId = await upsertEvent({
  active_token: "QALUMA20260605",
  checkin_label: "Luma",
  checkin_mode: "luma",
  description:
    "Evento espejo para validar como se ve un registro externo antes de conectar credenciales reales de Luma.",
  event_date: "2026-06-05T18:30:00-03:00",
  location: "Luma externo",
  luma_event_id: "evt-pmc-qa",
  luma_last_synced_at: new Date().toISOString(),
  luma_url: "https://luma.com/evt-pmc-qa",
  max_capacity: 80,
  registration_mode: "luma",
  source: "luma",
  speaker_name: "Paisanos",
  status: "published",
  subtitle: "Evento externo preparado para sync futura",
  sync_status: "synced",
  tags: ["Luma", "Eventos", "QA"],
  title: "Luma Mirror: Founders Buenos Aires",
});

await upsertRsvp(nativeEventId, memberUser.id, "confirmed");
await upsertRsvp(nativeEventId, builderUser.id, "confirmed");
await upsertRsvp(nativeEventId, adminUser.id, "confirmed");
await upsertCheckIn(nativeEventId, memberUser.id);

await upsertLumaGuestSnapshot(lumaEventId, "evt-pmc-qa", {
  approval_status: "approved",
  checked_in_at: null,
  email: "member.qa@paisanos.io",
  full_name: "Sofia Alvarez",
  luma_guest_id: "gst-qa-sofia",
  matched_user_id: memberUser.id,
  registered_at: "2026-05-11T18:00:00.000Z",
});
await upsertLumaGuestSnapshot(lumaEventId, "evt-pmc-qa", {
  approval_status: "approved",
  checked_in_at: "2026-06-05T21:40:00.000Z",
  email: "builder.qa@paisanos.io",
  full_name: "Mateo Rivas",
  luma_guest_id: "gst-qa-mateo",
  matched_user_id: builderUser.id,
  registered_at: "2026-05-11T18:05:00.000Z",
});
await upsertLumaGuestSnapshot(lumaEventId, "evt-pmc-qa", {
  approval_status: "waitlist",
  checked_in_at: null,
  email: "external.qa@example.com",
  full_name: "Invitado Externo",
  luma_guest_id: "gst-qa-external",
  matched_user_id: null,
  registered_at: "2026-05-11T18:10:00.000Z",
});

await upsertContribution({
  category: "Producto",
  description: "Puedo sumar cinco usuarios para probar el flujo de eventos y paisaporte.",
  status: "approved",
  title: "Beta testers para eventos",
  type: "solution",
  user_id: memberUser.id,
});
await upsertContribution({
  category: "AI",
  description: "Propongo una mesa de prompts internos para founders con operaciones chicas.",
  status: "pending",
  title: "Mesa de automatizacion",
  type: "event_proposal",
  user_id: builderUser.id,
});

await upsertFeedbackProcess([memberUser.id, builderUser.id]);

console.log("");
console.log("QA seed listo.");
console.log("");
console.log("Admin:");
console.log(`  admin.qa@paisanos.io / ${qaPassword}`);
console.log("Miembros:");
console.log(`  member.qa@paisanos.io / ${qaPassword}`);
console.log(`  builder.qa@paisanos.io / ${qaPassword}`);
console.log("Primer ingreso:");
console.log(`  onboarding.qa@paisanos.io / ${qaPassword}`);
console.log("");

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^['"]|['"]$/g, "");
    }
  }
}

function requiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Falta ${key}. Agregalo a .env.local o a Vercel antes de correr el seed.`);
  }
  return value;
}

async function upsertAuthUser(qaUser) {
  const existing = await findAuthUserByEmail(qaUser.email);
  const payload = {
    email: qaUser.email,
    email_confirm: true,
    password: qaPassword,
    user_metadata: {
      company: qaUser.company,
      full_name: qaUser.fullName,
    },
  };

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, payload);
    if (error) {
      throw error;
    }
    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser(payload);
  if (error) {
    throw error;
  }
  return data.user;
}

async function findAuthUserByEmail(email) {
  const perPage = 100;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found || data.users.length < perPage) {
      return found ?? null;
    }
  }

  return null;
}

async function approveAccess(qaUser) {
  const { error } = await supabase.from("whitelist_requests").upsert(
    {
      company: qaUser.company,
      email: qaUser.email,
      full_name: qaUser.fullName,
      reason: "Usuario QA para validar Paisanos Members Club.",
      reviewed_at: new Date().toISOString(),
      status: "approved",
    },
    { onConflict: "email" },
  );

  if (error) {
    throw error;
  }
}

async function upsertProfile(qaUser, userId) {
  const { error } = await supabase.from("profiles").upsert(
    {
      availability: qaUser.availability,
      building: qaUser.building,
      can_help_with: qaUser.canHelpWith,
      company: qaUser.company,
      email: qaUser.email,
      focus: qaUser.focus,
      full_name: qaUser.fullName,
      is_active: true,
      is_admin: qaUser.isAdmin,
      last_interaction: "Seed QA",
      location: qaUser.location,
      looking_for: qaUser.lookingFor,
      member_since: "2026-05-11",
      open_to: qaUser.openTo,
      qr_base_url: `/p/${userId}`,
      role: qaUser.role,
      skills: qaUser.skills,
      user_id: userId,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}

async function upsertEvent(eventPayload) {
  const { data: existing, error: selectError } = await supabase
    .from("events")
    .select("id")
    .eq("title", eventPayload.title)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("events")
      .update(eventPayload)
      .eq("id", existing.id);
    if (error) {
      throw error;
    }
    return existing.id;
  }

  const { data, error } = await supabase
    .from("events")
    .insert(eventPayload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

async function upsertRsvp(eventId, userId, status) {
  const { error } = await supabase.from("rsvps").upsert(
    {
      confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      event_id: eventId,
      status,
      user_id: userId,
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    throw error;
  }
}

async function upsertCheckIn(eventId, userId) {
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
    throw error;
  }
}

async function upsertLumaGuestSnapshot(eventId, lumaEventId, guest) {
  const { error } = await supabase.from("luma_guest_snapshots").upsert(
    {
      event_id: eventId,
      luma_event_id: lumaEventId,
      raw: guest,
      ...guest,
    },
    { onConflict: "luma_event_id,luma_guest_id" },
  );

  if (error) {
    throw error;
  }
}

async function upsertContribution(payload) {
  const { data: existing, error: selectError } = await supabase
    .from("contributions")
    .select("id")
    .eq("title", payload.title)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  const row = {
    ...payload,
    published_at: payload.status === "approved" ? new Date().toISOString() : null,
  };

  const { error } = existing?.id
    ? await supabase.from("contributions").update(row).eq("id", existing.id)
    : await supabase.from("contributions").insert(row);

  if (error) {
    throw error;
  }
}

async function upsertFeedbackProcess(targetMembers) {
  const name = "QA Paisaporte feedback";
  const payload = {
    deadline: "2026-06-15T23:59:00-03:00",
    name,
    questions: [
      "Que parte del Paisaporte se entiende primero?",
      "Donde esperarias ver la accion principal?",
      "Que te haria volver despues de un evento?",
    ],
    status: "active",
    target_members: targetMembers,
  };

  const { data: existing, error: selectError } = await supabase
    .from("feedback_processes")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  const { error } = existing?.id
    ? await supabase.from("feedback_processes").update(payload).eq("id", existing.id)
    : await supabase.from("feedback_processes").insert(payload);

  if (error) {
    throw error;
  }
}
