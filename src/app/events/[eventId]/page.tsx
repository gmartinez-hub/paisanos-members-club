import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, QrCode, ScanLine, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricTile, PrimaryButton, PrimaryLink, SecondaryLink, StatusBadge } from "@/components/ui";
import { cancelRsvp, rsvpToEvent } from "@/lib/actions";
import { getEventAttendees, getEventById, requireMember } from "@/lib/community";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const { profile, supabase, user } = await requireMember();
  const [event, attendees] = await Promise.all([
    getEventById(supabase, eventId, { viewerId: user.id }),
    getEventAttendees(supabase, eventId),
  ]);

  if (!event) {
    notFound();
  }

  const isConfirmed = event.userRsvpStatus === "confirmed";
  const isWaitlisted = event.userRsvpStatus === "waitlist";
  const hasNativeRsvp = isConfirmed || isWaitlisted;

  return (
    <AppShell
      eyebrow="Escala Paisanos"
      isAdmin={profile.is_admin}
      title={event.title}
      actions={
        <div className="flex flex-wrap gap-2">
          {event.usesLumaRegistration ? (
            event.lumaUrl ? (
              <PrimaryLink href={event.lumaUrl} target="_blank">
                <ExternalLink size={17} />
                Reservar en Luma
              </PrimaryLink>
            ) : null
          ) : (
            <form action={hasNativeRsvp ? cancelRsvp : rsvpToEvent}>
              <input name="event_id" type="hidden" value={event.id} />
              <PrimaryButton>
                <QrCode size={17} />
                {hasNativeRsvp ? "Soltar asiento" : event.isFull ? "Entrar en espera" : "Confirmar asiento"}
              </PrimaryButton>
            </form>
          )}
          {profile.is_admin && !event.usesLumaCheckIn ? (
            <SecondaryLink href="/admin/check-in">
              <ScanLine size={17} />
              Abrir puerta
            </SecondaryLink>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <MetricTile icon={UsersRound} label="Asientos" value={`${event.confirmed}`} caption={`Capacidad ${event.capacity}`} />
        <MetricTile icon={CheckCircle2} label="Sellos" value={`${event.checkedIn}`} caption="Entrada registrada" />
        <MetricTile icon={QrCode} label="Puerta" value={event.point} caption="Token de escala" />
        <MetricTile icon={ScanLine} label="Espera" value={`${event.waitlisted}`} caption={isWaitlisted ? "En espera" : "Lista activa"} />
      </div>

      <section className="grid gap-6 border-y-2 border-foreground py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <StatusBadge>{event.status}</StatusBadge>
          <span className="ml-2 inline-flex">
            <StatusBadge>{event.sourceLabel}</StatusBadge>
          </span>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-none">{event.subtitle}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">{event.description}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Info label="Fecha" value={event.date} />
            <Info label="Horario" value={event.time} />
            <Info label="Host" value={event.host} />
          </div>
        </div>
        <div className="rounded-sm bg-foreground p-5 text-paper">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-stamp">Puerta</p>
          <p className="mt-3 text-5xl font-black">{event.point}</p>
          <p className="mt-6 text-sm leading-6 text-paper/70">{event.location}</p>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
        <section>
          <h2 className="mb-4 text-3xl font-black">Quienes hacen escala</h2>
          <div className="grid gap-0 border-y-2 border-foreground">
            {attendees.length ? (
              attendees.map(({ member, checkedIn }) => (
                <div className="grid gap-3 border-b border-line py-4 last:border-b-0 md:grid-cols-[56px_minmax(0,1fr)_120px]" key={member.id}>
                  <span className="grid size-12 place-items-center rounded-sm bg-foreground text-sm font-black text-paper">
                    {member.avatar}
                  </span>
                  <span>
                    <span className="block font-black">{member.name}</span>
                    <span className="block text-sm text-ink-muted">
                      {member.role} · {member.company}
                    </span>
                  </span>
                  <span className="self-center text-sm font-black text-signal">
                    {checkedIn ? "Entrada sellada" : "Asiento"}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm leading-6 text-ink-muted">
                Todavia no hay asientos confirmados. El primer paisano aparece aca.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-black">Despues de la escala</h2>
          <div className="grid gap-4 border-y-2 border-foreground py-5">
          <Info label="Continuidad" value="Dejar notas y registrar aprendizajes" />
            <Info label="Paisaporte" value={event.usesLumaCheckIn ? "La bitacora se importa desde Luma" : "La entrada sellada suma historial real al Paisaporte"} />
            <Info label="Operacion" value={event.usesLumaCheckIn ? "Registro y puerta se gestionan desde Luma" : "La torre puede sellar asistencia desde Puerta"} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground pt-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-2 text-sm font-black">{value}</p>
    </div>
  );
}
