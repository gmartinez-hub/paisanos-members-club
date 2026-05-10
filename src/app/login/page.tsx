import Link from "next/link";
import { Plane } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="route-grid min-h-screen bg-background px-4 py-6 text-foreground">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-5xl place-items-center">
        <div className="grid w-full max-w-xl gap-8 rounded-sm border border-line bg-paper p-6 shadow-[0_22px_80px_rgba(7,27,58,0.12)] sm:p-8">
          <Link className="flex w-fit items-center gap-3 text-sm font-semibold text-runway" href="/">
            <span className="grid size-9 place-items-center rounded-sm bg-runway text-paper">P</span>
            Paisanos Members Club
          </Link>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-signal-dark">
              <Plane size={15} />
              Boarding privado
            </p>
            <h1 className="text-3xl font-semibold sm:text-5xl">Entrar al club</h1>
            <p className="mt-4 text-base leading-7 text-ink-muted">
              Usamos magic links para mantener el acceso simple y privado. Sin password,
              sin registro abierto.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
