import { ExternalLink, Save } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { PrimaryButton, SecondaryLink, StatusBadge } from "@/components/ui";
import { createEvent } from "@/lib/actions";
import { getEvents, requireAdmin } from "@/lib/community";

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();
  const events = await getEvents(supabase, { includeDrafts: true });

  return (
    <AdminShell
      eyebrow="Operacion"
      title="Gestion de eventos"
    >
      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <section className="border-t-2 border-foreground pt-5">
          <h2 className="mb-4 text-3xl font-black">Eventos cargados</h2>
          <div className="grid gap-0 border-y-2 border-foreground">
            {events.map((event) => (
              <article className="grid gap-3 border-b border-line py-4 last:border-b-0 md:grid-cols-[1fr_150px]" key={event.id}>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <StatusBadge>{event.status}</StatusBadge>
                    <StatusBadge>{event.sourceLabel}</StatusBadge>
                    <span className="text-sm text-ink-muted">{event.point}</span>
                  </div>
                  <h3 className="font-black">{event.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {event.date} · {event.location}
                  </p>
                </div>
                {event.lumaUrl ? (
                  <SecondaryLink href={event.lumaUrl} target="_blank">
                    <ExternalLink size={17} />
                    Ver Luma
                  </SecondaryLink>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-foreground pt-5">
          <h2 className="text-3xl font-black">Crear evento real</h2>
          <form action={createEvent} className="mt-5 grid gap-4">
            <Field label="Titulo" name="title" placeholder="Founders Night" />
            <Field label="Subtitulo" name="subtitle" placeholder="Mesa chica para builders" />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Fuente del evento
              <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="source" defaultValue="luma">
                <option value="luma">Luma: registro y puerta fuera de Paisanos</option>
                <option value="paisanos">Paisanos: RSVP y check-in nativos</option>
              </select>
            </label>
            <Field label="URL de Luma" name="luma_url" placeholder="https://luma.com/..." required={false} type="url" />
            <Field label="ID de Luma" name="luma_event_id" placeholder="Opcional para sync futura" required={false} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha" name="date" type="date" />
              <Field label="Hora" name="time" type="time" />
            </div>
            <Field label="Lugar" name="location" placeholder="Paisanos HQ" />
            <Field label="Host" name="host" placeholder="Paisanos" />
            <Field label="Capacidad" name="capacity" placeholder="30" type="number" />
            <Field label="Tags" name="tags" placeholder="Producto, AI, Founders" required={false} />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Estado
              <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="status" defaultValue="draft">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black text-foreground">
              Descripcion
              <textarea
                className="min-h-28 resize-none rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
                name="description"
                placeholder="Que va a pasar y por que vale la pena ir."
              />
            </label>
            <PrimaryButton>
              <Save size={17} />
              Guardar evento
            </PrimaryButton>
          </form>
        </section>
      </div>
    </AdminShell>
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
