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
      eyebrow="Research del club"
      isAdmin={profile.is_admin}
      title="Feedback"
      actions={
        <PrimaryLink href="/opportunities">
          <Plus size={17} />
          Proponer demo
        </PrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile icon={ClipboardCheck} label="Procesos" value={`${feedbackProcesses.length}`} caption="Desde Supabase" />
        <MetricTile icon={UsersRound} label="Miembros target" value={`${targets}`} caption="Seleccionados" />
        <MetricTile icon={MessageSquareText} label="Respuestas" value={`${responses}`} caption="Completadas" />
      </div>

      <div className="grid gap-4">
        {feedbackProcesses.map((process) => (
          <Panel className="p-5" key={process.id}>
            <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <StatusBadge>{process.status}</StatusBadge>
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
                  Estado
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {process.responses}/{process.selectedMembers}
                </p>
                <p className="mt-2 text-sm text-ink-muted">Vence {process.deadline}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
