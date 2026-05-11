import Link from "next/link";
import { MemberNav } from "@/components/shell-nav";

export function AppShell({
  children,
  eyebrow,
  isAdmin = false,
  title,
  actions,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  eyebrow: string;
  isAdmin?: boolean;
  title: string;
}) {
  return (
    <main className="route-grid min-h-[100dvh] bg-background text-foreground">

      {/* ── TOP BAR — boarding gate aesthetic ── */}
      <div className="sticky top-0 z-30 border-b border-line bg-background/94 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-3 px-4 py-3">

          {/* Brand */}
          <Link className="flex flex-shrink-0 items-center gap-3" href="/club">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-runway font-sans text-base font-black text-stamp">
              P
            </span>
            <span>
              <span className="block font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                Paisanos
              </span>
              <span className="block font-sans text-sm font-black text-foreground">
                Bitacora
              </span>
            </span>
          </Link>

          {/* Navigation */}
          <MemberNav />

          {/* Admin access */}
          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              <span aria-hidden="true" className="grid h-5 min-w-7 place-items-center rounded-sm border border-line px-1 text-[8px]">
                IJ
              </span>
              Torre
            </Link>
          ) : null}
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {/* Eyebrow — boarding pass field label aesthetic */}
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-stamp-fg">
              {eyebrow}
            </p>
            <h1 className="mt-1 max-w-4xl font-sans text-4xl font-black leading-none sm:text-6xl">
              {title}
            </h1>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </main>
  );
}
