import { AdminShell } from "@/components/admin-shell";
import { Panel, StatusBadge } from "@/components/ui";
import { getFeedbackProcesses, getMembers, requireAdmin } from "@/lib/community";

export default async function AdminFeedbackPage() {
  const { supabase } = await requireAdmin();
  const [feedbackProcesses, members] = await Promise.all([
    getFeedbackProcesses(supabase),
    getMembers(supabase),
  ]);

  return (
    <AdminShell
      eyebrow="Lecturas de viaje"
      title="Notas abiertas"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <Panel className="p-5">
          <h2 className="mb-4 text-xl font-semibold">Lecturas</h2>
          <div className="grid gap-3">
            {feedbackProcesses.map((process) => (
              <article className="rounded-sm border border-line bg-background p-4" key={process.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge>{process.status}</StatusBadge>
                    <span className="text-sm text-ink-muted">Bitacora Paisanos</span>
                    </div>
                    <h3 className="font-semibold">{process.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                  {process.responses}/{process.selectedMembers} notas · vence {process.deadline}
                    </p>
                  </div>
                  <span className="rounded-sm border border-line px-3 py-2 text-sm font-semibold text-ink-muted">
                    En ruta
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-xl font-semibold">Mapa de paisanos</h2>
          <div className="mt-5 grid gap-3">
            {members.slice(0, 5).map((member) => (
              <div className="flex items-center gap-3 rounded-sm border border-line bg-background p-3 text-sm" key={member.id}>
                <span className="grid size-9 place-items-center rounded-sm bg-runway text-xs font-bold text-paper">
                  {member.avatar}
                </span>
                <span>
                  <span className="block font-semibold">{member.name}</span>
                  <span className="block text-ink-muted">{member.focus}</span>
                </span>
              </div>
            ))}
            <p className="rounded-sm border border-line bg-background px-3 py-3 text-sm leading-6 text-ink-muted">
              En P1 conectamos seleccion y envio de invitaciones. En V1 operativa, esta vista solo muestra paisanos invitados y notas reales.
            </p>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
