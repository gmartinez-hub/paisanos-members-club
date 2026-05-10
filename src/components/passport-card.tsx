import { QRCodeSVG } from "qrcode.react";
import type { MemberView } from "@/lib/community";

function BPField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-mono text-[7.5px] font-medium uppercase tracking-[0.2em] text-paper/30">
        {label}
      </p>
      <p className="mt-1 font-sans text-base font-bold leading-tight text-paper/90">
        {value}
      </p>
    </div>
  );
}

export function PassportCard({ member }: { member: MemberView }) {
  return (
    <div className="ticket-edge-bg overflow-visible rounded-sm border border-line bg-paper shadow-[0_8px_32px_rgba(12,26,38,.12)]">

      {/* ── HEADER — dark boarding pass top section ── */}
      <div className="rounded-t-sm bg-runway px-5 pb-5 pt-4">

        {/* Airline-style header row */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-[8px] font-medium uppercase tracking-[0.22em] text-stamp">
              Paisanos Members Club
            </p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-paper/25">
              Paisaporte Digital · Credencial activa
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[8px] text-paper/20 tracking-[0.1em]">
              PMC-{String(member.name).split(" ").map(w => w[0]).join("")}
            </p>
          </div>
        </div>

        {/* Identity row */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <BPField label="Apellido / Nombre" value={member.name} className="col-span-2" />
              <BPField label="Rol" value={member.role} />
              <BPField label="Empresa" value={member.company} />
              <BPField label="Sede" value={member.location} />
              <BPField label="Miembro desde" value={member.memberSince} />
            </div>
          </div>
          {/* QR code */}
          <div className="flex-shrink-0 rounded-sm bg-paper p-2">
            <QRCodeSVG value={member.qrValue} size={80} />
          </div>
        </div>
      </div>

      {/* ── PERFORATION DIVIDER WITH PUNCHED HOLES ── */}
      <div className="perforation-dark" />

      {/* ── STATS ROW — boarding pass gate info ── */}
      <div className="grid grid-cols-3 divide-x divide-line bg-paper">
        <div className="px-4 py-3">
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Eventos
          </p>
          <p className="mt-1.5 font-sans text-3xl font-black text-foreground leading-none">
            {member.attendedEvents}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Aportes
          </p>
          <p className="mt-1.5 font-sans text-3xl font-black text-foreground leading-none">
            {member.feedbackGiven}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Nivel
          </p>
          <p className="mt-1.5 font-sans text-sm font-black text-foreground leading-tight">
            Paisano
          </p>
        </div>
      </div>

      {/* ── PERFORATION DIVIDER ── */}
      <div className="perforation" />

      {/* ── FIELDS — lower boarding pass section ── */}
      <div className="grid gap-4 px-5 pb-4 pt-4 bg-paper">
        <div>
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Foco actual
          </p>
          <p className="marker mt-2 inline font-sans text-lg font-black">
            {member.focus}
          </p>
        </div>

        <div>
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Estoy construyendo
          </p>
          <p className="mt-2 font-mono text-sm leading-6 text-ink-muted">
            {member.building}
          </p>
        </div>

        <div>
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Busco
          </p>
          <p className="mt-2 font-mono text-sm leading-6 text-ink-muted">
            {member.lookingFor}
          </p>
        </div>

        {/* Skills as boarding pass tags */}
        <div className="flex flex-wrap gap-1.5">
          {member.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-sm border border-line bg-background px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-ink-muted"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── PERFORATION + BARCODE STUB ── */}
      <div className="perforation" />

      <div className="flex items-center justify-between gap-4 px-5 py-3 bg-paper rounded-b-sm">
        <div className="barcode flex-1" />
        <div
          className="boarding-stamp inline-block rounded-sm border-2 border-stamp px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-stamp-fg"
        >
          Activo
        </div>
      </div>

      {/* ── MRZ — Machine Readable Zone ── */}
      <div className="rounded-b-sm border-t border-line bg-background px-5 py-2">
        <p className="mrz-line">
          {`PMCARG<<${member.name.toUpperCase().replace(/\s/g, "<").padEnd(28, "<")}`}
        </p>
        <p className="mrz-line">
          {`PMC${String(member.attendedEvents).padStart(3, "0")}<8<ARG2401010M26123186<<<<<<<<<<<<4`}
        </p>
      </div>
    </div>
  );
}
