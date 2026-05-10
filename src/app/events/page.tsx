import Link from "next/link";
import { CalendarDays, ExternalLink, Plus, TicketCheck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricTile, PrimaryLink, StatusBadge } from "@/components/ui";
import { rsvpToEvent, cancelRsvp } from "@/lib/actions";
import { getEvents, requireMember, type EventView } from "@/lib/community";

export default async function EventsPage() {
  const { profile, supabase, user } = await requireMember();
  const events = await getEvents(supabase, { viewerId: user.id });
  const nextEvent = events[0];
  const totalRsvps = events.reduce((sum, event) => sum + event.confirmed, 0);

  return (
    <AppShell
      eyebrow="Agenda del club"
      isAdmin={profile.is_admin}
      title="Encuentros para mover proyectos"
      actions={
        <PrimaryLink href="/opportunities">
          <Plus size={17} />
          Proponer en Radar
        </PrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile icon={CalendarDays} label="Programados" value={`${events.length}`} caption={nextEvent ? `Proximo: ${nextEvent.date}` : "Sin publicados"} />
        <MetricTile icon={UsersRound} label="RSVP totales" value={`${totalRsvps}`} caption="Desde Supabase" />
        <MetricTile icon={TicketCheck} label="Check-in digital" value="Listo" caption="Staff + QR token" />
      </div>

      <div className="grid gap-0 border-y-2 border-foreground">
        {events.length ? (
          events.map((event) => <EventRow event={event} key={event.id} />)
        ) : (
          <div className="py-6">
            <h2 className="text-2xl font-black">Todavia no hay eventos publicados</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando el admin publique uno, los miembros van a poder hacer RSVP desde aca.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EventRow({ event }: { event: EventView }) {
  const isConfirmed = event.userRsvpStatus === "confirmed";

  return (
    <article className="grid gap-5 border-b-2 border-foreground py-6 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge>{event.status}</StatusBadge>
          <StatusBadge>{event.sourceLabel}</StatusBadge>
          {event.tags.map((tag) => (
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink-muted" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/events/${event.id}`}>
          <h2 className="text-3xl font-black leading-none hover:underline hover:decoration-signal hover:decoration-4">
            {event.title}
          </h2>
        </Link>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
          {event.description}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Info label="Fecha" value={event.date} />
          <Info label="Horario" value={event.time} />
          <Info label="Lugar" value={event.location} />
        </div>
      </div>

      <div className="grid content-start gap-3">
        <div className="rounded-sm bg-foreground p-4 text-paper">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">Confirmados</p>
          <p className="mt-2 text-4xl font-black">{event.confirmed}/{event.capacity}</p>
        </div>
        {event.usesLumaRegistration ? (
          event.lumaUrl ? (
            <PrimaryLink href={event.lumaUrl} target="_blank">
              <ExternalLink size={17} />
              Anotarme en Luma
            </PrimaryLink>
          ) : (
            <p className="rounded-sm border border-line bg-background px-3 py-3 text-sm font-semibold text-ink-muted">
              Registro en Luma pendiente
            </p>
          )
        ) : (
          <form action={isConfirmed ? cancelRsvp : rsvpToEvent}>
            <input name="event_id" type="hidden" value={event.id} />
            <button className="flex h-11 w-full items-center justify-center rounded-sm bg-signal px-4 text-sm font-black text-foreground transition hover:bg-stamp">
              {isConfirmed ? "Cancelar RSVP" : "Hacer RSVP"}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground pt-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}
