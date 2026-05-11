-- Paisanos Members Club P0 backend hardening.
-- Run this once in Supabase Dashboard > SQL Editor.

create or replace function app_private.current_user_has_approved_access()
returns boolean
language sql
security definer
set search_path = public, auth, pg_temp
stable
as $$
  select exists (
    select 1
    from public.whitelist_requests
    where email = (auth.jwt() ->> 'email')::citext
      and status = 'approved'
  )
  or exists (
    select 1
    from public.invitations
    where invited_email = (auth.jwt() ->> 'email')::citext
      and status = 'pending'
      and (expires_at is null or expires_at > now())
  );
$$;

revoke all on function app_private.current_user_has_approved_access() from public;
grant execute on function app_private.current_user_has_approved_access() to authenticated, service_role;

create or replace function app_private.mark_invitation_used_after_profile_insert()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  update public.invitations
  set status = 'used',
      used_at = now()
  where invited_email = (auth.jwt() ->> 'email')::citext
    and status = 'pending'
    and (expires_at is null or expires_at > now());

  return new;
end;
$$;

revoke all on function app_private.mark_invitation_used_after_profile_insert() from public;

drop trigger if exists profiles_mark_invitation_used on public.profiles;
create trigger profiles_mark_invitation_used
  after insert on public.profiles
  for each row execute function app_private.mark_invitation_used_after_profile_insert();

drop policy if exists "members create their own profile" on public.profiles;
drop policy if exists "members update their own profile" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;

create policy "approved users create own profile"
  on public.profiles for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and is_admin = false
    and is_active = true
    and app_private.current_user_has_approved_access()
  );

create policy "members update own public profile"
  on public.profiles for update
  to authenticated
  using (
    user_id = auth.uid()
    and is_admin = false
    and is_active = true
  )
  with check (
    user_id = auth.uid()
    and is_admin = false
    and is_active = true
  );

create policy "admins manage profiles"
  on public.profiles for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

drop policy if exists "visitors can request whitelist" on public.whitelist_requests;
drop policy if exists "requesters can view own whitelist request" on public.whitelist_requests;

create policy "visitors can request whitelist"
  on public.whitelist_requests for insert
  to anon, authenticated
  with check (
    email is not null
    and length(trim(full_name)) >= 2
    and length(trim(company)) >= 2
    and length(trim(reason)) between 10 and 300
    and position('@' in email::text) > 1
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

create policy "requesters can view own whitelist request"
  on public.whitelist_requests for select
  to authenticated
  using (email = (auth.jwt() ->> 'email')::citext);

drop policy if exists "members create contributions" on public.contributions;
drop policy if exists "members update own pending contributions" on public.contributions;
drop policy if exists "admins review contributions" on public.contributions;

create policy "members create contributions"
  on public.contributions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and review_note is null
    and published_at is null
  );

create policy "members update own pending contributions"
  on public.contributions for update
  to authenticated
  using (
    user_id = auth.uid()
    and status = 'pending'
  )
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and review_note is null
    and published_at is null
  );

create policy "admins review contributions"
  on public.contributions for update
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create or replace function app_private.enforce_rsvp_rules()
returns trigger
language plpgsql
set search_path = public, auth, pg_temp
as $$
declare
  confirmed_count integer;
  target_event record;
begin
  select id, max_capacity, registration_mode, status
  into target_event
  from public.events
  where id = new.event_id;

  if not found then
    raise exception 'event_not_found';
  end if;

  if new.status in ('confirmed', 'waitlist') then
    if target_event.status not in ('published', 'active') then
      raise exception 'event_not_open_for_rsvp';
    end if;

    if target_event.registration_mode <> 'paisanos' then
      raise exception 'event_uses_external_registration';
    end if;
  end if;

  if new.status = 'confirmed' then
    if target_event.max_capacity is not null then
      select count(*)
      into confirmed_count
      from public.rsvps
      where event_id = new.event_id
        and user_id <> new.user_id
        and status = 'confirmed';

      if confirmed_count >= target_event.max_capacity then
        raise exception 'event_full';
      end if;
    end if;

    new.confirmed_at = coalesce(new.confirmed_at, now());
    new.cancelled_at = null;
  elsif new.status = 'waitlist' then
    new.confirmed_at = null;
    new.cancelled_at = null;
  elsif new.status = 'cancelled' then
    new.cancelled_at = coalesce(new.cancelled_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists rsvps_enforce_rules on public.rsvps;
create trigger rsvps_enforce_rules
  before insert or update on public.rsvps
  for each row execute function app_private.enforce_rsvp_rules();

create or replace function app_private.enforce_check_in_rules()
returns trigger
language plpgsql
set search_path = public, auth, pg_temp
as $$
declare
  target_event record;
begin
  select id, checkin_mode, status
  into target_event
  from public.events
  where id = new.event_id;

  if not found then
    raise exception 'event_not_found';
  end if;

  if target_event.status not in ('published', 'active') then
    raise exception 'event_not_open_for_checkin';
  end if;

  if target_event.checkin_mode = 'luma' then
    raise exception 'event_uses_luma_checkin';
  end if;

  if not exists (
    select 1
    from public.rsvps
    where event_id = new.event_id
      and user_id = new.user_id
      and status = 'confirmed'
  ) then
    raise exception 'confirmed_rsvp_required_for_checkin';
  end if;

  new.checked_in_at = coalesce(new.checked_in_at, now());
  return new;
end;
$$;

drop trigger if exists check_ins_enforce_rules on public.check_ins;
create trigger check_ins_enforce_rules
  before insert or update on public.check_ins
  for each row execute function app_private.enforce_check_in_rules();

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

alter table public.profiles
  alter column focus set default 'Construyendo con Paisanos';

update public.profiles
set focus = 'Construyendo con Paisanos'
where focus = 'Construyendo en comunidad';
