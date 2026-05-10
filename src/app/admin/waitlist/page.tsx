import { Check, ShieldCheck, X } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Panel, PrimaryButton, SecondaryButton, StatusBadge } from "@/components/ui";
import { requireAdmin } from "@/lib/community";

export default async function AdminWaitlistPage() {
  const { supabase } = await requireAdmin();
  const { data: waitlist } = await supabase
    .from("whitelist_requests")
    .select("id,email,full_name,company,reason,status")
    .order("created_at", { ascending: false });

  return (
    <AdminShell eyebrow="Acceso privado" title="Whitelist">
      <div className="grid gap-4">
        {(waitlist ?? []).map((person) => (
          <Panel className="p-5" key={person.email}>
            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <StatusBadge>{person.status}</StatusBadge>
                  <span className="text-sm text-ink-muted">{person.company}</span>
                </div>
                <h2 className="text-xl font-semibold">{person.full_name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{person.email}</p>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-muted">{person.reason}</p>
              </div>
              <div className="grid content-center gap-2">
                <PrimaryButton>
                  <Check size={17} />
                  Aprobar e invitar
                </PrimaryButton>
                <SecondaryButton>
                  <ShieldCheck size={17} />
                  Pedir mas info
                </SecondaryButton>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line px-4 text-sm font-semibold text-signal-dark">
                  <X size={17} />
                  Rechazar
                </button>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AdminShell>
  );
}
