import { Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SecondaryButton } from "@/components/ui";
import { getMembers, requireMember, type MemberView } from "@/lib/community";

export default async function DirectoryPage() {
  const { supabase } = await requireMember();
  const members = await getMembers(supabase);
  const topics = Array.from(new Set(members.flatMap((member) => member.skills))).slice(0, 10);

  return (
    <AppShell
      eyebrow="Mapa vivo"
      title="Personas, contexto y posibles cruces"
      actions={
        <SecondaryButton>
          <SlidersHorizontal size={17} />
          Filtros
        </SecondaryButton>
      }
    >
      <section className="grid gap-6 border-y-2 border-foreground py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div>
          <div className="flex items-center gap-3 border-b-2 border-foreground pb-3">
            <Search className="text-signal" size={22} />
            <input
              className="w-full bg-transparent text-lg font-black outline-none placeholder:text-ink-muted"
              placeholder="Buscar persona, tema o proyecto"
            />
          </div>

          {topics.length ? (
            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
                Temas activos
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    className="rounded-sm border border-foreground bg-paper px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-stamp"
                    key={topic}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 border-t border-line pt-5">
            <UsersRound className="mb-4 text-signal" size={22} />
            <p className="text-4xl font-black leading-none">{members.length}</p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Miembros demo con contexto editable. La unidad no es categoria: es intencion, aporte y necesidad.
            </p>
          </div>
        </div>

        <div className="grid gap-0 border-y border-line lg:border-y-0">
          {members.length ? (
            members.map((member) => <DirectoryRow key={member.id} member={member} />)
          ) : (
            <div className="py-6">
              <h2 className="text-2xl font-black">Todavia no hay miembros activos</h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                A medida que se activen Paisaportes, este mapa empieza a mostrar contexto real.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function DirectoryRow({ member }: { member: MemberView }) {
  return (
    <article className="grid gap-5 border-b border-line py-6 last:border-b-0 xl:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid size-14 place-items-center rounded-sm bg-foreground text-sm font-black text-paper">
        {member.avatar}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-black">{member.name}</h2>
          <span className="rounded-sm bg-stamp px-2 py-1 text-xs font-black text-foreground">
            {member.availability}
          </span>
        </div>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          {member.role} · {member.company} · {member.location}
        </p>
        <p className="marker mt-4 inline text-base font-black">{member.focus}</p>
        <p className="mt-4 text-sm leading-6 text-ink-muted">{member.building}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoBlock label="Puede aportar" value={member.canHelpWith} />
        <InfoBlock label="Busca" value={member.lookingFor} />
        <InfoBlock label="Abierto a" value={member.openTo} />
        <InfoBlock label="Ultimo contacto" value={member.lastInteraction} />
      </div>
    </article>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-foreground pt-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-signal">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{value}</p>
    </div>
  );
}
