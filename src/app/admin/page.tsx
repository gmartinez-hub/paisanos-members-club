import Link from "next/link";
import {
  AlertTriangle,
  Plane,
  TicketCheck,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminMetricTile, PrimaryLink, SecondaryLink, StatusBadge } from "@/components/ui";
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
      eyebrow="Torre Paisanos"
      title="Operacion de la bitacora"
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryLink href="/admin/events">
            <Plane size={17} />
            Crear escala
          </PrimaryLink>
          <SecondaryLink href="/admin/check-in">
            <TicketCheck size={17} />
            Abrir puerta
          </SecondaryLink>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <AdminMetricTile color="cel" label="Paisaportes" value={`${members.length}`} caption="Activos reales" />
        <AdminMetricTile color="och" label="Escalas" value={`${events.length}`} caption="Incluye borradores" />
        <AdminMetricTile color="mal" label="Accesos" value={`${pendingWaitlist}`} caption="Pendientes" />
        <AdminMetricTile color="sag" label="Notas" value={`${feedbackProcesses.length}`} caption="Lecturas visibles" />
        <AdminMetricTile color="ter" label="Sellos" value={`${checkedIn}/${confirmed}`} caption="Sobre asientos" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border-t border-a-line pt-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-a-ink">Operacion de escalas</h2>
            <StatusBadge>Real</StatusBadge>
          </div>
          <div className="grid gap-3">
            {events.map((event) => (
              <article className="ticket-edge-parch grid gap-3 border border-a-line bg-parch-2 p-4 md:grid-cols-[1fr_140px]" key={event.id}>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge>{event.status}</StatusBadge>
                    <StatusBadge>{event.sourceLabel}</StatusBadge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/55">{event.point}</span>
                  </div>
                  <h3 className="font-black text-a-ink">{event.title}</h3>
                  <p className="mt-1 text-sm text-a-ink/70">
                    {event.date} · {event.time} · {event.location}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
                    Asientos
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {event.confirmed}/{event.capacity}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-a-line pt-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-signal" size={20} />
            <h2 className="text-3xl font-black text-a-ink">Atajos de torre</h2>
          </div>
          <div className="grid gap-3">
            <Action title="Revisar accesos" copy={`${pendingWaitlist} solicitudes esperan revision de la torre.`} href="/admin/waitlist" />
            <Action title="Sellar entradas" copy="Asientos y entradas ya escriben en Supabase." href="/admin/check-in" />
            <Action title="Cerrar notas de viaje" copy="Lecturas reales listas para conectar respuestas." href="/admin/feedback" />
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Action({ title, copy, href }: { copy: string; href: string; title: string }) {
  return (
    <Link className="block border-t border-foreground pt-4 transition hover:text-signal" href={href}>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p>
    </Link>
  );
}
