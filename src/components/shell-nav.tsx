"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  ClipboardCheck,
  ScanLine,
  TicketsPlane,
  TowerControl,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

const memberNavItems = [
  { href: "/club", label: "Bitacora", code: "BIT" },
  { href: "/passport", label: "Paisaporte", code: "PAS" },
  { href: "/events", label: "Escalas", code: "ESC" },
  { href: "/directory", label: "Mapa", code: "MAP" },
  { href: "/feedback", label: "Notas", code: "NOT" },
  { href: "/opportunities", label: "Radar", code: "RAD" },
];

const adminNavItems: Array<{ code: string; href: string; icon: LucideIcon; label: string }> = [
  { href: "/admin", label: "Panel", code: "OPS", icon: TowerControl },
  { href: "/admin/members", label: "Miembros", code: "MEM", icon: BadgeCheck },
  { href: "/admin/events", label: "Eventos", code: "EVT", icon: TicketsPlane },
  { href: "/admin/check-in", label: "Check-in", code: "CHK", icon: ScanLine },
  { href: "/admin/waitlist", label: "Accesos", code: "ACC", icon: UserPlus },
  { href: "/admin/feedback", label: "Feedback", code: "FDB", icon: ClipboardCheck },
];

function isActive(pathname: string, href: string) {
  if (href === "/club" || href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="flex max-w-full gap-0.5 overflow-x-auto" aria-label="Navegacion principal">
      {memberNavItems.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            key={item.href}
            href={item.href}
            className={`inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-sm px-3 font-mono text-[10px] font-medium uppercase tracking-[0.1em] transition-colors ${
              active
                ? "bg-runway text-stamp"
                : "text-ink-muted hover:bg-runway hover:text-stamp"
            }`}
          >
            <span
              aria-hidden="true"
              className={`grid h-5 min-w-8 place-items-center rounded-sm border px-1 text-[8px] ${
                active ? "border-stamp/55 text-stamp" : "border-line text-ink-muted"
              }`}
            >
              {item.code}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto p-3" aria-label="Navegacion de administracion">
      <p className="mb-2 px-2 font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-ink-muted">
        Operacion
      </p>
      <div className="grid gap-0.5">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              key={item.href}
              href={item.href}
              className={`grid grid-cols-[22px_minmax(0,1fr)_32px] items-center gap-2 rounded-sm px-3 py-2.5 font-mono text-[11px] font-medium transition-colors ${
                active
                  ? "bg-runway text-stamp"
                  : "text-ink-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <Icon aria-hidden="true" size={15} />
              <span className="min-w-0 truncate">{item.label}</span>
              <span
                aria-hidden="true"
                className={`grid h-5 min-w-8 place-items-center rounded-sm border px-1 text-[8px] uppercase tracking-[0.12em] ${
                  active ? "border-stamp/35 text-stamp" : "border-line opacity-70"
                }`}
              >
                {item.code}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 px-2">
        <p className="font-mono text-[8px] leading-5 tracking-[0.12em] text-ink-muted">
          AEP -&gt; PMC<br />
          Buenos Aires · ARG
        </p>
      </div>
    </nav>
  );
}
