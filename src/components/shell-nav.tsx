"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const memberNavItems = [
  { href: "/club", label: "Club", code: "CLB" },
  { href: "/passport", label: "Paisaporte", code: "PAS" },
  { href: "/events", label: "Eventos", code: "EVT" },
  { href: "/directory", label: "Directorio", code: "DIR" },
  { href: "/feedback", label: "Feedback", code: "FDB" },
  { href: "/opportunities", label: "Radar", code: "RAD" },
];

const adminNavItems = [
  { href: "/admin", label: "Resumen", code: "OPS" },
  { href: "/admin/members", label: "Miembros", code: "MBR" },
  { href: "/admin/events", label: "Eventos", code: "EVT" },
  { href: "/admin/check-in", label: "Check-in", code: "CHK" },
  { href: "/admin/waitlist", label: "Whitelist", code: "WHT" },
  { href: "/admin/feedback", label: "Feedback", code: "FDB" },
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
    <nav className="flex-1 p-3" aria-label="Navegacion de administracion">
      <p className="mb-2 px-2 font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-a-ink opacity-40">
        Operacion
      </p>
      <div className="grid gap-0.5">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2.5 font-mono text-[11px] font-medium transition-colors ${
                active
                  ? "bg-a-och text-a-och-t"
                  : "text-a-ink hover:bg-a-och/40 hover:text-a-och-t"
              }`}
            >
              <span
                aria-hidden="true"
                className={`grid h-5 min-w-8 place-items-center rounded-sm border px-1 text-[8px] uppercase tracking-[0.12em] ${
                  active ? "border-a-och-t/35" : "border-a-line/70 opacity-70"
                }`}
              >
                {item.code}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 px-2">
        <p className="font-mono text-[8px] leading-5 tracking-[0.12em] text-a-ink opacity-25">
          34°36′S 58°22′W<br />
          Buenos Aires · ARG
        </p>
      </div>
    </nav>
  );
}
