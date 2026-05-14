import { Camera, ExternalLink, Search, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPanel, AdminPrimaryLink, AdminSecondaryLink, AdminStatusBadge } from "@/components/ui";
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
      eyebrow="Check-in"
      title="Entradas"
      actions={
        <AdminPrimaryLink href="/admin/check-in/scan">
          <Camera size={17} />
          Scanner
        </AdminPrimaryLink>
      }
    >
      {event ? (
        <>
          <AdminPanel className="p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <AdminStatusBadge>{event.status}</AdminStatusBadge>
                  <span className="text-sm text-ink-muted">{event.date}</span>
                </div>
                <h2 className="break-words text-3xl font-black text-a-ink">{event.title}</h2>
                <p className="mt-2 text-sm text-a-ink/65">
                  {event.confirmed}/{event.capacity} asientos · {event.location}
                </p>
              </div>
              <div className="rounded-sm bg-a-ink p-4 text-parch">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">Punto</p>
                <p className="mt-2 text-4xl font-black">{event.point}</p>
              </div>
            </div>
          </AdminPanel>

          {event.usesLumaCheckIn ? (
            <section className="border-b border-a-line pb-5">
              <div className="grid gap-3 rounded-sm border border-a-line bg-parch-2 p-4 md:grid-cols-[1fr_auto]">
                <p className="text-sm leading-6 text-a-ink/70">
                  Este evento usa Luma para registro y check-in. Paisanos mantiene identidad y bitacora importada.
                </p>
                {event.lumaUrl ? (
                  <AdminSecondaryLink href={event.lumaUrl} target="_blank">
                    <ExternalLink size={17} />
                    Abrir Luma
                  </AdminSecondaryLink>
                ) : null}
              </div>
            </section>
          ) : (
            <section className="border-b border-a-line pb-4">
              <form action="/admin/check-in" className="flex items-center gap-3 border-b border-a-line px-3 py-3">
                <label className="sr-only" htmlFor="admin-checkin-search">Buscar paisano</label>
                <Search className="text-ink-muted" size={18} />
                <input
                  autoComplete="off"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-a-ink/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
                  defaultValue={params?.q ?? ""}
                  id="admin-checkin-search"
                  name="q"
                  placeholder="Buscar paisano…"
                />
              </form>
            </section>
          )}

          {!event.usesLumaCheckIn ? (
            <section className="border-y border-a-line">
              {filteredAttendees.length ? (
                filteredAttendees.map(({ member, checkedIn }) => (
                  <div className="grid gap-3 border-b border-line py-4 last:border-b-0 md:grid-cols-[1fr_180px_170px]" key={member.id}>
                    <div className="flex min-w-0 gap-3">
                      <span className="grid size-10 flex-shrink-0 place-items-center rounded-sm bg-a-ink text-sm font-black text-parch">
                        {member.avatar}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-black text-a-ink">{member.name}</span>
                        <span className="block truncate text-sm text-a-ink/65">{member.company}</span>
                      </span>
                    </div>
                    <span className="self-center text-sm text-a-ink/65">
                      {checkedIn ? "Entrada sellada" : "Asiento confirmado"}
                    </span>
                    <form action={checkInMember}>
                      <input name="event_id" type="hidden" value={event.id} />
                      <input name="user_id" type="hidden" value={member.userId} />
                      <button
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-a-ink px-3 text-sm font-black text-parch transition-colors hover:bg-a-och-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={checkedIn}
                      >
                        <ShieldCheck size={16} />
                        {checkedIn ? "Sellado" : "Sellar entrada"}
                      </button>
                    </form>
                  </div>
                ))
              ) : (
                <p className="py-5 text-sm leading-6 text-a-ink/65">
                  Todavia no hay confirmados para este evento. Cuando alguien confirme, aparece aca para hacer check-in.
                </p>
              )}
            </section>
          ) : null}
        </>
      ) : (
        <section className="border-t border-a-line pt-5">
          <h2 className="text-2xl font-black">No hay eventos creados</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Crea un evento desde Gestion de eventos para abrir check-in.
          </p>
        </section>
      )}
    </AdminShell>
  );
}
