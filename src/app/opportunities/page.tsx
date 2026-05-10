import { Plus, Radar, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, PrimaryButton, StatusBadge } from "@/components/ui";
import { requireMember } from "@/lib/community";

export default async function OpportunitiesPage() {
  const { supabase } = await requireMember();
  const { data: opportunities } = await supabase
    .from("contributions")
    .select("id,type,title,description,category,status")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <AppShell
      eyebrow="Radar de oportunidades"
      title="Radar"
      actions={
        <PrimaryButton>
          <Plus size={17} />
          Nueva propuesta
        </PrimaryButton>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {(opportunities ?? []).length ? (
          (opportunities ?? []).map((item) => (
            <Panel className="p-5" key={item.id}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-sm bg-background text-runway">
                  {item.type === "solution" ? <Sparkles size={20} /> : <Radar size={20} />}
                </div>
                <StatusBadge>{item.status}</StatusBadge>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal-dark">
                {item.type}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{item.description}</p>
              <div className="mt-5 rounded-sm border border-line bg-background px-3 py-3 text-sm font-semibold text-runway">
                {item.category}
              </div>
            </Panel>
          ))
        ) : (
          <Panel className="p-5 lg:col-span-3">
            <h2 className="text-2xl font-black">Todavia no hay oportunidades aprobadas</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando un miembro proponga una beta, recurso o evento y el admin lo apruebe, aparece aca.
            </p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
