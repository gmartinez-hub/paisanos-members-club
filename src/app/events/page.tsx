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
      eyebrow="Escalas Paisanos"
      isAdmin={profile.is_admin}
      title="Proximas escalas"
      actions={
        <PrimaryLink href="/opportunities">
          <Plus size={17} />
          Dejar una senal
        </PrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile icon={CalendarDays} label="Escalas" value={`${events.length}`} caption={nextEvent ? `Proxima: ${nextEvent.date}` : "Sin publicadas"} />
        <MetricTile icon={UsersRound} label="Asientos" value={`${totalRsvps}`} caption="Confirmados" />
        <MetricTile icon={TicketCheck} label="Puerta digital" value="Lista" caption="Sello + QR" />
      </div>

      <div className="grid gap-4">
        {events.length ? (
          events.map((event) => <EventRow event={event} key={event.id} />)
        ) : (
          <div className="py-6">
            <h2 className="text-2xl font-black">Todavia no hay escalas publicadas</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando la torre publique una, vas a poder confirmar asiento desde aca.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EventRow({ event }: { event: EventView }) {
  const isConfirmed = event.userRsvpStatus === "confirmed";
  const isWaitlisted = event.userRsvpStatus === "waitlist";
  const hasNativeRsvp = isConfirmed || isWaitlisted;
  const flightCode = event.usesLumaRegistration ? "LUMA" : "PMC";

  return (
    <article className="ticket-edge-bg overflow-hidden rounded-none border border-line bg-paper shadow-[0_8px_28px_rgba(12,26,38,.08)]">
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge>{event.status}</StatusBadge>
            <StatusBadge>{event.sourceLabel}</StatusBadge>
            {event.tags.map((tag) => (
              <span className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-muted" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <Link href={`/events/${event.id}`}>
            <h2 className="max-w-3xl text-3xl font-black leading-none hover:underline hover:decoration-signal hover:decoration-4">
              {event.title}
            </h2>
          </Link>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-muted">
            {event.description}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Info label="Codigo" value={`${flightCode}-${event.id.slice(0, 4).toUpperCase()}`} />
            <Info label="Lugar" value={event.location} />
            <Info label="Salida" value={`${event.date} · ${event.time}`} />
          </div>
        </div>

        <div className="grid content-start gap-3">
          <div className="bg-runway p-4 text-paper">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-stamp">Asientos</p>
            <p className="mt-2 text-4xl font-black leading-none">{event.confirmed}/{event.capacity}</p>
            {event.waitlisted ? (
              <p className="mt-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-paper/70">
                {event.waitlisted} en espera
              </p>
            ) : null}
          </div>
          {event.usesLumaRegistration ? (
            event.lumaUrl ? (
              <PrimaryLink href={event.lumaUrl} target="_blank">
                <ExternalLink size={17} />
                Reservar en Luma
              </PrimaryLink>
            ) : (
              <p className="rounded-sm border border-line bg-background px-3 py-3 text-sm font-semibold text-ink-muted">
                Enlace Luma pendiente
              </p>
            )
          ) : (
            <form action={hasNativeRsvp ? cancelRsvp : rsvpToEvent}>
              <input name="event_id" type="hidden" value={event.id} />
              <button className="flex h-11 w-full items-center justify-center rounded-sm bg-signal px-4 text-sm font-black text-foreground transition-colors hover:bg-stamp">
                {hasNativeRsvp ? "Soltar asiento" : event.isFull ? "Entrar en espera" : "Confirmar asiento"}
              </button>
              {isWaitlisted ? (
                <p className="mt-2 text-xs font-semibold text-ink-muted">
                  Quedaste en lista de espera.
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>

      <div className="perforation" />

      <div className="flex flex-wrap items-center justify-between gap-3 bg-background px-5 py-3">
        <div className="barcode h-5 min-w-48 flex-1" aria-hidden="true" />
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          {event.usesLumaRegistration ? "Registro Luma" : "Asiento Paisanos"}
        </p>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}
