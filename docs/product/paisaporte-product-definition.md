# Paisaporte Product Definition

Last updated: 2026-05-14

## Product Thesis

Paisaporte is the premium private tool Paisanos owns to turn events into relationships, proposals, product validation, talent/client signals, and follow-up opportunities.

The app should not become a generic social network, a plain event platform, or a CRM with better visuals. Its defensible value is the private signal graph Paisanos builds through real-world interaction.

## Strategic Position

Paisaporte is:

1. A premium identity layer for members.
2. A control tower for admins.
3. A signal graph for Paisanos.
4. A live dynamics engine for events.
5. A curation system for proposals, products, feedback, and people.
6. A bridge with Luma when Luma is useful for distribution or registration.

Paisaporte is not:

1. A replacement for Luma on day one.
2. A general forum.
3. A LinkedIn clone.
4. A member ranking system.
5. A generic CRM.

## Core Definitions

### Paisaporte

The member-facing identity and history layer. It includes who the person is, what they are building, what they are looking for, what they can contribute, their event history, their crosses, and selected public/shareable information.

### Torre de Control

The admin-facing operating cockpit. Admins use it to manage people, events, proposals, feedback, Luma status, check-in, live dynamics, and follow-up.

### Signal Graph

The internal Paisanos memory of people, behavior, proposals, products, event attendance, QR crosses, feedback, admin notes, tags, and next actions.

### Mapa

The member-facing directory/map. It is not just a list of people. It helps members prepare for events, discover useful people, and request or create meaningful crosses.

### Cruce

A meaningful connection between two people. It can be suggested by the system/admin, initiated through a QR scan, or created from an event/proposal context.

### Propuesta

Any idea, product, event, resource, request, partnership, guest, or opportunity submitted to Paisanos for curation.

## Person States

Paisaporte should support three person states.

### Miembro

Has active Paisaporte access. Can enter the app, edit their profile, RSVP, participate in dynamics, propose things, receive feedback, and view member-visible context.

### Invitado

Attends or registers for an event, possibly through Luma, but does not yet have full member access. Can be matched to a future Paisaporte account by email.

### Prospecto

A non-member Paisanos wants to map or follow because they may become a client, talent, partner, speaker, sponsor, founder to watch, or product-validation participant.

This distinction matters because non-members should not be treated as hidden members. They need explicit admin labeling, privacy boundaries, and a path to conversion if relevant.

## Data Visibility Model

### Member-visible

- Public/controlled profile fields.
- Event attendance where appropriate.
- Suggested crosses.
- Crosses they created.
- Feedback or summaries shared with them.
- Proposal status when they submitted the proposal.

### Admin-only

- Internal notes.
- Operational tags.
- Follow-up status.
- Potential-client/talent/partner/speaker labels.
- Proposal review notes.
- Person-level signal logs.
- Dynamic participation oversight.

### Audit/log

- Who changed what.
- When status changed.
- Which admin reviewed.
- Which event/proposal/feedback item generated the signal.

## Internal Admin Tags

Admin tags should be operational, not public categories.

Recommended first tags:

- Potencial cliente
- Potencial talento
- Potencial speaker
- Potencial sponsor
- Potencial partner
- Founder para seguir
- Producto para validar
- Alta senal
- Requiere follow-up
- No priorizar

Avoid public labels that make people feel ranked, scored, or boxed into categories.

## Paisaporte Visibility

Recommended model: dual layer.

### Private Paisaporte

Visible to logged-in members and admins. Includes richer context, event history, crosses, needs, contribution areas, and selected community context.

### Public/controlled card

A limited shareable view opened through QR or link. The member controls what is visible. This can be useful at events without exposing internal notes or sensitive context.

### Admin view

Includes internal notes, tags, logs, signals, proposals, follow-ups, and status.

## QR Social Dynamics

The first premium differentiator should be admin-triggered event dynamics.

### Family 1: Cruce Curado

Admin activates a dynamic for an event. Members see people they should meet and why.

### Family 2: Mision de Evento

Admin sends a prompt such as "find someone validating a B2B product" or "meet someone outside your industry."

### Family 3: Mesa Inteligente

Admin creates groups or tables based on complementarity, stage, problem, or desired mix.

### Family 4: Feedback Sprint

A member/prospect presents a product or proposal. Others give structured feedback during or after the event.

### Family 5: Follow-up Post Evento

After the event, members see who they crossed, can leave notes, request intros, or continue the conversation.

## Recommended First QR Dynamic

Build a simple but premium version:

1. Admin selects an event.
2. Admin activates "Cruces curados."
3. Members see 2-3 suggested people and a short reason.
4. A QR scan records a cross.
5. Each person can leave a private note.
6. Admin sees live progress: isolated people, completed crosses, pending matches.
7. After the event, each member sees "Personas que cruzaste" in Paisaporte.

## Directory / Mapa Purpose

Mapa exists to answer:

"Who inside or around Paisanos should I know, help, learn from, validate with, hire, or introduce?"

It should support:

- Preparing before events.
- Finding people by what they seek or offer.
- Viewing people from a past event.
- Discovering potential collaborators.
- Requesting intros.
- Seeing people crossed before.

It should not be a static people list.

## Propuestas / Curaduria

Members and prospects can propose anything useful to Paisanos:

- Event ideas
- Product demos
- Products to validate
- Resources
- Guests
- Partnerships
- Help requests
- Hiring/talent leads
- Client opportunities

Recommended statuses:

- Nueva
- En revision
- Falta info
- Aprobada
- Convertida
- Descartada
- Archivada

Every proposal should create a log:

- Who proposed it.
- What changed.
- Who reviewed it.
- Internal notes.
- Email/contact actions.
- Conversion target if it becomes an event, feedback process, thread, resource, or opportunity.

## Feedback

Feedback should exist in three forms.

### Event feedback

After an event, attendees give structured feedback.

### Proposal/product feedback

Admin selects people to review a proposal, product, or idea.

### Feedback to proposer

Paisanos can share a curated summary with the proposer. This is a premium loop: even a rejected proposal can produce useful learning.

## Threads / Foro

Do not build a general forum first.

Build contextual threads:

- Event thread
- Proposal thread
- Product validation thread
- Feedback thread
- Dynamic thread
- Resource thread

This keeps the community useful and prevents empty-channel syndrome.

## Luma Model

Recommended: hybrid.

Luma can remain useful for:

- Public event pages
- Registration
- Guest lists
- External reach

Paisaporte should own:

- Identity
- Admin curation
- Live dynamics
- QR social
- Feedback
- Proposal logs
- Event history
- Signal graph

Event modes:

- Paisanos: registration and check-in owned by Paisaporte.
- Luma: registration/check-in external, identity/history imported or linked.
- Hybrid: Luma for registration, Paisaporte for identity, dynamics, feedback, and history.

## Product Principles

1. Premium over generic.
2. Literal actions, poetic layer second.
3. No member categories or public ranking.
4. Events are the activation point.
5. QR is identity plus continuity, not just check-in.
6. Every proposal and cross should leave useful memory.
7. Admin needs clarity during live operation.
8. Members need to feel they hold something valuable.
9. Contextual threads before open forum.
10. Luma complements Paisaporte until Paisaporte earns more operational ownership.
