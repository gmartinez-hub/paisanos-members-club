import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { AdminPanel, AdminSecondaryLink, AdminStatusBadge } from "@/components/ui";
import { getEvents, requireAdmin } from "@/lib/community";
import { ScanForm } from "./scan-form";

export default async function AdminCheckInScanPage() {
  const { supabase } = await requireAdmin();
  const events = await getEvents(supabase, { includeDrafts: true });
  const event = events.find((item) => item.rawStatus === "active" || item.rawStatus === "published") ?? events[0];

  return (
    <AdminShell
      eyebrow="Check-in"
      title="Scanner"
      actions={
        <AdminSecondaryLink href="/admin/check-in">
          <ArrowLeft size={17} />
          Lista
        </AdminSecondaryLink>
      }
    >
      {event ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <AdminPanel className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge>{event.status}</AdminStatusBadge>
              <AdminStatusBadge>{event.sourceLabel}</AdminStatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-a-ink/55">
                {event.date} · {event.time}
              </span>
            </div>
            <h2 className="mt-4 break-words text-3xl font-black text-a-ink">{event.title}</h2>
            <p className="mt-2 text-sm leading-6 text-a-ink/65">
              {event.confirmed}/{event.capacity} confirmados · {event.location}
            </p>

            <div className="mt-5 grid gap-3 border-t border-a-line pt-4 sm:grid-cols-3">
              <Fact label="Punto" value={event.point} />
              <Fact label="Entradas" value={`${event.checkedIn}`} />
              <Fact label="Pendientes" value={`${event.noShows}`} />
            </div>
          </AdminPanel>

          {event.usesLumaCheckIn ? (
            <AdminPanel className="p-5">
              <h2 className="text-xl font-black text-a-ink">Check-in externo</h2>
              <p className="mt-2 text-sm leading-6 text-a-ink/65">
                Este evento usa Luma para registro y entrada. Paisanos queda como capa de identidad e historial importado.
              </p>
              {event.lumaUrl ? (
                <div className="mt-4">
                  <AdminSecondaryLink href={event.lumaUrl} target="_blank">
                    <ExternalLink size={17} />
                    Abrir Luma
                  </AdminSecondaryLink>
                </div>
              ) : null}
            </AdminPanel>
          ) : (
            <ScanForm eventId={event.id} />
          )}
        </div>
      ) : (
        <AdminPanel className="p-6">
          <h2 className="text-2xl font-black text-a-ink">No hay eventos creados</h2>
          <p className="mt-2 text-sm leading-6 text-a-ink/65">
            Crea un evento desde Gestion de eventos para abrir scanner.
          </p>
        </AdminPanel>
      )}
    </AdminShell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-a-line pt-3">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-a-ink/45">{label}</p>
      <p className="mt-1 text-2xl font-black text-a-ink">{value}</p>
    </div>
  );
}
