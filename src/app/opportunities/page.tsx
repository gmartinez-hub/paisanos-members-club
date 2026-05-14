import { Plus, Radar, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Panel, PrimaryButton, PrimaryLink, StatusBadge } from "@/components/ui";
import { createContribution } from "@/lib/actions";
import { requireMember } from "@/lib/community";

export default async function OpportunitiesPage() {
  const { profile, supabase, user } = await requireMember();
  const { data: opportunities } = await supabase
    .from("contributions")
    .select("id,type,title,description,category,status,user_id")
    .or(`status.eq.approved,user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <AppShell
      eyebrow="Propuestas / radar"
      isAdmin={profile.is_admin}
      title="Propuestas"
      actions={
        <PrimaryLink href="/opportunities#nueva-propuesta">
          <Plus size={17} />
          Enviar propuesta
        </PrimaryLink>
      }
    >
      <section id="nueva-propuesta" className="border-y-2 border-foreground py-5">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-black">Enviar una propuesta</h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              Eventos, productos a validar, recursos, invitados o pedidos pasan por curaduria Paisanos antes de volverse visibles.
            </p>
          </div>
          <form action={createContribution} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="grid gap-2 text-sm font-black text-foreground">
                Tipo de propuesta
                <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="type">
                  <option value="solution">Producto, demo o recurso</option>
                  <option value="event_proposal">Evento o invitado</option>
                </select>
              </label>
              <Field label="Titulo" name="title" placeholder="Producto, recurso, evento o pedido" />
            </div>
            <Field label="Area" name="category" placeholder="Producto, AI, founders, research" />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Contexto
              <textarea
                className="min-h-28 resize-none rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
                maxLength={300}
                name="description"
                placeholder="Que es, por que suma y que esperas de Paisanos: feedback, evento, validacion, intro o seguimiento."
                required
              />
            </label>
            <PrimaryButton>
              <Plus size={17} />
              Enviar propuesta
            </PrimaryButton>
          </form>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {(opportunities ?? []).length ? (
          (opportunities ?? []).map((item) => (
            <Panel className="p-5" key={item.id}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="grid size-11 place-items-center rounded-sm bg-background text-runway">
                  {item.type === "solution" ? <Sparkles size={20} /> : <Radar size={20} />}
                </div>
                <StatusBadge>{contributionStatusLabel(String(item.status))}</StatusBadge>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal-dark">
                {contributionTypeLabel(String(item.type))}
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
            <h2 className="text-2xl font-black">Todavia no hay propuestas aprobadas</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando un miembro proponga algo y el equipo lo apruebe, aparece aca con contexto.
            </p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function contributionTypeLabel(type: string) {
  if (type === "event_proposal") {
    return "Evento / invitado";
  }

  return "Producto / recurso";
}

function contributionStatusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: "Aprobada",
    pending: "En revision",
    rejected: "No aprobada",
  };

  return labels[status] ?? status;
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-foreground">
      {label}
      <input
        className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
        name={name}
        placeholder={placeholder}
        required
      />
    </label>
  );
}
