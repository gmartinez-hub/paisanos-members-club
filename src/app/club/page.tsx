import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  MessageCircle,
  QrCode,
  Radar,
  ScanLine,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PassportCard } from "@/components/passport-card";
import { PrimaryLink, SecondaryLink, StatusBadge } from "@/components/ui";
import {
  getEvents,
  getFeedbackProcesses,
  getMembers,
  profileToMember,
  requireMember,
  type MemberView,
} from "@/lib/community";

export default async function ClubPage() {
  const { profile, supabase, user } = await requireMember();
  const [events, members, feedbackProcesses, opportunitiesResult] = await Promise.all([
    getEvents(supabase, { viewerId: user.id }),
    getMembers(supabase),
    getFeedbackProcesses(supabase),
    supabase
      .from("contributions")
      .select("id,type,title,description,category,status")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const currentMember =
    members.find((member) => member.userId === user.id) ??
    profileToMember(profile, { attendedEvents: 0, feedbackGiven: 0 });
  const nextEvent = events[0];
  const confirmationRate = nextEvent?.capacity
    ? Math.round((nextEvent.confirmed / nextEvent.capacity) * 100)
    : 0;
  const matches = members
    .filter((member) => member.userId !== user.id)
    .slice(0, 3)
    .map((member, index) => ({
      member,
      reason: `${member.name} esta en ${member.focus.toLowerCase()} y puede cruzarse con tu busqueda: ${currentMember.lookingFor}.`,
      score: [92, 84, 78][index] ?? 72,
    }));
  const opportunities = opportunitiesResult.data ?? [];
  const nativeEvents = events.filter((event) => !event.usesLumaRegistration).length;
  const lumaEvents = events.filter((event) => event.usesLumaRegistration).length;

  return (
    <AppShell
      eyebrow="Inicio privado"
      isAdmin={profile.is_admin}
      title="Inicio Paisaporte"
      actions={
        <div className="flex flex-wrap gap-2">
          {nextEvent ? (
            <PrimaryLink href={`/events/${nextEvent.id}`}>
              <QrCode size={17} />
              Abrir evento
            </PrimaryLink>
          ) : null}
          <SecondaryLink href="/passport">
            <BadgeCheck size={17} />
            Ver Paisaporte
          </SecondaryLink>
        </div>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardMetric label="Paisanos" value={`${members.length}`} caption="Paisaportes activos" />
            <DashboardMetric label="Eventos" value={`${events.length}`} caption={`${nativeEvents} Paisanos · ${lumaEvents} Luma`} />
            <DashboardMetric label="Cruces" value={`${matches.length}`} caption="Sugeridos" />
            <DashboardMetric label="Afinidad" value={`${confirmationRate}%`} caption="Proximo evento" />
          </div>

          {nextEvent ? (
            <article className="ticket-edge-bg overflow-hidden rounded-none border border-line bg-paper shadow-[0_8px_28px_rgba(12,26,38,.08)]">
              <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusBadge>{nextEvent.status}</StatusBadge>
                    <StatusBadge>{nextEvent.sourceLabel}</StatusBadge>
                  </div>
                  <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                    Proximo evento
                  </p>
                  <h2 className="mt-2 max-w-3xl text-4xl font-black leading-none">{nextEvent.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
                    {nextEvent.subtitle}. Cruces concretos, notas accionables y seguimiento despues del evento.
                  </p>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <TinyFact icon={CalendarDays} label="Fecha" value={nextEvent.date} />
                    <TinyFact icon={ScanLine} label="Horario" value={`${nextEvent.time} hs`} />
                    <TinyFact icon={UsersRound} label="Capacidad" value={`${nextEvent.confirmed}/${nextEvent.capacity || "-"}`} />
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  <div className="bg-runway p-4 text-paper">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-stamp">Check-in</p>
                    <p className="mt-2 text-5xl font-black leading-none">{nextEvent.point}</p>
                    <p className="mt-4 text-sm leading-6 text-paper/70">{nextEvent.location}</p>
                  </div>
                  <PrimaryLink href={`/events/${nextEvent.id}`}>
                    <QrCode size={17} />
                    Abrir evento
                  </PrimaryLink>
                </div>
              </div>
              <div className="perforation" />
              <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-5 py-3">
                <div className="barcode h-5 min-w-48 flex-1" aria-hidden="true" />
                <Link className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted hover:text-foreground" href="/events">
                  Ver eventos
                </Link>
              </div>
            </article>
          ) : (
            <EmptyBlock title="Todavia no hay eventos publicados" copy="Cuando el equipo publique uno, aparece aca con asistencia y contexto real." />
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="border-t border-line pt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-signal" size={21} />
                  <h2 className="text-3xl font-black">Miembros sugeridos</h2>
                </div>
                <Link className="text-sm font-black underline decoration-signal decoration-4 underline-offset-4" href="/directory">
                  Ver miembros
                </Link>
              </div>
              <div className="grid gap-3">
                {matches.length ? (
                  matches.map((match) => (
                    <MatchRow match={match} key={match.member.id} />
                  ))
                ) : (
                  <EmptyBlock title="Faltan miembros para sugerir cruces" copy="Apenas haya mas Paisaportes activos, el mapa empieza a proponer conexiones utiles." />
                )}
              </div>
            </section>

            <section className="border-t border-line pt-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Radar className="text-signal" size={21} />
                  <h2 className="text-3xl font-black">Propuestas</h2>
                </div>
                <Link className="text-sm font-black underline decoration-signal decoration-4 underline-offset-4" href="/opportunities">
                  Enviar propuesta
                </Link>
              </div>
              <div className="grid gap-3">
                {opportunities.length ? (
                  opportunities.map((item) => (
                    <article className="border-t border-line pt-4" key={item.id as string}>
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-signal-dark">{String(item.category)}</p>
                      <h3 className="mt-2 text-xl font-black">{String(item.title)}</h3>
                      <p className="mt-2 text-sm leading-6 text-ink-muted">{String(item.description)}</p>
                    </article>
                  ))
                ) : (
                  <EmptyBlock title="No hay propuestas aprobadas" copy="Cuando el equipo cure una propuesta, aparece aca con contexto y proximos pasos." />
                )}
              </div>
            </section>
          </div>
        </div>

        <aside className="grid content-start gap-5">
          <PassportCard member={currentMember} />

          <section className="border-t border-line pt-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="text-signal" size={21} />
              <h2 className="text-2xl font-black">Ahora mismo</h2>
            </div>
            <div className="grid gap-3">
              <MiniAction href="/passport" label="Paisaporte" value={currentMember.lastInteraction} />
              <MiniAction href="/feedback" label="Feedback" value={`${feedbackProcesses.length} procesos visibles`} />
              <MiniAction href="/directory" label="Miembros" value={`${members.length} perfiles con contexto`} />
            </div>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}

function TinyFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-line pt-3">
      <Icon className="mb-3 text-signal" size={18} />
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

function DashboardMetric({ caption, label, value }: { caption: string; label: string; value: string }) {
  return (
    <div className="border-t border-line bg-paper/55 pt-4">
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-ink-muted">{label}</p>
      <p className="mt-2 text-4xl font-black leading-none">{value}</p>
      <p className="mt-2 text-xs font-semibold text-ink-muted">{caption}</p>
    </div>
  );
}

function MatchRow({
  match,
}: {
  match: { member: MemberView; reason: string; score: number };
}) {
  return (
    <article className="grid gap-4 border-t border-line pt-4 md:grid-cols-[56px_minmax(0,1fr)_70px]">
      <span className="grid size-14 place-items-center rounded-sm bg-foreground text-sm font-black text-paper">
        {match.member.avatar}
      </span>
      <div>
        <Link href={`/p/${match.member.userId}`}>
          <h3 className="text-xl font-black hover:underline hover:decoration-signal hover:decoration-4">
            {match.member.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          {match.member.role} · {match.member.company}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-muted">{match.reason}</p>
      </div>
      <div className="self-start text-left md:text-right">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">Fit</p>
        <p className="text-4xl font-black text-signal">{match.score}</p>
      </div>
    </article>
  );
}

function EmptyBlock({ copy, title }: { copy: string; title: string }) {
  return (
    <div className="border-t border-line pt-5">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p>
    </div>
  );
}

function MiniAction({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link className="block border-t border-line pt-3 transition-colors hover:text-signal-dark" href={href}>
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </Link>
  );
}
