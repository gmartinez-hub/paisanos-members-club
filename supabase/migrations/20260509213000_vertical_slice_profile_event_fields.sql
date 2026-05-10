alter table public.profiles
  add column if not exists location text not null default 'Buenos Aires',
  add column if not exists member_since date not null default current_date,
  add column if not exists focus text not null default 'Construyendo en comunidad',
  add column if not exists can_help_with text not null default 'Compartir contexto y feedback util.',
  add column if not exists open_to text not null default 'Conversaciones, demos tempranas y feedback.',
  add column if not exists availability text not null default 'A coordinar',
  add column if not exists last_interaction text;

alter table public.events
  add column if not exists subtitle text not null default '',
  add column if not exists tags text[] not null default '{}',
  add column if not exists checkin_label text not null default 'Punto';

create unique index if not exists events_active_token_unique_idx
  on public.events (active_token)
  where active_token is not null;

insert into public.events (
  title,
  subtitle,
  description,
  speaker_name,
  location,
  event_date,
  max_capacity,
  status,
  active_token,
  tags,
  checkin_label
)
select
  'Founders Boarding Night',
  'Networking intencional para builders early-stage',
  'Una noche chica para cruzar builders que estan probando productos, compartir contexto real y activar conexiones utiles sin dinamicas forzadas.',
  'Bel Gonzalez',
  'Paisanos HQ',
  '2026-05-21 19:30:00-03'::timestamptz,
  32,
  'published',
  encode(gen_random_bytes(12), 'hex'),
  array['Founders', 'AI', 'Producto'],
  'Punto'
where not exists (
  select 1 from public.events where title = 'Founders Boarding Night'
);

insert into public.events (
  title,
  subtitle,
  description,
  speaker_name,
  location,
  event_date,
  max_capacity,
  status,
  active_token,
  tags,
  checkin_label
)
select
  'Demo Feedback Club',
  'Tres productos, feedback honesto y decisiones concretas',
  'Formato corto para mostrar demos y recibir feedback estructurado de miembros curados.',
  'Gabi Martinez',
  'Online + Paisanos HQ',
  '2026-06-02 18:30:00-03'::timestamptz,
  20,
  'draft',
  encode(gen_random_bytes(12), 'hex'),
  array['Feedback', 'Research', 'Producto'],
  'Punto'
where not exists (
  select 1 from public.events where title = 'Demo Feedback Club'
);

insert into public.feedback_processes (name, questions, deadline, status)
select
  'Paisaporte onboarding',
  '["Que campo sobra?", "Que campo falta?", "Cuando abandonarias?"]'::jsonb,
  '2026-05-31 23:59:00-03'::timestamptz,
  'active'
where not exists (
  select 1 from public.feedback_processes where name = 'Paisaporte onboarding'
);
