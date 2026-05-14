# Paisaporte UX Spec

Last updated: 2026-05-14

## Overview

Paisaporte should feel like a premium private tool, not a presentation. The UX must help members understand value quickly and help admins operate in real time without friction.

The design language can use travel/passport cues, but actions must stay literal. The interface should say what it does, then add the Paisaporte layer through microcopy, visual treatment, and secondary labels.

## Information Architecture

```txt
Paisaporte
├── Inicio / Bitacora
├── Paisaporte
│   ├── Editar perfil
│   ├── Vista privada
│   ├── Tarjeta publica/controlada
│   └── Personas que cruzaste
├── Eventos / Escalas
│   ├── Listado
│   ├── Detalle
│   ├── RSVP / waitlist
│   └── Feedback post-evento
├── Miembros / Mapa
│   ├── Busqueda
│   ├── Perfil miembro
│   └── Solicitar / registrar cruce
├── Propuestas / Radar
│   ├── Enviar propuesta
│   ├── Mis propuestas
│   └── Propuestas aprobadas
├── Feedback / Notas
│   ├── Feedback pendiente
│   ├── Feedback completado
│   └── Resumen compartido
└── Admin / Torre de Control
    ├── Dashboard
    ├── Personas
    ├── Eventos
    ├── Check-in
    ├── Dinamicas
    ├── Propuestas
    ├── Feedback
    └── Accesos
```

## Key User Paths

1. Member activation: Login -> Onboarding -> Paisaporte created -> Inicio shows next event and suggested next action.
2. Event participation: Eventos -> Detalle -> Confirmar asistencia -> See attendees/suggested crosses -> Attend event.
3. QR social: Event dynamic active -> Member sees assigned crosses -> Scan QR -> Cross recorded -> Leave private note -> Post-event follow-up.
4. Proposal curation: Member submits proposal -> Admin reviews -> Status changes -> Admin requests info or converts -> Log records action.
5. Feedback loop: Admin launches feedback -> Member responds -> Admin reviews -> Optional curated summary to proposer.
6. Prospect mapping: Admin creates/imports prospect -> Adds tags/notes -> Links prospect to event/proposal/follow-up.

## Screen Specs

### Screen: Inicio / Bitacora

**Route:** `/club`

**Purpose:**
Give members a clear next action and make the app feel alive.

**Primary content:**
- Current Paisaporte state.
- Next event.
- Suggested people or active dynamic.
- Proposal/feedback/action reminders.

**Actions:**
- Open event.
- View Paisaporte.
- Continue feedback.
- Submit proposal.
- View suggested crosses.

**States:**
- No upcoming event.
- Upcoming event with RSVP available.
- Active event with dynamic.
- Post-event follow-up available.

### Screen: Paisaporte

**Route:** `/passport`

**Purpose:**
Show and manage the member's identity and history.

**Primary content:**
- Identity card.
- Context fields.
- QR.
- Event history.
- Cross history.
- Proposal and feedback summary.

**Actions:**
- Edit Paisaporte.
- Open public/controlled card.
- Copy/share controlled link.
- View crossed people.

**States:**
- Complete profile.
- Incomplete profile.
- No crosses yet.
- Public card disabled/enabled.

### Screen: Editar Paisaporte

**Route:** `/passport/edit`

**Purpose:**
Let members keep context current.

**Recommended sections:**
1. Identity: name, role, company/project, location.
2. Current context: what building, current focus.
3. Looking for: clients, beta testers, talent, advisors, feedback, intros.
4. Can offer: skills, experience, resources, network.
5. Availability and links.
6. Visibility controls for public card.

**Interaction principle:**
Show why each field matters: better crosses, better feedback, better intros.

### Screen: Eventos / Escalas

**Route:** `/events`

**Purpose:**
Let members understand events and act.

**Primary content:**
- Event cards with date, location, mode, status, seats.
- Clear registration mode: Paisanos, Luma, Hybrid.
- RSVP or Luma action.

**Actions:**
- Confirm attendance.
- Join waitlist.
- Cancel.
- Open Luma.
- Open detail.

### Screen: Event Detail

**Route:** `/events/[eventId]`

**Purpose:**
Prepare members for a specific event and support post-event continuity.

**Primary content:**
- Event description.
- Attendance state.
- Attendees.
- Active dynamic if any.
- Suggested people.
- Post-event feedback/crosses when closed.

**Actions:**
- RSVP/cancel.
- Open Luma.
- View attendee profile.
- Join dynamic.
- Give feedback.

### Screen: Miembros / Mapa

**Route:** `/directory`

**Purpose:**
Help members find useful people by intent, contribution, availability, event, and prior crosses.

**Actions:**
- Search.
- Filter.
- Open member profile.
- Request intro.
- View crossed before.

**States:**
- No members.
- No results.
- Event-filtered list.
- Suggested matches.

### Screen: Member Profile

**Route:** `/p/[token]` or `/members/[id]`

**Purpose:**
Show controlled member context and enable connection.

**Primary content:**
- Public/controlled identity.
- What they build.
- What they seek.
- What they can share.
- Shared event/cross context.

**Actions:**
- Register cross.
- Request intro.
- Open LinkedIn if visible.
- Save note if already crossed.

### Screen: Propuestas / Radar

**Route:** `/opportunities`

**Purpose:**
Let members submit ideas and see their own status.

**Proposal types:**
- Event
- Product validation
- Resource
- Guest
- Partnership
- Help request
- Talent/client opportunity
- Other

**Actions:**
- Submit proposal.
- View status.
- Respond to "needs info."
- See approved/public proposals if applicable.

### Screen: Feedback / Notas

**Route:** `/feedback`

**Purpose:**
Let members respond to event/proposal/product feedback requests.

**Primary content:**
- Pending feedback.
- Completed feedback.
- Shared summaries.

**Actions:**
- Respond.
- Continue draft.
- View summary.

## Admin Screens

### Admin Dashboard / Torre de Control

**Route:** `/admin`

**Purpose:**
One operational cockpit.

**Primary content:**
- Active event.
- Pending access requests.
- Proposals needing review.
- Feedback pending.
- Dynamic status.
- Follow-ups due.

**Actions:**
- Open active event operation.
- Start check-in.
- Start dynamic.
- Review proposals.
- Review access requests.

### Admin Personas

**Route:** `/admin/members` or `/admin/people`

**Purpose:**
Manage members, guests, and prospects.

**Primary content:**
- Person list with state: member, guest, prospect.
- Internal tags.
- Follow-up status.
- Last activity.

**Actions:**
- Open person detail.
- Add note.
- Add tag.
- Convert guest/prospect to invited member.
- Pause/reactivate member.

### Admin Person Detail

**Purpose:**
See the full internal context for one person.

**Tabs:**
- Profile
- Events
- Crosses
- Proposals
- Feedback
- Notes/log

**Important rule:**
Admin-only notes must never appear in member/public views.

### Admin Events

**Purpose:**
Create and operate events.

**Actions:**
- Create event.
- Edit event.
- Publish.
- Close.
- Choose mode: Paisanos, Luma, Hybrid.
- Open check-in.
- Open dynamics.
- Launch feedback.

### Admin Check-in

**Purpose:**
Operate event entry.

**Required improvement:**
Admin must choose the active event manually.

**Actions:**
- Select event.
- Search attendee.
- Seal entry.
- Open scanner.
- View Luma external link if Luma mode.

### Admin Dinamicas

**Purpose:**
Run live QR social dynamics.

**First dynamic: Cruces Curados**

**Flow:**
1. Admin selects event.
2. Admin creates dynamic.
3. Admin chooses manual or simple auto suggestions.
4. Members receive assigned crosses.
5. Scans record crosses.
6. Admin sees progress.
7. Event ends and follow-up appears.

**Live view should show:**
- Participants.
- Assigned crosses.
- Completed crosses.
- People with no crosses.
- Notes/follow-up count.

### Admin Propuestas

**Purpose:**
Curate submissions.

**Actions:**
- Review.
- Change status.
- Add internal note.
- Request info by email.
- Convert to event, feedback process, resource, or follow-up.
- View log.

### Admin Feedback

**Purpose:**
Create and review feedback loops.

**Actions:**
- Create feedback request.
- Choose target: event, proposal, product.
- Select recipients.
- Review responses.
- Create curated summary.
- Share summary with proposer if desired.

## Interaction Rules

1. Every visible button must navigate, write data, or clearly explain read-only state.
2. Admin actions should show status feedback immediately.
3. Member actions should avoid internal jargon.
4. Travel language should be a secondary layer, not the only explanation.
5. Empty states should always offer a next action or explain who can act.

## Responsive Behavior

Mobile matters most for:

- Paisaporte QR.
- Event detail.
- QR social scan.
- Check-in scanner.
- Post-event follow-up.

Desktop matters most for:

- Admin cockpit.
- Proposal review.
- Person detail.
- Feedback review.
- Event management.

## Implementation Priority

1. Naming and IA coherence.
2. Editable Paisaporte.
3. Member profiles and controlled public card.
4. Admin event selector for check-in.
5. Proposal curation and logs.
6. Admin people model with member/guest/prospect.
7. First QR social dynamic.
8. Feedback loops.
9. Contextual threads.
