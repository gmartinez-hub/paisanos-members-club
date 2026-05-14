import { ClipboardCheck, MessageSquareText, Plus, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MetricTile, Panel, PrimaryLink, StatusBadge } from "@/components/ui";
import { getFeedbackProcesses, requireMember } from "@/lib/community";

export default async function FeedbackPage() {
  const { profile, supabase } = await requireMember();
  const feedbackProcesses = await getFeedbackProcesses(supabase);
  const responses = feedbackProcesses.reduce((sum, process) => sum + process.responses, 0);
  const targets = feedbackProcesses.reduce((sum, process) => sum + process.selectedMembers, 0);

  return (
    <AppShell
      eyebrow="Feedback / notas"
      isAdmin={profile.is_admin}
      title="Feedback"
      actions={
        <PrimaryLink href="/opportunities">
          <Plus size={17} />
          Enviar propuesta
        </PrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile icon={ClipboardCheck} label="Procesos" value={`${feedbackProcesses.length}`} caption="Abiertos" />
        <MetricTile icon={UsersRound} label="Personas" value={`${targets}`} caption="Invitadas" />
        <MetricTile icon={MessageSquareText} label="Respuestas" value={`${responses}`} caption="Completadas" />
      </div>

      <div className="grid gap-4">
        {feedbackProcesses.map((process) => (
          <Panel className="p-5" key={process.id}>
            <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge>{feedbackStatusLabel(process.status)}</StatusBadge>
                  <span className="text-sm text-ink-muted">Paisanos</span>
                </div>
                <h2 className="text-2xl font-semibold">{process.title}</h2>
                <div className="mt-5 grid gap-2">
                  {process.questions.map((question, index) => (
                    <p className="rounded-sm border border-line bg-background px-3 py-3 text-sm text-ink-muted" key={question}>
                      {index + 1}. {question}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-sm border border-line bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Respuestas
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {process.responses}/{process.selectedMembers}
                </p>
                <p className="mt-2 text-sm text-ink-muted">Vence {process.deadline}</p>
              </div>
            </div>
          </Panel>
        ))}
        {!feedbackProcesses.length ? (
          <Panel className="p-5">
            <h2 className="text-2xl font-black">No hay feedback activo</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando el equipo abra feedback sobre un evento, propuesta o producto, aparece aca.
            </p>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}

function feedbackStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Activo",
    closed: "Cerrado",
    draft: "Borrador",
  };

  return labels[status.toLowerCase()] ?? status;
}
