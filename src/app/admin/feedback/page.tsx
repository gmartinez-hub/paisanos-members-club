import { AdminShell } from "@/components/admin-shell";
import { AdminPanel, AdminStatusBadge } from "@/components/ui";
import { getFeedbackProcesses, getMembers, requireAdmin } from "@/lib/community";

export default async function AdminFeedbackPage() {
  const { supabase } = await requireAdmin();
  const [feedbackProcesses, members] = await Promise.all([
    getFeedbackProcesses(supabase),
    getMembers(supabase),
  ]);

  return (
    <AdminShell
      eyebrow="Feedback"
      title="Notas abiertas"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <AdminPanel className="p-5">
          <h2 className="mb-4 text-xl font-semibold text-a-ink">Procesos activos</h2>
          <div className="grid gap-3">
            {feedbackProcesses.length ? (
              feedbackProcesses.map((process) => (
                <article className="rounded-sm border border-a-line bg-parch p-4" key={process.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <AdminStatusBadge>{process.status}</AdminStatusBadge>
                        <span className="text-sm text-a-ink/65">Bitacora Paisanos</span>
                      </div>
                      <h3 className="break-words font-semibold text-a-ink">{process.title}</h3>
                      <p className="mt-1 text-sm text-a-ink/65">
                        {process.responses}/{process.selectedMembers} notas · vence {process.deadline}
                      </p>
                    </div>
                    <span className="rounded-sm border border-a-line px-3 py-2 text-sm font-semibold text-a-ink/65">
                      En ruta
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-sm border border-a-line bg-parch px-3 py-3 text-sm leading-6 text-a-ink/65">
                No hay lecturas abiertas por ahora.
              </p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="p-5">
          <h2 className="text-xl font-semibold text-a-ink">Mapa de paisanos</h2>
          <div className="mt-5 grid gap-3">
            {members.slice(0, 5).map((member) => (
              <div className="flex min-w-0 items-center gap-3 rounded-sm border border-a-line bg-parch p-3 text-sm" key={member.id}>
                <span className="grid size-9 flex-shrink-0 place-items-center rounded-sm bg-a-ink text-xs font-bold text-parch">
                  {member.avatar}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-a-ink">{member.name}</span>
                  <span className="block truncate text-a-ink/65">{member.focus}</span>
                </span>
              </div>
            ))}
            <p className="rounded-sm border border-a-line bg-parch px-3 py-3 text-sm leading-6 text-a-ink/65">
              En P1 conectamos seleccion y envio de invitaciones. En V1 operativa, esta vista solo muestra paisanos invitados y notas reales.
            </p>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
