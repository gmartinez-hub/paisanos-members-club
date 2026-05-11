import type {
  EventView,
  FeedbackProcessView,
  MemberView,
  ProfileRow,
} from "@/lib/community";

export const DEMO_PASSWORD = "PaisanosQA2026!";
export const DEMO_COOKIE = "pmc_demo";

export type DemoRole = "admin" | "member" | "builder" | "onboarding";

export function roleFromEmail(email: string): DemoRole | null {
  const normalized = email.trim().toLowerCase();

  if (normalized === "admin.qa@paisanos.io") return "admin";
  if (normalized === "member.qa@paisanos.io") return "member";
  if (normalized === "builder.qa@paisanos.io") return "builder";
  if (normalized === "onboarding.qa@paisanos.io") return "onboarding";

  return null;
}

export function isDemoSupabase(value: unknown): value is DemoSupabaseClient {
  return Boolean(value && typeof value === "object" && "__demo" in value);
}

export function getDemoUser(role: DemoRole) {
  const profile = getDemoProfile(role);

  return {
    app_metadata: {},
    aud: "authenticated",
    confirmed_at: "2026-05-11T12:00:00.000Z",
    created_at: "2026-05-11T12:00:00.000Z",
    email: profile.email ?? "member.qa@paisanos.io",
    id: profile.user_id,
    role: "authenticated",
    updated_at: "2026-05-11T12:00:00.000Z",
    user_metadata: {},
  };
}

export function getDemoProfile(role: DemoRole) {
  if (role === "onboarding") {
    return {
      ...demoProfiles.member,
      id: "profile-demo-onboarding",
      user_id: "user-demo-onboarding",
      email: "onboarding.qa@paisanos.io",
      full_name: "Camila Torres",
      role: "Researcher",
      company: "Pasaje Studio",
      is_admin: false,
      is_active: false,
      focus: "Completar el Paisaporte por primera vez.",
      building: "Definiendo que quiere construir dentro del club.",
      last_interaction: "Primer ingreso pendiente",
    } satisfies ProfileRow;
  }

  return demoProfiles[role];
}

export function getDemoMembers(): MemberView[] {
  return [
    {
      id: "profile-demo-admin",
      userId: "user-demo-admin",
      name: "Gabi Martinez QA",
      role: "Admin",
      company: "Paisanos",
      email: "admin.qa@paisanos.io",
      location: "Buenos Aires",
      memberSince: "may 2026",
      lastInteraction: "Opero la torre de control esta semana",
      attendedEvents: 5,
      feedbackGiven: 4,
      focus: "Operar el club y cerrar el circuito de eventos.",
      avatar: "GM",
      building: "Armando el sistema operativo de miembros y eventos.",
      lookingFor: "Ops, Eventos, Feedback",
      canHelpWith: "Producto, partnerships, research con founders.",
      openTo: "Revisar flujos, invitar miembros y auditar eventos.",
      availability: "Martes y jueves, despues de las 18",
      skills: ["Producto", "Ops", "Partnerships"],
      interests: ["Ops", "Eventos", "Feedback"],
      qrValue: "/p/user-demo-admin",
    },
    {
      id: "profile-demo-member",
      userId: "user-demo-member",
      name: "Sofia Alvarez",
      role: "Founder",
      company: "Ruta Labs",
      email: "member.qa@paisanos.io",
      location: "Palermo",
      memberSince: "may 2026",
      lastInteraction: "RSVP confirmado para Boarding Night",
      attendedEvents: 2,
      feedbackGiven: 3,
      focus: "Encontrar beta testers y advisors.",
      avatar: "SA",
      building: "Un copiloto de ventas para equipos B2B.",
      lookingFor: "Beta testers, Ventas, AI",
      canHelpWith: "Go-to-market, discovery y venta consultiva.",
      openTo: "Demos tempranas y conversaciones uno a uno.",
      availability: "Viernes por la tarde",
      skills: ["B2B", "Sales", "AI"],
      interests: ["Beta testers", "Ventas", "AI"],
      qrValue: "/p/user-demo-member",
    },
    {
      id: "profile-demo-builder",
      userId: "user-demo-builder",
      name: "Mateo Rivas",
      role: "Product Lead",
      company: "Nube Sur",
      email: "builder.qa@paisanos.io",
      location: "Colegiales",
      memberSince: "abr 2026",
      lastInteraction: "Dio feedback tecnico en Luma Mirror",
      attendedEvents: 3,
      feedbackGiven: 2,
      focus: "Validar integraciones y flujos operativos.",
      avatar: "MR",
      building: "Herramientas internas para equipos de soporte.",
      lookingFor: "Integraciones, Soporte, SaaS",
      canHelpWith: "Sistemas internos, soporte y automatizacion.",
      openTo: "Dar feedback tecnico y probar herramientas.",
      availability: "Miercoles al mediodia",
      skills: ["SaaS", "Ops", "No-code"],
      interests: ["Integraciones", "Soporte", "SaaS"],
      qrValue: "/p/user-demo-builder",
    },
    {
      id: "profile-demo-ana",
      userId: "user-demo-ana",
      name: "Ana Ibarra",
      role: "Design Partner",
      company: "Sur Studio",
      email: "ana.demo@paisanos.io",
      location: "Chacarita",
      memberSince: "mar 2026",
      lastInteraction: "Propuso mesa de identidad visual",
      attendedEvents: 1,
      feedbackGiven: 1,
      focus: "Alinear producto, narrativa y experiencia visual.",
      avatar: "AI",
      building: "Un playbook de marca para startups tempranas.",
      lookingFor: "Founders, UX, Branding",
      canHelpWith: "Identidad, research visual y sistemas de interfaz.",
      openTo: "Crits de producto y workshops cortos.",
      availability: "A coordinar",
      skills: ["Brand", "UX", "Research"],
      interests: ["Founders", "UX", "Branding"],
      qrValue: "/p/user-demo-ana",
    },
  ];
}

export function getDemoEvents(viewerId = "user-demo-member"): EventView[] {
  return [
    {
      id: "evt-demo-boarding-night",
      title: "Boarding Night: Producto en pista",
      subtitle: "Mesa chica para probar el circuito completo dentro de Paisanos",
      description:
        "RSVP nativo, check-in, directorio y seguimiento posterior. Una noche para convertir conversaciones sueltas en proximos pasos concretos.",
      date: "22 de mayo",
      time: "19:30",
      point: "QAF",
      location: "Paisanos HQ",
      status: "Publicado",
      rawStatus: "published",
      capacity: 24,
      availableSeats: 21,
      confirmed: 3,
      checkedIn: 1,
      isFull: false,
      noShows: 2,
      host: "Paisanos",
      tags: ["Producto", "Founders", "QA"],
      userRsvpStatus: viewerId === "user-demo-member" ? "confirmed" : undefined,
      waitlisted: 0,
      source: "paisanos",
      sourceLabel: "Paisanos",
      lumaUrl: null,
      lumaEventId: null,
      registrationMode: "paisanos",
      checkinMode: "paisanos",
      syncStatus: "not_configured",
      lumaLastSyncedAt: null,
      lumaLastWebhookAt: null,
      lumaSyncError: null,
      usesLumaRegistration: false,
      usesLumaCheckIn: false,
    },
    {
      id: "evt-demo-luma-mirror",
      title: "Luma Mirror: Founders Buenos Aires",
      subtitle: "Evento externo preparado para migracion gradual",
      description:
        "Registro y puerta se mantienen en Luma, mientras Paisanos importa asistentes para identidad, historial y seguimiento.",
      date: "5 de junio",
      time: "18:30",
      point: "Luma",
      location: "Luma externo",
      status: "Publicado",
      rawStatus: "published",
      capacity: 80,
      availableSeats: 77,
      confirmed: 3,
      checkedIn: 1,
      isFull: false,
      noShows: 2,
      host: "Paisanos",
      tags: ["Luma", "Eventos", "QA"],
      waitlisted: 1,
      source: "luma",
      sourceLabel: "Luma",
      lumaUrl: "https://luma.com/evt-pmc-qa",
      lumaEventId: "evt-pmc-qa",
      registrationMode: "luma",
      checkinMode: "luma",
      syncStatus: "synced",
      lumaLastSyncedAt: "11 may, 15:00",
      lumaLastWebhookAt: "11 may, 15:20",
      lumaSyncError: null,
      usesLumaRegistration: true,
      usesLumaCheckIn: true,
    },
  ];
}

export function getDemoFeedbackProcesses(): FeedbackProcessView[] {
  return [
    {
      id: "feedback-demo-activation",
      title: "Feedback post Boarding Night",
      status: "Activo",
      deadline: "28 de mayo",
      selectedMembers: 3,
      responses: 2,
      questions: [
        "Que conversacion deberia convertirse en proximo paso?",
        "Que parte del encuentro te dio mas claridad?",
        "A quien deberiamos invitar al siguiente cruce?",
      ],
    },
  ];
}

export function getDemoEventAttendees(eventId: string) {
  if (eventId === "evt-demo-luma-mirror") {
    return [
      { member: getDemoMembers()[1], checkedIn: false },
      { member: getDemoMembers()[2], checkedIn: true },
    ];
  }

  return [
    { member: getDemoMembers()[1], checkedIn: true },
    { member: getDemoMembers()[2], checkedIn: false },
    { member: getDemoMembers()[0], checkedIn: false },
  ];
}

export function makeDemoSupabase(): DemoSupabaseClient {
  return {
    __demo: true,
    from(table: string) {
      return new DemoQuery(table);
    },
  };
}

export type DemoSupabaseClient = {
  __demo: true;
  from: (table: string) => DemoQuery;
};

type DemoRow = Record<string, unknown>;

class DemoQuery implements PromiseLike<{ data: DemoRow[]; error: null }> {
  private filters: Array<{ key: string; value: unknown }> = [];
  private maxRows: number | null = null;

  constructor(private table: string) {}

  select() {
    return this;
  }

  eq(key: string, value: unknown) {
    this.filters.push({ key, value });
    return this;
  }

  in(key: string, values: unknown[]) {
    this.filters.push({ key, value: new Set(values) });
    return this;
  }

  or() {
    return this;
  }

  order() {
    return this;
  }

  limit(value: number) {
    this.maxRows = value;
    return this;
  }

  insert() {
    return Promise.resolve({ data: null, error: null });
  }

  update() {
    return this;
  }

  upsert() {
    return Promise.resolve({ data: null, error: null });
  }

  delete() {
    return this;
  }

  async maybeSingle() {
    const [row] = this.rows();
    return { data: row ?? null, error: null };
  }

  then<TResult1 = { data: DemoRow[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: DemoRow[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({ data: this.rows(), error: null }).then(onfulfilled, onrejected);
  }

  private rows() {
    let rows = demoRows(this.table);

    for (const filter of this.filters) {
      rows = rows.filter((row) => {
        const value = row[filter.key];
        return filter.value instanceof Set ? filter.value.has(value) : value === filter.value;
      });
    }

    return this.maxRows === null ? rows : rows.slice(0, this.maxRows);
  }
}

function demoRows(table: string): DemoRow[] {
  if (table === "contributions") {
    return [
      {
        id: "contribution-demo-beta",
        type: "solution",
        title: "Beta testers para eventos",
        description: "Cinco usuarios para probar RSVP, check-in y seguimiento posterior.",
        category: "Producto",
        status: "approved",
        user_id: "user-demo-member",
      },
      {
        id: "contribution-demo-automation",
        type: "event_proposal",
        title: "Mesa de automatizacion",
        description: "Prompts internos para founders con operaciones chicas.",
        category: "AI",
        status: "pending",
        user_id: "user-demo-builder",
      },
    ];
  }

  if (table === "whitelist_requests") {
    return [
      {
        id: "waitlist-demo-1",
        email: "lucia.demo@example.com",
        full_name: "Lucia Benitez",
        company: "Mercado Norte",
        reason: "Quiere validar un producto B2B con founders y operators.",
        status: "pending",
      },
      {
        id: "waitlist-demo-2",
        email: "tomas.demo@example.com",
        full_name: "Tomas Greco",
        company: "Delta AI",
        reason: "Puede aportar automatizacion para equipos chicos.",
        status: "approved",
      },
    ];
  }

  if (table === "events") {
    return [
      {
        id: "evt-demo-boarding-night",
        status: "published",
        max_capacity: 24,
        registration_mode: "paisanos",
        checkin_mode: "paisanos",
      },
      {
        id: "evt-demo-luma-mirror",
        status: "published",
        max_capacity: 80,
        registration_mode: "luma",
        checkin_mode: "luma",
      },
    ];
  }

  if (table === "rsvps") {
    return [
      {
        id: "rsvp-demo-sofia",
        event_id: "evt-demo-boarding-night",
        user_id: "user-demo-member",
        status: "confirmed",
      },
      {
        id: "rsvp-demo-mateo",
        event_id: "evt-demo-boarding-night",
        user_id: "user-demo-builder",
        status: "confirmed",
      },
      {
        id: "rsvp-demo-gabi",
        event_id: "evt-demo-boarding-night",
        user_id: "user-demo-admin",
        status: "confirmed",
      },
    ];
  }

  return [];
}

const baseProfile = {
  avatar_url: null,
  created_at: "2026-05-11T12:00:00.000Z",
  is_active: true,
  linkedin_url: null,
  member_since: "2026-05-01",
  qr_base_url: null,
  updated_at: "2026-05-11T12:00:00.000Z",
} satisfies Pick<
  ProfileRow,
  "avatar_url" | "created_at" | "is_active" | "linkedin_url" | "member_since" | "qr_base_url" | "updated_at"
>;

const demoProfiles = {
  admin: {
    ...baseProfile,
    id: "profile-demo-admin",
    user_id: "user-demo-admin",
    email: "admin.qa@paisanos.io",
    full_name: "Gabi Martinez QA",
    role: "Admin",
    company: "Paisanos",
    skills: ["Producto", "Ops", "Partnerships"],
    building: "Armando el sistema operativo de miembros y eventos.",
    looking_for: ["Ops", "Eventos", "Feedback"],
    is_admin: true,
    location: "Buenos Aires",
    focus: "Operar el club y cerrar el circuito de eventos.",
    can_help_with: "Producto, partnerships, research con founders.",
    open_to: "Revisar flujos, invitar miembros y auditar eventos.",
    availability: "Martes y jueves, despues de las 18",
    last_interaction: "Opero la torre de control esta semana",
  },
  member: {
    ...baseProfile,
    id: "profile-demo-member",
    user_id: "user-demo-member",
    email: "member.qa@paisanos.io",
    full_name: "Sofia Alvarez",
    role: "Founder",
    company: "Ruta Labs",
    skills: ["B2B", "Sales", "AI"],
    building: "Un copiloto de ventas para equipos B2B.",
    looking_for: ["Beta testers", "Ventas", "AI"],
    is_admin: false,
    location: "Palermo",
    focus: "Encontrar beta testers y advisors.",
    can_help_with: "Go-to-market, discovery y venta consultiva.",
    open_to: "Demos tempranas y conversaciones uno a uno.",
    availability: "Viernes por la tarde",
    last_interaction: "RSVP confirmado para Boarding Night",
  },
  builder: {
    ...baseProfile,
    id: "profile-demo-builder",
    user_id: "user-demo-builder",
    email: "builder.qa@paisanos.io",
    full_name: "Mateo Rivas",
    role: "Product Lead",
    company: "Nube Sur",
    skills: ["SaaS", "Ops", "No-code"],
    building: "Herramientas internas para equipos de soporte.",
    looking_for: ["Integraciones", "Soporte", "SaaS"],
    is_admin: false,
    location: "Colegiales",
    focus: "Validar integraciones y flujos operativos.",
    can_help_with: "Sistemas internos, soporte y automatizacion.",
    open_to: "Dar feedback tecnico y probar herramientas.",
    availability: "Miercoles al mediodia",
    last_interaction: "Dio feedback tecnico en Luma Mirror",
  },
} satisfies Record<"admin" | "member" | "builder", ProfileRow>;
