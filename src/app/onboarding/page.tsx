import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_COOKIE } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const isDemoOnboarding = cookieStore.get(DEMO_COOKIE)?.value === "onboarding";

  if (isDemoOnboarding) {
    return <OnboardingScreen />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <OnboardingScreen />
  );
}

function OnboardingScreen() {
  return (
    <main className="route-grid min-h-[100dvh] bg-background px-4 py-6 text-foreground">
      <section className="mx-auto grid min-h-[calc(100dvh-48px)] w-full max-w-5xl place-items-center">
        <div className="grid w-full max-w-2xl gap-8 rounded-sm border border-line bg-paper p-6 shadow-[0_22px_80px_rgba(7,27,58,0.12)] sm:p-8">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-dark">
              Primer sello
            </p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Abrir tu bitacora</h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              Estas coordenadas arman tu Paisaporte: que estas construyendo, que podes
              aportar y que cruces vale la pena abrir.
            </p>
          </div>

          <OnboardingForm />
        </div>
      </section>
    </main>
  );
}
