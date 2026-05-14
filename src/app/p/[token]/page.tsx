import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Handshake, Link2, PenLine, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PassportCard } from "@/components/passport-card";
import { MetricTile, PrimaryLink, SecondaryLink } from "@/components/ui";
import { getMembers, requireMember } from "@/lib/community";

export default async function PrivatePassportProfilePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { profile, supabase, user } = await requireMember();
  const members = await getMembers(supabase);
  const member = members.find((item) => item.userId === decodeURIComponent(token));

  if (!member) {
    notFound();
  }

  const isOwnProfile = member.userId === user.id;

  return (
    <AppShell
      eyebrow="Perfil privado"
      isAdmin={profile.is_admin}
      title={member.name}
      actions={
        <div className="flex flex-wrap gap-2">
          <SecondaryLink href="/directory">
            <ArrowLeft size={17} />
            Miembros
          </SecondaryLink>
          {isOwnProfile ? (
            <PrimaryLink href="/passport/edit">
              <PenLine size={17} />
              Editar
            </PrimaryLink>
          ) : null}
        </div>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <PassportCard member={member} />

        <div className="grid content-start gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricTile icon={BadgeCheck} label="Paisaporte" value="Activo" caption="Visible para miembros" />
            <MetricTile icon={Handshake} label="Eventos" value={`${member.attendedEvents}`} caption="Entradas registradas" />
            <MetricTile icon={ShieldCheck} label="Privacidad" value="Club" caption="No es publico abierto" />
          </div>

          <section className="border-y-2 border-foreground py-5">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-signal-dark">
              Contexto
            </p>
            <h2 className="mt-2 text-3xl font-black">Por que puede valer un cruce</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Info label="Rol" value={`${member.role} · ${member.company}`} />
              <Info label="Ubicacion" value={member.location} />
              <Info label="Foco actual" value={member.focus} />
              <Info label="Disponibilidad" value={member.availability} />
              <Info className="md:col-span-2" label="Que construye" value={member.building} />
              <Info className="md:col-span-2" label="Busca" value={member.lookingFor} />
              <Info className="md:col-span-2" label="Puede aportar" value={member.canHelpWith} />
              <Info className="md:col-span-2" label="Cruces que le sirven" value={member.openTo} />
            </div>
          </section>

          <section className="border-t border-line pt-5">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="text-signal" size={20} />
              <h2 className="text-2xl font-black">Tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.skills.length ? (
                member.skills.map((skill) => (
                  <span className="rounded-sm border border-foreground bg-paper px-3 py-2 text-xs font-black uppercase tracking-[0.12em]" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm leading-6 text-ink-muted">
                  Este Paisaporte todavia no tiene habilidades cargadas.
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function Info({
  className = "",
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={`border-t border-line pt-3 ${className}`}>
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-2 text-sm font-black leading-6 text-foreground">{value}</p>
    </div>
  );
}
