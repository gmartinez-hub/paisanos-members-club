# Paisaporte PRD And Roadmap

Last updated: 2026-05-14

## Problem Statement

Paisanos creates value through people, events, proposals, products, feedback, and trust. Today, too much of that value can disappear into event tools, messages, memory, spreadsheets, and unstructured follow-up.

Paisaporte should make that value visible and actionable. It should help members know who to meet and why, help admins operate and curate in real time, and help Paisanos build a private signal graph of people and opportunities.

## Solution

Build Paisaporte as the premium proprietary tool for Paisanos:

- Member identity and history.
- Event operations.
- Live QR dynamics.
- Proposal curation.
- Feedback loops.
- Contextual threads.
- Luma bridge.
- Internal signal graph for members, guests, prospects, clients, talent, products, and follow-ups.

## User Stories

1. As a member, I want a premium Paisaporte, so that I can show who I am inside Paisanos.
2. As a member, I want to edit my Paisaporte, so that my current context stays useful.
3. As a member, I want to see events, so that I can decide where to participate.
4. As a member, I want to confirm attendance, so that Paisanos knows I am going.
5. As a member, I want to see who else is going, so that I can prepare.
6. As a member, I want suggested people to meet, so that events create better connections.
7. As a member, I want to scan another Paisaporte, so that a cross is recorded.
8. As a member, I want to leave private notes after a cross, so that I can follow up later.
9. As a member, I want to see people I crossed, so that events continue after they end.
10. As a member, I want to submit a proposal, so that Paisanos can review it.
11. As a member, I want to know the state of my proposal, so that I understand what happens next.
12. As a member, I want curated feedback on a proposal/product, so that I can improve it.
13. As a member, I want contextual conversations, so that discussion stays tied to events or proposals.
14. As an admin, I want to manage members, so that Paisanos can keep the network accurate.
15. As an admin, I want to manage guests and prospects, so that Paisanos can track people outside membership.
16. As an admin, I want to tag people internally, so that follow-up is actionable.
17. As an admin, I want internal notes on people, so that context is not lost.
18. As an admin, I want to manage events, so that I can create, edit, publish, close, and run them.
19. As an admin, I want to choose event mode, so that each event can be Paisanos, Luma, or Hybrid.
20. As an admin, I want to select the active check-in event, so that operations do not depend on automatic guessing.
21. As an admin, I want to scan QR codes for check-in, so that event entry is fast.
22. As an admin, I want to run live dynamics, so that people meet intentionally.
23. As an admin, I want to see live dynamic progress, so that I can intervene during an event.
24. As an admin, I want to curate proposals, so that Paisanos can decide what is worth pursuing.
25. As an admin, I want proposal logs, so that every decision has context.
26. As an admin, I want to convert a proposal into an event, feedback process, resource, or follow-up, so that good signals become action.
27. As an admin, I want to launch feedback after events, so that Paisanos learns from members.
28. As an admin, I want to launch feedback for products/proposals, so that members help validate opportunities.
29. As Paisanos leadership, I want a signal graph, so that events compound into strategic knowledge.
30. As Paisanos leadership, I want to identify potential clients, talent, speakers, sponsors, and partners, so that the network becomes more valuable.

## Phases

### P0.5 - Coherence And Operational Foundation

Goal: make current sections real, clear, and consistent.

Scope:

- Literal naming with subtle Paisaporte language.
- Onboarding rewritten around activation and context.
- Editable Paisaporte.
- Member/public/admin visibility model.
- Directory rows become clickable profiles.
- Admin event selector for check-in.
- Admin visual hierarchy cleanup.
- Proposals get statuses and admin curation.
- Basic proposal log.
- Feedback clarified as event/proposal feedback.
- Product docs kept current.

Out of scope:

- Full analytics.
- Full Luma API.
- Full forum.
- Automated matching engine.

### P1 - Premium Event Operations

Goal: operate a real Paisanos event end to end.

Scope:

- Create/edit/publish/close events.
- Event modes: Paisanos, Luma, Hybrid.
- RSVP/waitlist/check-in complete.
- QR check-in with clear result states.
- Event attendee profiles.
- Post-event feedback.
- Admin cockpit for live event operation.
- Luma link/source fields fully respected.
- Guest/prospect model introduced in admin.

Out of scope:

- Automatic external Luma sync if credentials are not ready.
- Complex scoring or AI matching.

### P2 - QR Social And Signal Graph

Goal: make Paisaporte meaningfully different from any event tool.

Scope:

- Cruces curados dynamic.
- Member QR social scan.
- Cross records.
- Private notes.
- Admin live dynamics view.
- "Personas que cruzaste" in Paisaporte.
- Admin signal graph view.
- Internal person tags.
- Proposal conversion paths.
- Feedback to proposer.

Out of scope:

- Public rankings.
- General open forum.
- Fully automated hiring/client scoring.

### P3 - Luma, Threads, And Expansion

Goal: connect external systems and deepen community loops.

Scope:

- Luma API and webhooks.
- Import Luma guests.
- Match Luma guests by email.
- Hybrid registration and Paisaporte dynamics.
- Contextual threads for events/proposals/products.
- Email transactional flows.
- More complete prospect/client/talent pipelines.

### P4 - Platform Potential

Goal: decide whether Paisaporte remains Paisanos-only or becomes replicable.

Scope:

- Membership benefits.
- Paid/private tiers if useful.
- Partner/community portability.
- Advanced research panel.
- Talent/client opportunity workflows.
- Replicable community OS packaging.

## Implementation Decisions

### Naming

Use literal action labels first and Paisaporte language second.

Examples:

- Inicio / Bitacora
- Paisaporte
- Eventos / Escalas
- Miembros / Mapa
- Propuestas / Radar
- Feedback / Notas
- Check-in / Puerta
- Admin / Torre de Control

### Person Model

Introduce states:

- member
- guest
- prospect

Keep member-visible data separate from admin-only notes and audit logs.

### Proposal Model

Proposals can be broad. The system should not over-constrain early.

Types:

- event
- product_validation
- resource
- partnership
- guest
- help_request
- talent
- client_opportunity
- other

Statuses:

- new
- in_review
- needs_info
- approved
- converted
- discarded
- archived

### QR Dynamic Model

Start with Cruces Curados.

Entities:

- event
- dynamic
- assignment
- cross
- note

First version can use admin/manual or simple rules; do not overbuild AI matching.

### Feedback Model

Support feedback target types:

- event
- proposal
- product
- person/admin follow-up

Keep respondent answers separate from curated summaries shared back to proposers.

### Threads Model

Threads must be contextual.

Allowed first contexts:

- event
- proposal
- product_validation
- feedback
- resource

## Data And Trust Principles

1. Do not expose admin notes to members.
2. Do not create public human rankings.
3. Make person states explicit.
4. Treat prospect data carefully and purposefully.
5. Prefer operational tags over identity labels.
6. Keep logs for admin decisions.
7. Let members understand why profile data helps them.

## Out Of Scope For Now

- QA pass.
- PostHog instrumentation.
- General forum/feed.
- Automated talent scoring.
- Public SEO pages.
- Paid membership flows.
- Full Luma sync until credentials and account capabilities are confirmed.

## Open Product Questions

1. Which fields from Paisaporte should be shareable publicly?
2. Should QR social require mutual confirmation, or is one scan enough inside an active event dynamic?
3. Should prospects be created manually, via Luma import, via proposal submission, or all three?
4. What is the first real event where Cruces Curados can be tested?
5. What level of email automation does Paisanos want in the first live version?
