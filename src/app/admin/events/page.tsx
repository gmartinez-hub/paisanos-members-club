import { ExternalLink, Save } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { PrimaryButton, SecondaryLink, StatusBadge } from "@/components/ui";
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
      eyebrow="Operacion"
      title="Gestion de escalas"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="grid gap-4">
          <div className="grid gap-3 border border-a-line bg-parch-2 p-4 md:grid-cols-3">
            <LumaState label="API Luma" ready={lumaApiReady} />
            <LumaState label="Webhook Luma" ready={lumaWebhookReady} />
            <LumaState label="Modo externo" ready />
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-a-line pt-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-a-och-t">Tablero de torre</p>
              <h2 className="mt-1 text-3xl font-black text-a-ink">Escalas cargadas</h2>
            </div>
            <StatusBadge>{events.length} total</StatusBadge>
          </div>

          <div className="grid gap-3">
            {events.map((event) => (
              <article className="ticket-edge-parch border border-a-line bg-parch-2 p-4" key={event.id}>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <StatusBadge>{event.status}</StatusBadge>
                    <StatusBadge>{event.sourceLabel}</StatusBadge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/55">{event.point}</span>
                  </div>
                  <h3 className="text-xl font-black text-a-ink">{event.title}</h3>
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
                      <SecondaryLink href={event.lumaUrl} target="_blank">
                        <ExternalLink size={17} />
                        Ver Luma
                      </SecondaryLink>
                    ) : null}
                    {event.source === "luma" ? (
                      <form action={syncLumaGuests}>
                        <input name="event_id" type="hidden" value={event.id} />
                        <button
                          className="inline-flex h-10 items-center justify-center rounded-sm border border-a-line px-3 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-a-ink disabled:cursor-not-allowed disabled:opacity-45"
                          disabled={!lumaApiReady || !event.lumaEventId}
                        >
                          Sincronizar invitados
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-a-line bg-parch-2 p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-a-och-t">Nueva escala</p>
          <h2 className="mt-1 text-3xl font-black text-a-ink">Crear escala</h2>
          <form action={createEvent} className="mt-5 grid gap-4">
            <Field label="Nombre de la escala" name="title" placeholder="Founders Night" />
            <Field label="Nota breve" name="subtitle" placeholder="Mesa chica para builders" />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Origen del registro
              <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="source" defaultValue="paisanos">
                <option value="paisanos">Paisanos: asiento y puerta propios</option>
                <option value="luma">Luma: registro externo</option>
              </select>
            </label>
            <Field label="URL de Luma" name="luma_url" placeholder="https://luma.com/..." required={false} type="url" />
            <Field label="ID de Luma" name="luma_event_id" placeholder="evt-... para sync futura" required={false} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha" name="date" type="date" />
              <Field label="Hora" name="time" type="time" />
            </div>
            <Field label="Lugar" name="location" placeholder="Paisanos HQ" />
            <Field label="Host" name="host" placeholder="Paisanos" />
            <Field label="Asientos" name="capacity" placeholder="30" type="number" />
            <Field label="Tags" name="tags" placeholder="Producto, AI, Founders" required={false} />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Estado
              <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="status" defaultValue="draft">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-foreground">
              Bitacora de la escala
              <textarea
                className="min-h-28 resize-none rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
                name="description"
                placeholder="Que va a pasar, por que suma y que cruces deberian abrirse."
              />
            </label>
            <PrimaryButton>
              <Save size={17} />
              Guardar escala
            </PrimaryButton>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}

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
}: {
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
        className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}
