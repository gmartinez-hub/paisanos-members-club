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
      eyebrow="Radar de senales"
      isAdmin={profile.is_admin}
      title="Senales para abrir cruces"
      actions={
        <PrimaryLink href="/opportunities#nueva-propuesta">
          <Plus size={17} />
          Dejar senal
        </PrimaryLink>
      }
    >
      <section id="nueva-propuesta" className="border-y-2 border-foreground py-5">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-black">Dejar una senal</h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              Escalas, demos y recursos pasan por curaduria Paisanos antes de verse en el mapa.
            </p>
          </div>
          <form action={createContribution} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="grid gap-2 text-sm font-black text-foreground">
                Tipo de senal
                <select className="rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none" name="type">
                  <option value="solution">Demo / recurso</option>
                  <option value="event_proposal">Escala</option>
                </select>
              </label>
              <Field label="Titulo" name="title" placeholder="Demo, recurso o escala recomendada" />
            </div>
            <Field label="Coordenada" name="category" placeholder="Producto, AI, founders, research" />
            <label className="grid gap-2 text-sm font-black text-foreground">
              Contexto
              <textarea
                className="min-h-28 resize-none rounded-sm border border-line bg-background px-3 py-3 text-foreground outline-none"
                maxLength={300}
                name="description"
                placeholder="Que es, por que suma y que tipo de nota, prueba o participacion buscas."
                required
              />
            </label>
            <PrimaryButton>
              <Plus size={17} />
              Enviar a curaduria
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
            <h2 className="text-2xl font-black">Todavia no hay senales aprobadas</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Cuando un paisano proponga una beta, recurso o escala y el equipo lo apruebe, aparece aca.
            </p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
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
