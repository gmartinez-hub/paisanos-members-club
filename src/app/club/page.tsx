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

  return (
    <AppShell
      eyebrow="Members Club"
      isAdmin={profile.is_admin}
      title="Que las ideas no queden en el aire"
      actions={
        <div className="flex flex-wrap gap-2">
          {nextEvent ? (
            <PrimaryLink href={`/events/${nextEvent.id}`}>
              <QrCode size={17} />
              Abrir encuentro
            </PrimaryLink>
          ) : null}
          <SecondaryLink href="/passport">
            <BadgeCheck size={17} />
            Ver Paisaporte
          </SecondaryLink>
        </div>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="paisa-noise relative min-h-[580px] overflow-hidden rounded-sm border-2 border-foreground bg-paper p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {currentMember.skills.slice(0, 3).map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
            <span className="rounded-sm bg-foreground px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-paper">
              {currentMember.location}
            </span>
          </div>

          <div className="mt-14 max-w-5xl">
            <p className="mb-4 max-w-xl text-base font-semibold text-ink-muted">
              Un espacio para cruzar builders, pedir feedback real y hacer que la comunidad siga activa despues de cada encuentro.
            </p>
            <h2 className="max-w-5xl text-5xl font-black leading-[0.92] sm:text-7xl lg:text-8xl">
              Probar.
              <br />
              Conectar.
              <br />
              Construir <span className="marker">en voz alta.</span>
            </h2>
          </div>

          {nextEvent ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div className="border-t-2 border-foreground pt-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
                      Proximo encuentro
                    </p>
                    <h3 className="mt-2 text-3xl font-black leading-none">{nextEvent.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
                      {nextEvent.subtitle}. La idea no es llenar una sala: es armar cruces que muevan proyectos.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge>{nextEvent.status}</StatusBadge>
                    <StatusBadge>{nextEvent.sourceLabel}</StatusBadge>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <TinyFact icon={CalendarDays} label="Fecha" value={nextEvent.date} />
                  <TinyFact icon={ScanLine} label="Check-in" value={`${nextEvent.time} hs`} />
                  <TinyFact icon={UsersRound} label="Confirmados" value={`${nextEvent.confirmed}/${nextEvent.capacity}`} />
                </div>
              </div>

              <div className="rounded-sm bg-foreground p-5 text-paper">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">
                  Pulso piloto
                </p>
                <div className="mt-5 grid grid-cols-2 gap-5">
                  <Signal label="Miembros" value={`${members.length}`} />
                  <Signal label="Activos" value={`${members.length}`} />
                  <Signal label="Eventos" value={`${events.length}`} />
                  <Signal label="Fit" value={`${confirmationRate}%`} />
                </div>
              </div>
            </div>
          ) : (
            <EmptyBlock title="Todavia no hay encuentros publicados" copy="Cuando el admin publique uno, aparece aca con RSVP y lista de asistentes real." />
          )}
        </div>

        <aside className="grid content-start gap-5">
          <PassportCard member={currentMember} />

          <div className="border-t-2 border-foreground pt-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
              Ahora mismo
            </p>
            <div className="mt-4 grid gap-3">
              <p className="border-b border-line pb-3 text-sm leading-6 text-ink-muted">
                Tu Paisaporte esta activo y conectado al perfil real.
              </p>
              <p className="border-b border-line pb-3 text-sm leading-6 text-ink-muted">
                Hay {events.length} encuentros en Supabase y {members.length} miembros activos.
              </p>
              <p className="border-b border-line pb-3 text-sm leading-6 text-ink-muted">
                Ultimo contacto: {currentMember.lastInteraction}.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-8 border-t-2 border-foreground pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-signal" size={21} />
            <h2 className="text-3xl font-black">Lo que se mueve esta semana</h2>
          </div>

          <div className="mt-6 grid gap-5">
            {feedbackProcesses.length ? (
              feedbackProcesses.map((process) => (
                <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-[150px_minmax(0,1fr)]" key={process.id}>
                  <div>
                    <StatusBadge>{process.status}</StatusBadge>
                    <p className="mt-3 text-sm font-semibold text-ink-muted">Vence {process.deadline}</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{process.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
                      {process.responses}/{process.selectedMembers} respuestas. Preguntas pensadas para aprender rapido, no para validar por compromiso.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyBlock title="No hay procesos activos para vos" copy="Cuando te seleccionen para un feedback, aparece aca." />
            )}
          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-signal" size={21} />
              <h2 className="text-3xl font-black">Cruces sugeridos</h2>
            </div>
            <Link className="text-sm font-black text-foreground underline decoration-signal decoration-4 underline-offset-4" href="/directory">
              Ver directorio
            </Link>
          </div>

          <div className="grid gap-0 border-y-2 border-foreground">
            {matches.length ? (
              matches.map((match) => (
                <MatchRow match={match} key={match.member.id} />
              ))
            ) : (
              <div className="py-6">
                <EmptyBlock title="Faltan miembros para sugerir cruces" copy="Apenas haya mas perfiles activos, el directorio empieza a proponer conexiones." />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-t-2 border-foreground pt-8 lg:grid-cols-[330px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="text-signal" size={21} />
            <h2 className="text-3xl font-black">Radar</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Oportunidades propuestas por miembros o por Paisanos. Sin ranking ni incentivos raros: solo contexto claro para decidir si suma.
          </p>
        </div>

        <div className="grid gap-4">
          {opportunities.length ? (
            opportunities.map((item) => (
              <article className="grid gap-4 border-t border-line pt-4 md:grid-cols-[150px_minmax(0,1fr)_220px]" key={item.id as string}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">{String(item.type)}</p>
                  <p className="mt-2 text-sm font-semibold text-ink-muted">{String(item.status)}</p>
                </div>
                <div>
                  <h3 className="text-xl font-black">{String(item.title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{String(item.description)}</p>
                </div>
                <p className="self-start rounded-sm bg-stamp px-3 py-2 text-sm font-black text-foreground">
                  {String(item.category)}
                </p>
              </article>
            ))
          ) : (
            <EmptyBlock title="No hay oportunidades aprobadas" copy="El admin puede revisar propuestas y publicarlas cuando tengan contexto suficiente." />
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-foreground bg-paper px-3 py-2 text-xs font-black uppercase tracking-[0.16em]">
      {children}
    </span>
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
    <div className="border-t border-foreground pt-3">
      <Icon className="mb-3 text-signal" size={18} />
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-4xl font-black leading-none text-stamp">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-paper/70">{label}</p>
    </div>
  );
}

function MatchRow({
  match,
}: {
  match: { member: MemberView; reason: string; score: number };
}) {
  return (
    <article className="grid gap-4 border-b-2 border-foreground py-5 last:border-b-0 md:grid-cols-[64px_minmax(0,1fr)_90px]">
      <span className="grid size-14 place-items-center rounded-sm bg-foreground text-sm font-black text-paper">
        {match.member.avatar}
      </span>
      <div>
        <h3 className="text-xl font-black">{match.member.name}</h3>
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
