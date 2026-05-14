import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SecondaryLink } from "@/components/ui";
import { requireMember } from "@/lib/community";
import { PassportEditForm } from "./passport-edit-form";

export default async function PassportEditPage() {
  const { profile } = await requireMember();

  return (
    <AppShell
      eyebrow="Paisaporte / editar"
      isAdmin={profile.is_admin}
      title="Editar Paisaporte"
      actions={
        <SecondaryLink href="/passport">
          <ArrowLeft size={17} />
          Volver
        </SecondaryLink>
      }
    >
      <section className="grid gap-6 border-y-2 border-foreground py-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-signal-dark">
            Contexto vivo
          </p>
          <h2 className="mt-2 text-3xl font-black">Lo que ayuda a abrir mejores cruces</h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Estos campos alimentan tu Paisaporte, el mapa de miembros y las futuras dinamicas de eventos.
            La parte publica/controlada viene despues; por ahora esto queda dentro de Paisanos.
          </p>
        </div>

        <PassportEditForm profile={profile} />
      </section>
    </AppShell>
  );
}
