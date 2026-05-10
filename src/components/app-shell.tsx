import Link from "next/link";
import {
  ClipboardCheck,
  Compass,
  Fingerprint,
  LayoutDashboard,
  Plane,
  Radar,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/club", label: "Club", icon: LayoutDashboard },
  { href: "/passport", label: "Paisaporte", icon: Fingerprint },
  { href: "/events", label: "Eventos", icon: Plane },
  { href: "/directory", label: "Directorio", icon: UsersRound },
  { href: "/feedback", label: "Feedback", icon: ClipboardCheck },
  { href: "/opportunities", label: "Radar", icon: Radar },
];

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
    <main className="route-grid min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b border-line bg-background/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1480px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link className="flex items-center gap-3" href="/club">
            <span className="grid size-10 place-items-center rounded-sm bg-foreground text-lg font-black text-paper">
              P
            </span>
            <span>
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-signal">
                Paisanos
              </span>
              <span className="block text-sm font-semibold">Members Club</span>
            </span>
          </Link>

          <nav className="flex max-w-full gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-sm px-3 text-sm font-semibold text-ink-muted transition hover:bg-foreground hover:text-paper"
                  href={item.href}
                  key={item.href}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isAdmin ? (
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-3 text-sm font-semibold text-paper transition hover:bg-signal hover:text-foreground"
              href="/admin"
            >
              <Compass size={17} />
              Admin
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
              {eyebrow}
            </p>
            <h1 className="mt-1 max-w-4xl text-4xl font-black leading-none sm:text-6xl">
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
