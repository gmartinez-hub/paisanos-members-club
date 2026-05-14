import Link from "next/link";
import {
  PlaneTakeoff,
  RadioTower,
  ScanLine,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminPanel,
  AdminMetricTile,
  AdminPrimaryLink,
  AdminSecondaryLink,
  AdminStatusBadge,
} from "@/components/ui";
import { getEvents, getFeedbackProcesses, getMembers, requireAdmin } from "@/lib/community";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [events, members, feedbackProcesses, waitlistResult] = await Promise.all([
    getEvents(supabase, { includeDrafts: true }),
    getMembers(supabase),
    getFeedbackProcesses(supabase),
    supabase.from("whitelist_requests").select("id,status").order("created_at", { ascending: false }),
  ]);
  const waitlist = waitlistResult.data ?? [];
  const pendingWaitlist = waitlist.filter((item) => item.status === "pending").length;
  const confirmed = events.reduce((sum, event) => sum + event.confirmed, 0);
  const checkedIn = events.reduce((sum, event) => sum + event.checkedIn, 0);

  return (
    <AdminShell
      eyebrow="Admin Paisanos"
      title="Panel operativo"
      actions={
        <div className="flex flex-wrap gap-2">
          <AdminPrimaryLink href="/admin/events">
            <PlaneTakeoff size={17} />
            Crear evento
          </AdminPrimaryLink>
          <AdminSecondaryLink href="/admin/check-in">
            <ScanLine size={17} />
            Abrir check-in
          </AdminSecondaryLink>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <AdminMetricTile color="cel" label="Miembros" value={`${members.length}`} caption="Activos reales" />
        <AdminMetricTile color="och" label="Eventos" value={`${events.length}`} caption="Incluye borradores" />
        <AdminMetricTile color="ter" label="Accesos" value={`${pendingWaitlist}`} caption="Whitelist pendiente" />
        <AdminMetricTile color="mal" label="Feedback" value={`${feedbackProcesses.length}`} caption="Procesos abiertos" />
        <AdminMetricTile color="sag" label="Check-in" value={`${checkedIn}/${confirmed}`} caption="Entradas / confirmados" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border-t border-a-line pt-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black text-a-ink">Eventos próximos</h2>
              <p className="mt-1 font-mono text-[11px] text-a-ink/65">Ordenados por fecha</p>
            </div>
            <AdminStatusBadge>Real</AdminStatusBadge>
          </div>
          <div className="grid gap-3">
            {events.map((event) => (
              <AdminPanel className="grid min-w-0 gap-3 p-4 md:grid-cols-[1fr_140px]" key={event.id}>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <AdminStatusBadge>{event.status}</AdminStatusBadge>
                    <AdminStatusBadge>{event.sourceLabel}</AdminStatusBadge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/55">{event.point}</span>
                  </div>
                  <h3 className="break-words font-black text-a-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-a-ink/70">
                    {event.date} · {event.time} · {event.location}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-a-ink/60">
                    Asientos
                  </p>
                  <p className="mt-1 text-2xl font-black tabular-nums">
                    {event.confirmed}/{event.capacity}
                  </p>
                </div>
              </AdminPanel>
            ))}
          </div>
        </section>

        <section className="border-t border-a-line pt-5">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <RadioTower className="text-a-och-t" size={20} />
              <h2 className="text-3xl font-black text-a-ink">Acciones rápidas</h2>
            </div>
            <p className="mt-1 font-mono text-[11px] text-a-ink/65">Tareas P0 del equipo</p>
          </div>
          <div className="grid gap-3">
            <Action title="Revisar accesos" copy={`${pendingWaitlist} solicitudes esperan revisión.`} href="/admin/waitlist" />
            <Action title="Abrir check-in" copy="Confirmaciones y entradas ya escriben en Supabase." href="/admin/check-in" />
            <Action title="Revisar feedback" copy="Lecturas reales listas para conectar respuestas." href="/admin/feedback" />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Action({ title, copy, href }: { copy: string; href: string; title: string }) {
  return (
    <Link className="block border-t border-a-line pt-4 text-a-ink transition-colors hover:text-a-och-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t" href={href}>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-a-ink/65">{copy}</p>
    </Link>
  );
}
