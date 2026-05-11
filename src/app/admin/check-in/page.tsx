import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { SecondaryLink, StatusBadge } from "@/components/ui";
import { checkInMember } from "@/lib/actions";
import { getEventAttendees, getEvents, requireAdmin } from "@/lib/community";

export default async function AdminCheckInPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() ?? "";
  const { supabase } = await requireAdmin();
  const events = await getEvents(supabase, { includeDrafts: true });
  const event = events.find((item) => item.rawStatus === "active" || item.rawStatus === "published") ?? events[0];
  const attendees = event ? await getEventAttendees(supabase, event.id) : [];
  const filteredAttendees = attendees.filter(({ member }) => {
    if (!query) {
      return true;
    }

    return `${member.name} ${member.company} ${member.role}`.toLowerCase().includes(query);
  });

  return (
    <AdminShell
      eyebrow="Puerta de embarque"
      title="Sellar entradas"
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
                  {event.confirmed}/{event.capacity} asientos · {event.location}
                </p>
              </div>
              <div className="rounded-sm bg-foreground p-4 text-paper">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">Puerta</p>
                <p className="mt-2 text-4xl font-black">{event.point}</p>
              </div>
            </div>
          </section>

          {event.usesLumaCheckIn ? (
            <section className="border-b-2 border-foreground pb-5">
              <div className="grid gap-3 rounded-sm border border-line bg-background p-4 md:grid-cols-[1fr_auto]">
                <p className="text-sm leading-6 text-ink-muted">
                  Esta escala usa Luma como puerta. Paisanos queda como capa de identidad y bitacora importada.
                </p>
                {event.lumaUrl ? (
                  <SecondaryLink href={event.lumaUrl} target="_blank">
                    <ExternalLink size={17} />
                    Abrir Luma
                  </SecondaryLink>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="border-b-2 border-foreground pb-4">
              <form action="/admin/check-in" className="flex items-center gap-3 border-b border-line px-3 py-3">
                <Search className="text-ink-muted" size={18} />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  defaultValue={params?.q ?? ""}
                  name="q"
                  placeholder="Buscar paisano"
                />
              </form>
            </section>
          )}

          {!event.usesLumaCheckIn ? (
            <section className="border-y-2 border-foreground">
              {filteredAttendees.length ? (
                filteredAttendees.map(({ member, checkedIn }) => (
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
                      {checkedIn ? "Entrada sellada" : "Asiento confirmado"}
                    </span>
                    <form action={checkInMember}>
                      <input name="event_id" type="hidden" value={event.id} />
                      <input name="user_id" type="hidden" value={member.userId} />
                      <button
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-signal px-3 text-sm font-black text-foreground disabled:opacity-50"
                        disabled={checkedIn}
                      >
                        <ShieldCheck size={16} />
                        {checkedIn ? "Sellado" : "Sellar entrada"}
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <p className="py-5 text-sm leading-6 text-ink-muted">
                  Todavia no hay asientos para esta escala. Cuando alguien confirme, aparece aca para sellar entrada.
                </p>
              )}
            </section>
          ) : null}
        </>
      ) : (
        <section className="border-t-2 border-foreground pt-5">
          <h2 className="text-2xl font-black">No hay escalas creadas</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Crea una escala desde Gestion de escalas para abrir puerta.
          </p>
        </section>
      )}
    </AdminShell>
  );
}
