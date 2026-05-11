alter table public.profiles
  add column if not exists email citext;

update public.profiles profile
set email = auth_user.email::citext
from auth.users auth_user
where profile.user_id = auth_user.id
  and profile.email is null;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (email)
  where email is not null;

alter table public.events
  add column if not exists luma_last_synced_at timestamptz,
  add column if not exists luma_last_webhook_at timestamptz,
  add column if not exists luma_sync_error text;

create table if not exists public.luma_guest_snapshots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  luma_event_id text not null,
  luma_guest_id text not null,
  email citext,
  full_name text,
  approval_status text,
  checked_in_at timestamptz,
  registered_at timestamptz,
  matched_user_id uuid references auth.users(id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (luma_event_id, luma_guest_id)
);

create table if not exists public.luma_webhook_events (
  webhook_id text primary key,
  event_type text not null,
  luma_event_id text,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

drop trigger if exists luma_guest_snapshots_set_updated_at on public.luma_guest_snapshots;
create trigger luma_guest_snapshots_set_updated_at
  before update on public.luma_guest_snapshots
  for each row execute function app_private.set_updated_at();

create index if not exists luma_guest_snapshots_event_id_idx
  on public.luma_guest_snapshots (event_id);

create index if not exists luma_guest_snapshots_email_idx
  on public.luma_guest_snapshots (email)
  where email is not null;

create index if not exists luma_guest_snapshots_matched_user_idx
  on public.luma_guest_snapshots (matched_user_id)
  where matched_user_id is not null;

create index if not exists luma_webhook_events_luma_event_idx
  on public.luma_webhook_events (luma_event_id)
  where luma_event_id is not null;

alter table public.luma_guest_snapshots enable row level security;
alter table public.luma_webhook_events enable row level security;

drop policy if exists "admins read luma guest snapshots" on public.luma_guest_snapshots;
create policy "admins read luma guest snapshots"
  on public.luma_guest_snapshots for select
  to authenticated
  using (app_private.current_user_is_admin());

drop policy if exists "admins read luma webhook events" on public.luma_webhook_events;
create policy "admins read luma webhook events"
  on public.luma_webhook_events for select
  to authenticated
  using (app_private.current_user_is_admin());

grant select on public.luma_guest_snapshots to authenticated;
grant select on public.luma_webhook_events to authenticated;
