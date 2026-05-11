import { Check, ShieldCheck, X } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import {
  AdminPanel,
  AdminPrimaryButton,
  AdminSecondaryLink,
  AdminStatusBadge,
} from "@/components/ui";
import { approveWaitlistRequest, rejectWaitlistRequest } from "@/lib/actions";
import { requireAdmin } from "@/lib/community";

export default async function AdminWaitlistPage() {
  const { supabase } = await requireAdmin();
  const { data: waitlist } = await supabase
    .from("whitelist_requests")
    .select("id,email,full_name,company,reason,status")
    .order("created_at", { ascending: false });
  const requests = waitlist ?? [];

  return (
    <AdminShell eyebrow="Solicitudes de abordaje" title="Accesos">
      <div className="grid gap-4">
        {requests.length ? (
          requests.map((person) => (
            <AdminPanel className="p-5" key={person.email}>
              <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <AdminStatusBadge>{person.status}</AdminStatusBadge>
                    <span className="truncate text-sm text-a-ink/65">{person.company}</span>
                  </div>
                  <h2 className="break-words text-xl font-semibold text-a-ink">{person.full_name}</h2>
                  <p className="mt-1 break-words text-sm text-a-ink/65">{person.email}</p>
                  <p className="mt-4 max-w-3xl break-words text-sm leading-6 text-a-ink/65">{person.reason}</p>
                </div>
                <div className="grid content-center gap-2">
                  {person.status === "pending" ? (
                    <>
                      <form action={approveWaitlistRequest}>
                        <input name="request_id" type="hidden" value={person.id} />
                        <AdminPrimaryButton>
                          <Check size={17} />
                          Dar sello
                        </AdminPrimaryButton>
                      </form>
                      <AdminSecondaryLink href={`mailto:${person.email}?subject=Paisaporte Paisanos`}>
                        <ShieldCheck size={17} />
                        Pedir coordenadas
                      </AdminSecondaryLink>
                      <form action={rejectWaitlistRequest}>
                        <input name="request_id" type="hidden" value={person.id} />
                        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-a-line px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-a-ink transition-colors hover:border-a-ink hover:bg-a-och/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t">
                          <X size={17} />
                          Dejar en espera
                        </button>
                      </form>
                    </>
                  ) : (
                    <AdminSecondaryLink href={`mailto:${person.email}?subject=Paisaporte Paisanos`}>
                      <ShieldCheck size={17} />
                      Contactar
                    </AdminSecondaryLink>
                  )}
                </div>
              </div>
            </AdminPanel>
          ))
        ) : (
          <AdminPanel className="p-6 text-sm leading-6 text-a-ink/65">
            No hay solicitudes de acceso para revisar.
          </AdminPanel>
        )}
      </div>
    </AdminShell>
  );
}
