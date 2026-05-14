import Link from "next/link";
import { AdminNav } from "@/components/shell-nav";

function RunwayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 4v40" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      <path d="M16 44h16L27 4h-6l-5 40Z" fill="currentColor" opacity="0.08" />
      <path d="M21 11h6M20.4 18h7.2M19.7 25h8.6M18.9 32h10.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.34" />
      <path d="M9 28l30-9-8.7 8.5 2.1 8.7-7.8-5.4-8.3 5.9 3.1-7.6L9 28Z" fill="currentColor" opacity="0.75" />
      <circle cx="24" cy="24" r="21.5" fill="none" stroke="currentColor" strokeDasharray="2 5" strokeWidth="0.8" opacity="0.28" />
    </svg>
  );
}

export function AdminShell({
  children,
  eyebrow,
  title,
  actions,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="route-grid min-h-[100dvh] overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 lg:grid-cols-[230px_minmax(0,1fr)]">

        {/* ── SIDEBAR ── */}
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-32px)]">
          <div className="relative flex h-full min-h-0 flex-col justify-between overflow-hidden rounded-sm border border-line bg-paper">

            {/* Brand header */}
            <div className="relative border-b border-line p-5">
              <RunwayMark className="absolute right-4 top-4 h-10 w-10 text-runway opacity-20" />
              <Link className="flex items-center gap-3" href="/admin">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-sm bg-runway font-mono text-sm font-black text-stamp">
                  P
                </span>
                <span>
                  <span className="block font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                    Paisanos
                  </span>
                  <span className="block font-sans text-sm font-black text-foreground">Torre de Control</span>
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <AdminNav />

            {/* Footer */}
            <div className="border-t border-line p-4">
              <Link
                href="/club"
                className="block rounded-sm border border-line px-3 py-2.5 text-center font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-runway hover:bg-runway hover:text-stamp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
              >
                Ver Paisaporte
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <section className="grid min-w-0 gap-4">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-signal-dark">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-balance font-sans text-3xl font-black text-foreground sm:text-5xl">
                {title}
              </h1>
            </div>
            {actions}
          </header>
          {children}
        </section>

      </div>
    </main>
  );
}
