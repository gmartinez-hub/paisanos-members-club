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
