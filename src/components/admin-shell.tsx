import Link from "next/link";
import {
  ClipboardCheck,
  LayoutDashboard,
  Plane,
  ShieldCheck,
  TicketCheck,
  UsersRound,
} from "lucide-react";

const adminItems = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/members", label: "Miembros", icon: UsersRound },
  { href: "/admin/events", label: "Eventos", icon: Plane },
  { href: "/admin/check-in", label: "Check-in", icon: TicketCheck },
  { href: "/admin/waitlist", label: "Whitelist", icon: ShieldCheck },
  { href: "/admin/feedback", label: "Feedback", icon: ClipboardCheck },
];

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
    <main className="route-grid min-h-screen bg-background text-foreground">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 lg:grid-cols-[252px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-32px)]">
          <div className="flex h-full flex-col justify-between rounded-sm border-2 border-foreground bg-foreground p-4 text-paper">
            <div>
              <Link className="mb-8 flex items-center gap-3" href="/admin">
                <span className="grid size-11 place-items-center rounded-sm bg-paper text-lg font-black text-runway">
                  P
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-[0.18em] text-signal">
                    Paisanos
                  </span>
                  <span className="block text-lg font-semibold">Admin</span>
                </span>
              </Link>

              <nav className="grid gap-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      className="flex items-center gap-3 rounded-sm px-3 py-3 text-sm font-semibold text-paper/70 transition hover:bg-paper/10 hover:text-paper"
                      href={item.href}
                      key={item.href}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Link
              className="mt-8 rounded-sm border border-stamp px-3 py-3 text-sm font-black text-stamp transition hover:bg-stamp hover:text-foreground"
              href="/club"
            >
              Ver app de miembros
            </Link>
          </div>
        </aside>

        <section className="grid gap-4">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-signal">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h1>
            </div>
            {actions}
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
