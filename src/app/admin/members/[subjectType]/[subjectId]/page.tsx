import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Mail,
  NotebookPen,
  Plus,
  Send,
  Tag,
  TicketsPlane,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminMetricTile,
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryLink,
  AdminStatusBadge,
} from "@/components/ui";
import { addPersonNote, addPersonTag } from "@/lib/actions";
import {
  getAdminPersonDetail,
  requireAdmin,
  type AdminPersonActivityView,
  type AdminPersonView,
  type PersonSubjectType,
} from "@/lib/community";

const fieldClass =
  "min-h-10 w-full rounded-sm border border-a-line bg-parch px-3 py-2 text-sm text-a-ink outline-none placeholder:text-a-ink/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t";

export default async function AdminPersonDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string; subjectType: string }>;
}) {
  const { subjectId, subjectType } = await params;
  const normalizedSubjectType = normalizeSubjectType(subjectType);

  if (!normalizedSubjectType) {
    notFound();
  }

  const { supabase } = await requireAdmin();
  const { activity, person, setupMessage, signalGraphReady } = await getAdminPersonDetail(
    supabase,
    normalizedSubjectType,
    decodeURIComponent(subjectId),
  );

  if (!person) {
    notFound();
  }

  return (
    <AdminShell
      eyebrow="Admin / personas / ficha"
      title={person.name}
      actions={
        <div className="flex flex-wrap gap-2">
          <AdminSecondaryLink href="/admin/members">
            <ArrowLeft size={17} />
            Personas
          </AdminSecondaryLink>
          {person.href ? (
            <AdminSecondaryLink href={person.href}>
              <BadgeCheck size={17} />
              Paisaporte
            </AdminSecondaryLink>
          ) : null}
          {person.email ? (
            <AdminSecondaryLink href={`mailto:${person.email}?subject=Paisaporte Paisanos`}>
              <Mail size={17} />
              Mail
            </AdminSecondaryLink>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricTile color="cel" label="Estado" value={person.kindLabel} caption={person.statusLabel} />
        <AdminMetricTile color="och" label="Fuente" value={person.sourceLabel} caption="Origen de la senal" />
        <AdminMetricTile color="sag" label="Tags" value={`${person.tags.length}`} caption="Marcadores internos" />
        <AdminMetricTile color="mal" label="Notas" value={`${person.notes.length}`} caption="Bitacora admin" />
      </div>

      {setupMessage ? (
        <AdminPanel className="border-a-och-t bg-a-och/20 p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/65">
            Setup pendiente
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-a-ink/75">{setupMessage}</p>
        </AdminPanel>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="grid gap-5">
          <AdminPanel className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-sm px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${kindClass(person.kind)}`}>
                {person.kindLabel}
              </span>
              <AdminStatusBadge>{person.statusLabel}</AdminStatusBadge>
              <AdminStatusBadge>{person.sourceLabel}</AdminStatusBadge>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
              <div className="min-w-0">
                <h2 className="text-3xl font-black leading-tight text-a-ink">{person.name}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-a-ink/65">
                  {person.role} · {person.company}
                </p>
                <p className="mt-5 max-w-3xl break-words text-base leading-7 text-a-ink/75">
                  {person.context}
                </p>
              </div>
              <div className="grid content-start gap-3 border-t border-a-line pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                <Info label="Email" value={person.email ?? "Sin email cargado"} />
                <Info label="Creado" value={formatDateTime(person.createdAt)} />
                <Info label="Ultima actualizacion" value={formatDateTime(person.updatedAt)} />
              </div>
            </div>
          </AdminPanel>

          <AdminPanel className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TicketsPlane className="text-a-och-t" size={19} />
              <h2 className="text-2xl font-black text-a-ink">Historial operativo</h2>
            </div>
            <Activity activity={activity} person={person} />
          </AdminPanel>
        </section>

        <aside className="grid content-start gap-4">
          <AdminPanel className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <NotebookPen className="text-a-och-t" size={19} />
              <h2 className="text-2xl font-black text-a-ink">Bitacora interna</h2>
            </div>

            {signalGraphReady ? (
              <div className="grid gap-4">
                <form action={addPersonTag} className="grid gap-2">
                  <input name="subject_type" type="hidden" value={person.subjectType} />
                  <input name="subject_id" type="hidden" value={person.subjectId} />
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/55" htmlFor="admin-person-tag">
                    Tag operativo
                  </label>
                  <div className="flex gap-2">
                    <input
                      className={fieldClass}
                      id="admin-person-tag"
                      name="tag"
                      placeholder="Potencial cliente"
                      required
                    />
                    <SmallSubmit label="Agregar tag">
                      <Tag size={15} />
                    </SmallSubmit>
                  </div>
                </form>
                <form action={addPersonNote} className="grid gap-2">
                  <input name="subject_type" type="hidden" value={person.subjectType} />
                  <input name="subject_id" type="hidden" value={person.subjectId} />
                  <label className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/55" htmlFor="admin-person-note">
                    Nota interna
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-28 resize-y`}
                    id="admin-person-note"
                    name="body"
                    placeholder="Que hay que recordar, validar o hacer despues"
                    required
                  />
                  <AdminPrimaryButton>
                    <Plus size={17} />
                    Guardar nota
                  </AdminPrimaryButton>
                </form>
              </div>
            ) : (
              <p className="text-sm leading-6 text-a-ink/65">
                Aplica el SQL de Signal Graph para registrar tags y notas internas.
              </p>
            )}
          </AdminPanel>

          <AdminPanel className="p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
              Tags actuales
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {person.tags.length ? (
                person.tags.map((tag) => (
                  <span className="rounded-sm bg-a-sag px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-a-ink" key={tag}>
                    {tag}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-a-ink/40">Sin tags internos</span>
              )}
            </div>
          </AdminPanel>

          <AdminPanel className="p-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
              Notas
            </p>
            <div className="mt-4 grid gap-3">
              {person.notes.length ? (
                person.notes.map((note) => (
                  <div className="border-t border-a-line pt-3" key={`${note.createdAt}-${note.body}`}>
                    <p className="text-sm leading-6 text-a-ink/75">{note.body}</p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-a-ink/40">
                      {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-a-ink/55">Todavia no hay notas internas.</p>
              )}
            </div>
          </AdminPanel>

          {person.email ? (
            <AdminPanel className="p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
                Siguiente paso
              </p>
              <p className="mt-2 text-sm leading-6 text-a-ink/65">
                Abrir mail con contexto para invitar, pedir mas datos o coordinar seguimiento.
              </p>
              <div className="mt-4">
                <AdminSecondaryLink href={`mailto:${person.email}?subject=Paisaporte Paisanos&body=${encodeURIComponent(mailBody(person))}`}>
                  <Send size={17} />
                  Escribir follow-up
                </AdminSecondaryLink>
              </div>
            </AdminPanel>
          ) : null}
        </aside>
      </div>
    </AdminShell>
  );
}

function Activity({
  activity,
  person,
}: {
  activity: AdminPersonActivityView;
  person: AdminPersonView;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
          Eventos
        </p>
        <div className="mt-3 grid gap-3">
          {activity.events.length ? (
            activity.events.map((event) => (
              <div className="border-t border-a-line pt-3" key={event.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge>{event.sourceLabel}</AdminStatusBadge>
                  <AdminStatusBadge>{event.checkedIn ? "Check-in" : event.rsvpStatus}</AdminStatusBadge>
                </div>
                <h3 className="mt-2 text-base font-black text-a-ink">{event.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-a-ink/60">
                  <CalendarDays size={15} />
                  {event.date}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-a-ink/55">
              {person.kind === "member"
                ? "Todavia no hay eventos asociados."
                : "Los eventos apareceran cuando esta persona tenga Paisaporte o matcheo Luma."}
            </p>
          )}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-a-ink/55">
          Propuestas
        </p>
        <div className="mt-3 grid gap-3">
          {activity.contributions.length ? (
            activity.contributions.map((contribution) => (
              <div className="border-t border-a-line pt-3" key={contribution.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge>{contribution.type}</AdminStatusBadge>
                  <AdminStatusBadge>{contribution.status}</AdminStatusBadge>
                </div>
                <h3 className="mt-2 text-base font-black text-a-ink">{contribution.title}</h3>
                <p className="mt-1 text-sm text-a-ink/60">{formatDateTime(contribution.createdAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm leading-6 text-a-ink/55">
              No hay propuestas asociadas todavia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-a-line pt-3">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-a-ink/45">{label}</p>
      <p className="mt-2 break-words text-sm font-black leading-6 text-a-ink">{value}</p>
    </div>
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

function normalizeSubjectType(value: string): PersonSubjectType | null {
  if (["profile", "prospect", "whitelist_request", "luma_guest"].includes(value)) {
    return value as PersonSubjectType;
  }

  return null;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(date));
}

function kindClass(kind: AdminPersonView["kind"]) {
  const classes: Record<AdminPersonView["kind"], string> = {
    guest: "bg-a-cel text-a-ink",
    member: "bg-a-sag text-a-ink",
    prospect: "bg-a-ter text-a-ink",
  };

  return classes[kind];
}

function mailBody(person: AdminPersonView) {
  return `Hola ${person.name},\n\nTe escribo desde Paisanos por esto: ${person.context}\n\n`;
}
