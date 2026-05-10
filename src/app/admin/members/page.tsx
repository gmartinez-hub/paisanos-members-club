import { Search, UserPlus, UsersRound } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { MetricTile, Panel, PrimaryLink } from "@/components/ui";
import { getMembers, requireAdmin } from "@/lib/community";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() ?? "";
  const { supabase } = await requireAdmin();
  const allMembers = await getMembers(supabase);
  const members = allMembers.filter((member) => {
    if (!query) {
      return true;
    }

    return `${member.name} ${member.company} ${member.focus} ${member.role}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <AdminShell
      eyebrow="Curaduria"
      title="Miembros"
      actions={
        <PrimaryLink href="/admin/waitlist">
          <UserPlus size={17} />
          Revisar waitlist
        </PrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile icon={UsersRound} label="Total" value={`${allMembers.length}`} caption="Activos reales" />
        <MetricTile icon={UserPlus} label="Invitables" value="-" caption="Desde waitlist" />
        <MetricTile icon={Search} label="Skills" value={`${new Set(members.flatMap((member) => member.skills)).size}`} caption="Tags distintos" />
      </div>

      <Panel className="p-4">
        <form action="/admin/members" className="flex items-center gap-3 rounded-sm border border-line bg-background px-3 py-3">
          <Search className="text-ink-muted" size={18} />
          <input
            className="w-full bg-transparent text-sm outline-none"
            defaultValue={params?.q ?? ""}
            name="q"
            placeholder="Buscar miembro"
          />
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="grid border-b border-line bg-background px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-muted md:grid-cols-[1.2fr_1fr_0.6fr_1fr]">
          <span>Miembro</span>
          <span>Foco</span>
          <span>Eventos</span>
          <span>Ultimo contacto</span>
        </div>
        {members.map((member) => (
          <div className="grid gap-3 border-b border-line px-4 py-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_0.6fr_1fr]" key={member.id}>
            <div className="flex gap-3">
              <span className="grid size-10 place-items-center rounded-sm bg-runway text-sm font-bold text-paper">
                {member.avatar}
              </span>
              <div>
                <h2 className="font-semibold">{member.name}</h2>
                <p className="text-sm text-ink-muted">{member.company}</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-runway">{member.focus}</p>
            <p className="text-sm font-semibold">{member.attendedEvents}</p>
            <p className="text-sm text-ink-muted">{member.lastInteraction}</p>
          </div>
        ))}
      </Panel>
    </AdminShell>
  );
}
