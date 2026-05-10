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
