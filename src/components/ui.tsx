import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function MetricTile({
  icon: Icon,
  label,
  value,
  caption,
}: {
  caption?: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-foreground bg-transparent pt-4">
      <Icon className="mb-5 text-signal" size={22} />
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-4xl font-black leading-none">{value}</p>
      {caption ? <p className="mt-2 text-xs text-ink-muted">{caption}</p> : null}
    </div>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm bg-stamp px-2 py-1 text-xs font-black text-foreground">
      {children}
    </span>
  );
}

export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-foreground px-4 text-sm font-black text-paper transition hover:bg-signal hover:text-foreground">
      {children}
    </button>
  );
}

export function PrimaryLink({
  children,
  href,
  target,
}: {
  children: React.ReactNode;
  href: string;
  target?: "_blank";
}) {
  return (
    <Link
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-foreground px-4 text-sm font-black text-paper transition hover:bg-signal hover:text-foreground"
      href={href}
      rel={target ? "noreferrer" : undefined}
      target={target}
    >
      {children}
    </Link>
  );
}

export function SecondaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-foreground bg-paper px-4 text-sm font-black text-foreground transition hover:bg-stamp">
      {children}
    </button>
  );
}

export function SecondaryLink({
  children,
  href,
  target,
}: {
  children: React.ReactNode;
  href: string;
  target?: "_blank";
}) {
  return (
    <Link
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-foreground bg-paper px-4 text-sm font-black text-foreground transition hover:bg-stamp"
      href={href}
      rel={target ? "noreferrer" : undefined}
      target={target}
    >
      {children}
    </Link>
  );
}

export function MutedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-line bg-background px-3 py-3 text-sm leading-6 text-ink-muted">
      {children}
    </p>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-t border-line ${className}`}>
      {children}
    </section>
  );
}
