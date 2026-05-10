import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="route-grid min-h-screen bg-background px-4 py-6 text-foreground">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-5xl place-items-center">
        <div className="grid w-full max-w-2xl gap-8 rounded-sm border border-line bg-paper p-6 shadow-[0_22px_80px_rgba(7,27,58,0.12)] sm:p-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-dark">
              Primer sello
            </p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Activar Paisaporte</h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              Estos datos alimentan el perfil, el QR y despues el matching de eventos.
            </p>
          </div>

          <OnboardingForm />
        </div>
      </section>
    </main>
  );
}
