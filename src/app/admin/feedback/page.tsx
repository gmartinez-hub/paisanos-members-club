import { ClipboardCheck, Plus, Send } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Panel, PrimaryButton, SecondaryButton, StatusBadge } from "@/components/ui";
import { getFeedbackProcesses, getMembers, requireAdmin } from "@/lib/community";

export default async function AdminFeedbackPage() {
  const { supabase } = await requireAdmin();
  const [feedbackProcesses, members] = await Promise.all([
    getFeedbackProcesses(supabase),
    getMembers(supabase),
  ]);

  return (
    <AdminShell
      eyebrow="Research"
      title="Procesos de feedback"
      actions={
        <PrimaryButton>
          <Plus size={17} />
          Nuevo proceso
        </PrimaryButton>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <Panel className="p-5">
          <h2 className="mb-4 text-xl font-semibold">Procesos</h2>
          <div className="grid gap-3">
            {feedbackProcesses.map((process) => (
              <article className="rounded-sm border border-line bg-background p-4" key={process.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge>{process.status}</StatusBadge>
                    <span className="text-sm text-ink-muted">Paisanos</span>
                    </div>
                    <h3 className="font-semibold">{process.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                  {process.responses}/{process.selectedMembers} respuestas · vence {process.deadline}
                    </p>
                  </div>
                  <SecondaryButton>
                    <ClipboardCheck size={17} />
                    Revisar
                  </SecondaryButton>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <h2 className="text-xl font-semibold">Selector de miembros</h2>
          <div className="mt-5 grid gap-3">
            {members.slice(0, 5).map((member) => (
              <label className="flex items-center gap-3 rounded-sm border border-line bg-background p-3 text-sm" key={member.id}>
                <input type="checkbox" defaultChecked={member.feedbackGiven >= 1} />
                <span className="grid size-9 place-items-center rounded-sm bg-runway text-xs font-bold text-paper">
                  {member.avatar}
                </span>
                <span>
                  <span className="block font-semibold">{member.name}</span>
                  <span className="block text-ink-muted">{member.focus}</span>
                </span>
              </label>
            ))}
            <PrimaryButton>
              <Send size={17} />
              Enviar invitacion a feedback
            </PrimaryButton>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
