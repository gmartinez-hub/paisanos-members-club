import { QRCodeSVG } from "qrcode.react";
import { BadgeCheck } from "lucide-react";
import type { MemberView } from "@/lib/community";

export function PassportCard({ member }: { member: MemberView }) {
  return (
    <div className="ticket-edge overflow-hidden rounded-sm border-2 border-foreground bg-paper">
      <div className="bg-foreground p-5 text-paper">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stamp">
              Paisaporte PMC
            </p>
            <h2 className="mt-1 text-2xl font-black">Credencial viva</h2>
          </div>
          <BadgeCheck className="text-signal" size={30} />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-paper/70">Miembro verificado</p>
            <h3 className="mt-2 text-3xl font-black leading-none">{member.name}</h3>
            <p className="mt-2 text-sm text-paper/70">
              {member.role} · {member.company}
            </p>
          </div>
          <div className="rounded-sm bg-paper p-2 text-runway">
            <QRCodeSVG value={member.qrValue} size={88} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-b border-foreground">
        <div className="border-r border-foreground p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
            Eventos
          </p>
          <p className="mt-2 text-2xl font-black">{member.attendedEvents}</p>
        </div>
        <div className="border-r border-foreground p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
            Aportes
          </p>
          <p className="mt-2 text-2xl font-black">{member.feedbackGiven}</p>
        </div>
        <div className="p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
            Desde
          </p>
          <p className="mt-2 text-sm font-black">{member.memberSince}</p>
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
            Foco actual
          </p>
          <p className="marker mt-2 inline text-lg font-black">{member.focus}</p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-ink-muted">
            Estoy construyendo
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-muted">{member.building}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {member.skills.map((skill) => (
            <span
              className="rounded-sm border border-foreground px-2 py-1 text-xs font-black"
              key={skill}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
