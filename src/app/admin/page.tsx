import Link from "next/link";
import {
  AlertTriangle,
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  Plane,
  ShieldCheck,
  TicketCheck,
  UsersRound,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { MetricTile, PrimaryLink, SecondaryLink, StatusBadge } from "@/components/ui";
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
      eyebrow="Torre de control"
      title="Admin Paisanos"
      actions={
        <div className="flex flex-wrap gap-2">
          <PrimaryLink href="/admin/events">
            <Plane size={17} />
            Crear evento
          </PrimaryLink>
          <SecondaryLink href="/admin/check-in">
            <TicketCheck size={17} />
            Abrir check-in
          </SecondaryLink>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <MetricTile icon={UsersRound} label="Miembros" value={`${members.length}`} caption="Activos reales" />
        <MetricTile icon={Plane} label="Eventos" value={`${events.length}`} caption="Incluye borradores" />
        <MetricTile icon={ShieldCheck} label="Waitlist" value={`${pendingWaitlist}`} caption="Pendientes" />
        <MetricTile icon={ClipboardCheck} label="Feedback" value={`${feedbackProcesses.length}`} caption="Procesos visibles" />
        <MetricTile icon={ChartNoAxesColumnIncreasing} label="Check-ins" value={`${checkedIn}/${confirmed}`} caption="Sobre RSVP" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border-t-2 border-foreground pt-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black">Operacion de eventos</h2>
            <StatusBadge>Real</StatusBadge>
          </div>
          <div className="grid gap-0 border-y-2 border-foreground">
            {events.map((event) => (
              <article className="grid gap-3 border-b border-line py-4 last:border-b-0 md:grid-cols-[1fr_140px]" key={event.id}>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge>{event.status}</StatusBadge>
                    <span className="text-sm text-ink-muted">{event.point}</span>
                  </div>
                  <h3 className="font-black">{event.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {event.date} · {event.time} · {event.location}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
                    Confirmados
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {event.confirmed}/{event.capacity}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t-2 border-foreground pt-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-signal" size={20} />
            <h2 className="text-3xl font-black">Atajos de decision</h2>
          </div>
          <div className="grid gap-3">
            <Action title="Aprobar waitlist" copy={`${pendingWaitlist} perfiles esperan revision del equipo.`} href="/admin/waitlist" />
            <Action title="Revisar asistentes" copy="RSVP y check-ins ya escriben en Supabase." href="/admin/check-in" />
            <Action title="Cerrar preguntas de feedback" copy="Procesos reales listos para conectar respuestas." href="/admin/feedback" />
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
