import Link from "next/link";
import type { LucideIcon } from "lucide-react";

/* ── Metric tile — boarding pass field aesthetic ── */
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
    <div className="border-t-2 border-foreground bg-transparent pt-4">
      <Icon className="mb-4 text-stamp-fg" size={20} />
      <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1.5 font-sans text-4xl font-black leading-none">{value}</p>
      {caption ? (
        <p className="mt-2 font-mono text-[9px] text-ink-muted">{caption}</p>
      ) : null}
    </div>
  );
}

/* ── Admin metric tile — parchment palette ── */
export function AdminMetricTile({
  label,
  value,
  caption,
  color = "och",
}: {
  caption?: string;
  color?: "och" | "cel" | "sag" | "mal" | "ter";
  label: string;
  value: string;
}) {
  const colorMap = {
    och: "bg-a-och text-a-och-t",
    cel: "bg-a-cel text-a-cel-t",
    sag: "bg-a-sag text-a-sag-t",
    mal: "bg-a-mal text-a-mal-t",
    ter: "bg-a-ter text-a-ter-t",
  };

  return (
    <div className={`rounded-sm p-4 ${colorMap[color]}`}>
      <p className="font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] opacity-65">
        {label}
      </p>
      <p className="mt-2 font-sans text-3xl font-black leading-none">{value}</p>
      {caption ? (
        <p className="mt-2 font-mono text-[9px] opacity-55">{caption}</p>
      ) : null}
    </div>
  );
}

/* ── Status badge ── */
export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm bg-stamp px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-stamp-fg">
      {children}
    </span>
  );
}

/* ── Primary button — dark + stamp (lime) ── */
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-runway px-4 font-sans text-sm font-black text-stamp transition hover:opacity-88"
    >
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
      href={href}
      target={target}
      rel={target ? "noreferrer" : undefined}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-runway px-4 font-sans text-sm font-black text-stamp transition hover:opacity-88"
    >
      {children}
    </Link>
  );
}

/* ── Secondary button — outlined ── */
export function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line bg-paper px-4 font-sans text-sm font-black text-foreground transition hover:border-foreground hover:bg-stamp hover:text-stamp-fg"
    >
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
      href={href}
      target={target}
      rel={target ? "noreferrer" : undefined}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-line bg-paper px-4 font-sans text-sm font-black text-foreground transition hover:border-foreground hover:bg-stamp hover:text-stamp-fg"
    >
      {children}
    </Link>
  );
}

/* ── Admin buttons — parchment context ── */
export function AdminPrimaryLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-a-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-parch transition hover:opacity-88"
    >
      {children}
    </Link>
  );
}

export function AdminSecondaryLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-a-line bg-transparent px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-a-ink transition hover:border-a-ink"
    >
      {children}
    </Link>
  );
}

/* ── Muted note ── */
export function MutedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-line bg-background px-3 py-3 font-mono text-sm leading-6 text-ink-muted">
      {children}
    </p>
  );
}

/* ── Panel ── */
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
