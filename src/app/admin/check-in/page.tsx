import { Search, ShieldCheck, TicketCheck } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { PrimaryButton, StatusBadge } from "@/components/ui";
import { checkInMember } from "@/lib/actions";
import { getEventAttendees, getEvents, requireAdmin } from "@/lib/community";

export default async function AdminCheckInPage() {
  const { supabase } = await requireAdmin();
  const events = await getEvents(supabase, { includeDrafts: true });
  const event = events.find((item) => item.rawStatus === "active" || item.rawStatus === "published") ?? events[0];
  const attendees = event ? await getEventAttendees(supabase, event.id) : [];

  return (
    <AdminShell
      eyebrow="Entrada del evento"
      title="Check-in staff"
      actions={
        <PrimaryButton>
          <TicketCheck size={17} />
          Escanear QR
        </PrimaryButton>
      }
    >
      {event ? (
        <>
          <section className="border-y-2 border-foreground py-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge>{event.status}</StatusBadge>
                  <span className="text-sm text-ink-muted">{event.date}</span>
                </div>
                <h2 className="text-3xl font-black">{event.title}</h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {event.confirmed}/{event.capacity} confirmados · {event.location}
                </p>
              </div>
              <div className="rounded-sm bg-foreground p-4 text-paper">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">Punto</p>
                <p className="mt-2 text-4xl font-black">{event.point}</p>
              </div>
            </div>
          </section>

          <section className="border-b-2 border-foreground pb-4">
            <div className="flex items-center gap-3 border-b border-line px-3 py-3">
              <Search className="text-ink-muted" size={18} />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Buscar por nombre" />
            </div>
          </section>

          <section className="border-y-2 border-foreground">
            {attendees.length ? (
              attendees.map(({ member, checkedIn }) => (
                <div className="grid gap-3 border-b border-line py-4 last:border-b-0 md:grid-cols-[1fr_180px_170px]" key={member.id}>
                  <div className="flex gap-3">
                    <span className="grid size-10 place-items-center rounded-sm bg-foreground text-sm font-black text-paper">
                      {member.avatar}
                    </span>
                    <span>
                      <span className="block font-black">{member.name}</span>
                      <span className="block text-sm text-ink-muted">{member.company}</span>
                    </span>
                  </div>
                  <span className="self-center text-sm text-ink-muted">
                    {checkedIn ? "Check-in realizado" : "RSVP confirmado"}
                  </span>
                  <form action={checkInMember}>
                    <input name="event_id" type="hidden" value={event.id} />
                    <input name="user_id" type="hidden" value={member.userId} />
                    <button
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-signal px-3 text-sm font-black text-foreground disabled:opacity-50"
                      disabled={checkedIn}
                    >
                      <ShieldCheck size={16} />
                      {checkedIn ? "Presente" : "Marcar entrada"}
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="py-5 text-sm leading-6 text-ink-muted">
                Todavia no hay RSVP para este evento. Cuando alguien confirme, aparece aca para check-in manual.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="border-t-2 border-foreground pt-5">
          <h2 className="text-2xl font-black">No hay eventos creados</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Crea un evento desde Gestion de eventos para abrir check-in.
          </p>
        </section>
      )}
    </AdminShell>
  );
}
