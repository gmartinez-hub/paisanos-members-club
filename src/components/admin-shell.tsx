import Link from "next/link";
import { AdminNav } from "@/components/shell-nav";

function CompassRose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring with dashes */}
      <circle
        cx="24" cy="24" r="22"
        fill="none" stroke="currentColor" strokeWidth="0.8"
        strokeDasharray="2 4" opacity={0.35}
      />
      {/* Inner ring */}
      <circle
        cx="24" cy="24" r="8"
        fill="none" stroke="currentColor" strokeWidth="0.7"
        opacity={0.2}
      />
      {/* N arrow — filled */}
      <polygon points="24,3 21.5,24 24,19.5 26.5,24" fill="currentColor" />
      {/* S arrow */}
      <polygon points="24,45 21.5,24 24,28.5 26.5,24" fill="currentColor" opacity={0.28} />
      {/* E arrow */}
      <polygon points="45,24 24,21.5 28.5,24 24,26.5" fill="currentColor" opacity={0.28} />
      {/* W arrow */}
      <polygon points="3,24 24,21.5 19.5,24 24,26.5" fill="currentColor" opacity={0.28} />
      {/* Diagonal tick marks */}
      <line x1="12.7" y1="12.7" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="0.8" opacity={0.2} />
      <line x1="35.3" y1="35.3" x2="32.5" y2="32.5" stroke="currentColor" strokeWidth="0.8" opacity={0.2} />
      <line x1="35.3" y1="12.7" x2="32.5" y2="15.5" stroke="currentColor" strokeWidth="0.8" opacity={0.2} />
      <line x1="12.7" y1="35.3" x2="15.5" y2="32.5" stroke="currentColor" strokeWidth="0.8" opacity={0.2} />
      {/* Center */}
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
      {/* Cardinal labels */}
      <text x="24" y="14" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="currentColor" opacity={0.5}>N</text>
      <text x="24" y="38" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="currentColor" opacity={0.3}>S</text>
      <text x="38" y="25.5" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="currentColor" opacity={0.3}>E</text>
      <text x="10" y="25.5" textAnchor="middle" fontSize="4.5" fontFamily="monospace" fill="currentColor" opacity={0.3}>O</text>
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
    <main className="coord-grid min-h-[100dvh] bg-parch text-foreground">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">

        {/* ── SIDEBAR — Indiana Jones parchment + topo lines ── */}
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100dvh-32px)]">
          <div className="topo-lines ticket-edge-parch relative flex h-full flex-col justify-between overflow-hidden rounded-sm border border-a-line bg-parch-2">

            {/* Brand header */}
            <div className="relative border-b border-a-line p-5">
              <CompassRose className="absolute right-4 top-4 h-9 w-9 text-a-ink opacity-20" />
              <Link className="flex items-center gap-3" href="/admin">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-sm border-2 border-a-ink bg-a-ink font-mono text-sm font-black text-parch">
                  P
                </span>
                <span>
                  <span className="block font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-a-ink opacity-60">
                    Paisanos
                  </span>
                  <span className="block font-sans text-sm font-black text-a-ink">Torre</span>
                </span>
              </Link>
            </div>

            {/* Navigation */}
            <AdminNav />

            {/* Footer */}
            <div className="border-t border-a-line p-4">
              <Link
                href="/club"
                className="block rounded-sm border border-a-ink/30 px-3 py-2.5 text-center font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-a-ink transition-colors hover:bg-a-ink hover:text-parch"
              >
                Ver bitacora
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <section className="grid gap-4">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-a-line pb-5">
            <div>
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-a-och-t opacity-70">
                {eyebrow}
              </p>
              <h1 className="mt-1 font-sans text-3xl font-black text-a-ink sm:text-5xl">
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
