import { BadgeCheck, History, Link2, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PassportCard } from "@/components/passport-card";
import { MetricTile } from "@/components/ui";
import { getEvents, getMembers, profileToMember, requireMember } from "@/lib/community";

export default async function PassportPage() {
  const { profile, supabase, user } = await requireMember();
  const [members, events] = await Promise.all([
    getMembers(supabase),
    getEvents(supabase, { viewerId: user.id }),
  ]);
  const currentMember =
    members.find((member) => member.userId === user.id) ??
    profileToMember(profile, { attendedEvents: 0, feedbackGiven: 0 });
  const memberEvents = events.filter((event) => event.userRsvpStatus === "confirmed");

  return (
    <AppShell
      eyebrow="Identidad privada"
      isAdmin={profile.is_admin}
      title="Paisaporte"
    >
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <PassportCard member={currentMember} />
        <div className="grid content-start gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricTile icon={BadgeCheck} label="Registro" value="Real" caption="Perfil en Supabase" />
            <MetricTile icon={History} label="Eventos" value={`${currentMember.attendedEvents}`} caption="Entradas registradas" />
            <MetricTile icon={ShieldCheck} label="Estado" value={profile.is_active ? "Activo" : "Pausado"} caption="Paisaporte" />
          </div>

          <section className="border-y-2 border-foreground py-5">
            <h2 className="text-3xl font-black">Datos del Paisaporte</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre" value={currentMember.name} />
              <Field label="Oficio" value={currentMember.role} />
              <Field label="Proyecto" value={currentMember.company} />
              <Field label="Ubicacion" value={currentMember.location} />
              <Field label="Foco actual" value={currentMember.focus} />
              <Field label="Disponible para" value={currentMember.availability} />
            </div>
            <div className="mt-4">
              <Field label="Que construye" value={currentMember.building} />
            </div>
            <div className="mt-4">
              <Field label="Busca" value={currentMember.lookingFor} />
            </div>
          </section>
        </div>
      </div>

      <section className="border-t-2 border-foreground pt-6">
        <div className="mb-5 flex items-center gap-2">
          <Link2 className="text-signal" size={20} />
          <h2 className="text-3xl font-black">Historial de eventos</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {memberEvents.length ? (
            memberEvents.map((event) => (
              <article className="border-t border-foreground pt-4" key={event.id}>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">
                  {event.date}
                </p>
                <h3 className="mt-2 text-xl font-black">{event.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{event.status}</p>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-ink-muted">
              Todavia no hay asistencias ni entradas registradas para este Paisaporte.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-foreground">
      {label}
      <input
        className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
        defaultValue={value}
        readOnly
      />
    </label>
  );
}
