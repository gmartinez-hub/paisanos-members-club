import { ExternalLink, Save, TicketsPlane } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryLink,
  AdminStatusBadge,
} from "@/components/ui";
import { createEvent, syncLumaGuests } from "@/lib/actions";
import { isLumaApiConfigured, isLumaWebhookConfigured } from "@/lib/luma";
import { getEvents, requireAdmin } from "@/lib/community";

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();
  const events = await getEvents(supabase, { includeDrafts: true });
  const lumaApiReady = isLumaApiConfigured();
  const lumaWebhookReady = isLumaWebhookConfigured();

  return (
    <AdminShell
      eyebrow="Eventos"
      title="Gestion de eventos"
    >
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="grid gap-4">
          <AdminPanel className="grid gap-3 p-4 md:grid-cols-3">
            <LumaState label="API Luma" ready={lumaApiReady} />
            <LumaState label="Webhook Luma" ready={lumaWebhookReady} />
            <LumaState label="Modo externo" ready />
          </AdminPanel>

          <div className="flex items-end justify-between gap-4 border-t border-a-line pt-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-a-och-t">Listado</p>
              <h2 className="mt-1 text-3xl font-black text-a-ink">Eventos cargados</h2>
            </div>
            <AdminStatusBadge>{events.length} total</AdminStatusBadge>
          </div>

          <div className="grid gap-3">
            {events.map((event) => (
              <AdminPanel className="p-4" key={event.id}>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <AdminStatusBadge>{event.status}</AdminStatusBadge>
                    <AdminStatusBadge>{event.sourceLabel}</AdminStatusBadge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/55">{event.point}</span>
                  </div>
                  <h3 className="break-words text-xl font-black text-a-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-a-ink/70">
                    {event.date} · {event.location}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 border-t border-a-line pt-3 md:grid-cols-[1fr_auto]">
                  <div className="grid gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-a-ink/55 sm:grid-cols-3">
                    <span>ASIENTOS {event.confirmed}/{event.capacity || "-"}</span>
                    <span>SYNC {event.syncStatus}</span>
                    <span>{event.lumaLastSyncedAt ?? "Sin sync"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.lumaUrl ? (
                      <AdminSecondaryLink href={event.lumaUrl} target="_blank">
                        <ExternalLink size={17} />
                        Ver Luma
                      </AdminSecondaryLink>
                    ) : null}
                    {event.source === "luma" ? (
                      <form action={syncLumaGuests}>
                        <input name="event_id" type="hidden" value={event.id} />
                        <button
                          className="inline-flex h-10 items-center justify-center rounded-sm border border-a-line px-3 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-a-ink transition-colors hover:border-a-ink hover:bg-a-och/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={!lumaApiReady || !event.lumaEventId}
                        >
                          Sincronizar invitados
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </AdminPanel>
            ))}
          </div>
        </section>

        <AdminPanel className="p-5">
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-a-och-t">
            <TicketsPlane size={15} />
            Nuevo evento
          </p>
          <h2 className="mt-1 text-balance text-3xl font-black text-a-ink">Crear evento</h2>
          <form action={createEvent} className="mt-5 grid gap-4">
            <Field label="Nombre del evento" name="title" placeholder="Founders Night…" />
            <Field label="Nota breve" name="subtitle" placeholder="Mesa chica para builders…" />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Origen del registro
              <select className={adminControlClass} name="source" defaultValue="paisanos" autoComplete="off">
                <option value="paisanos">Paisanos: asiento y puerta propios</option>
                <option value="luma">Luma: registro externo</option>
              </select>
            </label>
            <Field label="URL de Luma" name="luma_url" placeholder="https://luma.com/…" required={false} type="url" />
            <Field label="ID de Luma" name="luma_event_id" placeholder="evt-… para sync futura" required={false} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha" name="date" type="date" />
              <Field label="Hora" name="time" type="time" />
            </div>
            <Field label="Lugar" name="location" placeholder="Paisanos HQ…" />
            <Field label="Host" name="host" placeholder="Paisanos…" />
            <Field label="Asientos" inputMode="numeric" name="capacity" placeholder="30" type="number" />
            <Field label="Tags" name="tags" placeholder="Producto, AI, Founders…" required={false} />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Estado
              <select className={adminControlClass} name="status" defaultValue="draft" autoComplete="off">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-foreground">
              Bitacora del evento
              <textarea
                className={`${adminControlClass} min-h-28 resize-none`}
                name="description"
                placeholder="Que va a pasar, por que suma y que cruces deberian abrirse…"
              />
            </label>
            <AdminPrimaryButton>
              <Save size={17} />
              Guardar evento
            </AdminPrimaryButton>
          </form>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}

const adminControlClass =
  "rounded-sm border border-a-line bg-parch px-3 py-3 text-a-ink outline-none transition-colors placeholder:text-a-ink/35 focus-visible:border-a-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t";

function LumaState({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="border-t border-a-line pt-3">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-a-ink/45">{label}</p>
      <p className="mt-1 text-lg font-black text-a-ink">{ready ? "Listo" : "Pendiente"}</p>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = true,
  type = "text",
  inputMode,
}: {
  inputMode?: "numeric";
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-foreground">
      {label}
      <input
        autoComplete="off"
        className={adminControlClass}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}
