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
    <div className="border-t border-line bg-transparent pt-4">
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

/* ── Admin metric tile — Argentine pastel palette ── */
const ADMIN_TILE_COLORS = {
  och: "bg-a-och text-a-och-t border-a-och-t/15",
  cel: "bg-a-cel text-a-cel-t border-a-cel-t/15",
  sag: "bg-a-sag text-a-sag-t border-a-sag-t/15",
  mal: "bg-a-mal text-a-mal-t border-a-mal-t/15",
  ter: "bg-a-ter text-a-ter-t border-a-ter-t/15",
} as const;

export function AdminMetricTile({
  label,
  value,
  caption,
  color = "och",
}: {
  caption?: string;
  color?: keyof typeof ADMIN_TILE_COLORS;
  label: string;
  value: string;
}) {
  return (
    <div className={`rounded-sm border p-4 ${ADMIN_TILE_COLORS[color]}`}>
      <p className="font-mono text-[8.5px] font-medium uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>
      <p className="mt-2 font-sans text-3xl font-black leading-none tabular-nums">{value}</p>
      {caption ? (
        <p className="mt-2 font-mono text-[9px] leading-snug opacity-70">{caption}</p>
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-a-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-parch transition-colors hover:bg-a-och-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
    >
      {children}
    </Link>
  );
}

export function AdminPrimaryButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-a-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-parch transition-colors hover:bg-a-och-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  );
}

export function AdminSecondaryLink({
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
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-a-line bg-transparent px-4 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-a-ink transition-colors hover:border-a-ink hover:bg-a-och/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-a-och-t"
    >
      {children}
    </Link>
  );
}

export function AdminStatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-a-line bg-a-och px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-a-och-t">
      {children}
    </span>
  );
}

export function AdminPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-sm border border-a-line bg-parch-2 ${className}`}>
      {children}
    </section>
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
