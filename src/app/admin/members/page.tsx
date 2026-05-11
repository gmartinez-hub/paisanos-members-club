import { BadgeCheck, Search, UserPlus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminMetricTile, AdminPanel, AdminPrimaryLink } from "@/components/ui";
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
      eyebrow="Curaduria de ruta"
      title="Paisaportes"
      actions={
        <AdminPrimaryLink href="/admin/waitlist">
          <UserPlus size={17} />
          Revisar accesos
        </AdminPrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricTile label="Paisaportes" value={`${allMembers.length}`} caption="Activos reales" />
        <AdminMetricTile label="Accesos" value="-" caption="Desde solicitudes" />
        <AdminMetricTile label="Habilidades" value={`${new Set(members.flatMap((member) => member.skills)).size}`} caption="Tags distintos" />
      </div>

      <AdminPanel className="p-4">
        <form action="/admin/members" className="flex items-center gap-3 rounded-sm border border-a-line bg-parch px-3 py-3">
          <label className="sr-only" htmlFor="admin-member-search">Buscar Paisaporte</label>
          <Search className="text-a-ink/55" size={18} />
          <input
            autoComplete="off"
            className="w-full bg-transparent text-sm text-a-ink outline-none placeholder:text-a-ink/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
            defaultValue={params?.q ?? ""}
            id="admin-member-search"
            name="q"
            placeholder="Buscar Paisaporte…"
          />
        </form>
      </AdminPanel>

      <AdminPanel className="overflow-hidden">
        <div className="grid border-b border-a-line bg-parch px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-a-ink/55 md:grid-cols-[1.2fr_1fr_0.6fr_1fr]">
          <span>Paisano</span>
          <span>Tramo</span>
          <span>Escalas</span>
          <span>Ultima senal</span>
        </div>
        {members.length ? (
          members.map((member) => (
            <div className="grid gap-3 border-b border-a-line px-4 py-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_0.6fr_1fr]" key={member.id}>
              <div className="flex min-w-0 gap-3">
                <span className="grid size-10 flex-shrink-0 place-items-center rounded-sm bg-a-ink text-sm font-bold text-parch">
                  {member.avatar}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-a-ink">{member.name}</h2>
                  <p className="truncate text-sm text-a-ink/65">{member.company}</p>
                </div>
              </div>
              <p className="min-w-0 break-words text-sm font-semibold text-a-ink">{member.focus}</p>
              <p className="text-sm font-semibold tabular-nums text-a-ink">{member.attendedEvents}</p>
              <p className="min-w-0 break-words text-sm text-a-ink/65">{member.lastInteraction}</p>
            </div>
          ))
        ) : (
          <div className="grid place-items-center px-4 py-10 text-center text-a-ink/65">
            <BadgeCheck className="mb-3" size={20} />
            <p className="text-sm font-semibold">No hay Paisaportes para esta busqueda.</p>
          </div>
        )}
      </AdminPanel>
    </AdminShell>
  );
}
