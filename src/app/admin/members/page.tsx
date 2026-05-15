import { BadgeCheck, Mail, NotebookPen, Plus, Search, Tag, UserPlus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminMetricTile,
  AdminPanel,
  AdminPrimaryButton,
  AdminPrimaryLink,
  AdminSecondaryLink,
  AdminStatusBadge,
} from "@/components/ui";
import { addPersonNote, addPersonTag, createProspect } from "@/lib/actions";
import { getAdminPeople, requireAdmin, type AdminPersonView } from "@/lib/community";

const fieldClass =
  "min-h-10 w-full rounded-sm border border-a-line bg-parch px-3 py-2 text-sm text-a-ink outline-none placeholder:text-a-ink/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() ?? "";
  const { supabase } = await requireAdmin();
  const { people: allPeople, setupMessage, signalGraphReady } = await getAdminPeople(supabase);
  const people = allPeople.filter((person) => {
    if (!query) {
      return true;
    }

    return [
      person.name,
      person.email,
      person.company,
      person.role,
      person.context,
      person.sourceLabel,
      person.statusLabel,
      person.tags.join(" "),
      person.latestNote,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const memberCount = allPeople.filter((person) => person.kind === "member").length;
  const guestCount = allPeople.filter((person) => person.kind === "guest").length;
  const prospectCount = allPeople.filter((person) => person.kind === "prospect").length;
  const tagCount = new Set(allPeople.flatMap((person) => person.tags)).size;

  return (
    <AdminShell
      eyebrow="Admin / personas"
      title="Personas"
      actions={
        <AdminPrimaryLink href="/admin/waitlist">
          <UserPlus size={17} />
          Revisar accesos
        </AdminPrimaryLink>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricTile color="cel" label="Miembros" value={`${memberCount}`} caption="Paisaportes activos" />
        <AdminMetricTile color="och" label="Invitados" value={`${guestCount}`} caption="Acceso o Luma" />
        <AdminMetricTile color="ter" label="Prospectos" value={`${prospectCount}`} caption="Mapa interno" />
        <AdminMetricTile color="sag" label="Tags" value={`${tagCount}`} caption="Senales admin" />
      </div>

      {setupMessage ? (
        <AdminPanel className="border-a-och-t bg-a-och/20 p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/65">
            Setup pendiente
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-a-ink/75">{setupMessage}</p>
        </AdminPanel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="grid gap-4">
          <AdminPanel className="p-4">
            <form action="/admin/members" className="flex items-center gap-3 rounded-sm border border-a-line bg-parch px-3 py-3">
              <label className="sr-only" htmlFor="admin-member-search">Buscar persona</label>
              <Search className="text-a-ink/55" size={18} />
              <input
                autoComplete="off"
                className="w-full bg-transparent text-sm text-a-ink outline-none placeholder:text-a-ink/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
                defaultValue={params?.q ?? ""}
                id="admin-member-search"
                name="q"
                placeholder="Buscar por persona, empresa, tag, nota o fuente..."
              />
            </form>
          </AdminPanel>

          <AdminPanel className="overflow-hidden">
            <div className="grid border-b border-a-line bg-parch px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-a-ink/55 md:grid-cols-[1.05fr_1.2fr_0.7fr]">
              <span>Persona</span>
              <span>Contexto</span>
              <span>Accion</span>
            </div>
            {people.length ? (
              people.map((person) => (
                <PersonRow key={`${person.subjectType}-${person.subjectId}`} person={person} signalGraphReady={signalGraphReady} />
              ))
            ) : (
              <div className="grid place-items-center px-4 py-10 text-center text-a-ink/65">
                <BadgeCheck className="mb-3" size={20} />
                <p className="text-sm font-semibold">No hay personas para esta busqueda.</p>
              </div>
            )}
          </AdminPanel>
        </section>

        <aside className="grid content-start gap-4">
          {signalGraphReady ? (
            <AdminPanel className="p-5">
              <div className="mb-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
                  Nuevo prospecto
                </p>
                <h2 className="mt-2 text-2xl font-black leading-tight text-a-ink">Cargar persona</h2>
                <p className="mt-2 text-sm leading-6 text-a-ink/65">
                  Para mapear clientes, talento, speakers, sponsors o productos que queremos seguir.
                </p>
              </div>
              <form action={createProspect} className="grid gap-3">
                <Field label="Nombre">
                  <input className={fieldClass} name="full_name" placeholder="Nombre y apellido" required />
                </Field>
                <Field label="Email">
                  <input className={fieldClass} name="email" placeholder="mail@empresa.com" type="email" />
                </Field>
                <Field label="Organizacion">
                  <input className={fieldClass} name="company" placeholder="Empresa, producto o proyecto" />
                </Field>
                <Field label="Rol">
                  <input className={fieldClass} name="role" placeholder="Founder, talento, cliente..." />
                </Field>
                <Field label="Fuente">
                  <select className={fieldClass} name="source" defaultValue="manual">
                    <option value="manual">Manual</option>
                    <option value="event">Evento</option>
                    <option value="luma">Luma</option>
                    <option value="proposal">Propuesta</option>
                    <option value="referral">Referido</option>
                  </select>
                </Field>
                <Field label="Contexto">
                  <textarea className={`${fieldClass} min-h-24 resize-y`} name="context" placeholder="Por que importa para Paisanos" />
                </Field>
                <AdminPrimaryButton>
                  <Plus size={17} />
                  Crear prospecto
                </AdminPrimaryButton>
              </form>
            </AdminPanel>
          ) : (
            <AdminPanel className="p-5 text-sm leading-6 text-a-ink/65">
              Cuando apliquemos el SQL de Signal Graph, aca vas a poder crear prospectos y registrar notas internas.
            </AdminPanel>
          )}

          <AdminPanel className="p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
              Tags sugeridos
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Potencial cliente", "Talento", "Speaker", "Sponsor", "Producto para validar", "Alta senal"].map((tag) => (
                <span className="rounded-sm border border-a-line bg-parch px-2 py-1 font-mono text-[10px] text-a-ink/70" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </AdminPanel>
        </aside>
      </div>
    </AdminShell>
  );
}

function PersonRow({
  person,
  signalGraphReady,
}: {
  person: AdminPersonView;
  signalGraphReady: boolean;
}) {
  return (
    <div className="grid gap-4 border-b border-a-line px-4 py-5 last:border-b-0 md:grid-cols-[1.05fr_1.2fr_0.7fr]">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-sm px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${kindClass(person.kind)}`}>
            {person.kindLabel}
          </span>
          <AdminStatusBadge>{person.statusLabel}</AdminStatusBadge>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/45">
            {person.sourceLabel}
          </span>
        </div>
        <h2 className="break-words text-xl font-black leading-tight text-a-ink">{person.name}</h2>
        <p className="mt-1 break-words text-sm text-a-ink/65">{person.role}</p>
        <p className="mt-1 break-words text-sm text-a-ink/65">{person.company}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminSecondaryLink href={`/admin/members/${person.subjectType}/${encodeURIComponent(person.subjectId)}`}>
            <NotebookPen size={16} />
            Ficha interna
          </AdminSecondaryLink>
          {person.href ? (
            <AdminSecondaryLink href={person.href}>
              <BadgeCheck size={16} />
              Ver Paisaporte
            </AdminSecondaryLink>
          ) : null}
          {person.email ? (
            <AdminSecondaryLink href={`mailto:${person.email}?subject=Paisaporte Paisanos`}>
              <Mail size={16} />
              Mail
            </AdminSecondaryLink>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        <p className="break-words text-sm leading-6 text-a-ink/75">{person.context}</p>
        {person.latestNote ? (
          <p className="mt-3 border-l border-a-line pl-3 text-sm leading-6 text-a-ink/65">
            {person.latestNote}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {person.tags.length ? (
            person.tags.map((tag) => (
              <span className="rounded-sm bg-a-sag px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-a-ink" key={tag}>
                {tag}
              </span>
            ))
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-a-ink/40">Sin tags</span>
          )}
        </div>
      </div>

      <div className="min-w-0">
        {signalGraphReady ? (
          <details className="rounded-sm border border-a-line bg-parch p-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-a-ink marker:hidden [&::-webkit-details-marker]:hidden">
              <NotebookPen size={15} />
              Registrar senal
            </summary>
            <div className="mt-4 grid gap-4">
              <form action={addPersonTag} className="grid gap-2">
                <input name="subject_type" type="hidden" value={person.subjectType} />
                <input name="subject_id" type="hidden" value={person.subjectId} />
                <label className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/55" htmlFor={`tag-${person.subjectType}-${person.subjectId}`}>
                  Tag operativo
                </label>
                <div className="flex gap-2">
                  <input
                    className={fieldClass}
                    id={`tag-${person.subjectType}-${person.subjectId}`}
                    name="tag"
                    placeholder="Alta senal"
                    required
                  />
                  <SmallSubmit label="Tag">
                    <Tag size={15} />
                  </SmallSubmit>
                </div>
              </form>
              <form action={addPersonNote} className="grid gap-2">
                <input name="subject_type" type="hidden" value={person.subjectType} />
                <input name="subject_id" type="hidden" value={person.subjectId} />
                <label className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/55" htmlFor={`note-${person.subjectType}-${person.subjectId}`}>
                  Nota interna
                </label>
                <textarea
                  className={`${fieldClass} min-h-24 resize-y`}
                  id={`note-${person.subjectType}-${person.subjectId}`}
                  name="body"
                  placeholder="Que hay que recordar o hacer despues"
                  required
                />
                <SmallSubmit label="Guardar">
                  <Plus size={15} />
                </SmallSubmit>
              </form>
            </div>
          </details>
        ) : (
          <p className="text-sm leading-6 text-a-ink/55">Aplica el SQL para registrar senales internas.</p>
        )}
      </div>
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/55">{label}</span>
      {children}
    </label>
  );
}

function SmallSubmit({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-sm bg-a-ink text-parch transition-colors hover:bg-a-och-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
      type="submit"
    >
      {children}
    </button>
  );
}

function kindClass(kind: AdminPersonView["kind"]) {
  const classes: Record<AdminPersonView["kind"], string> = {
    guest: "bg-a-cel text-a-ink",
    member: "bg-a-sag text-a-ink",
    prospect: "bg-a-ter text-a-ink",
  };

  return classes[kind];
}
