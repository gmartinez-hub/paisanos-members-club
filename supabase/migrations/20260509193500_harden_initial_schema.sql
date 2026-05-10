create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "anyone can request whitelist" on public.whitelist_requests;
create policy "visitors can request whitelist"
  on public.whitelist_requests for insert
  to anon, authenticated
  with check (
    email is not null
    and length(trim(full_name)) >= 2
    and length(trim(company)) >= 2
    and length(trim(reason)) between 10 and 300
    and position('@' in email::text) > 1
  );

drop policy if exists "avatars are publicly readable" on storage.objects;

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create index if not exists invitations_invited_by_idx on public.invitations (invited_by);
create index if not exists whitelist_requests_reviewed_by_idx on public.whitelist_requests (reviewed_by);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists events_status_event_date_idx on public.events (status, event_date);
create index if not exists rsvps_user_id_idx on public.rsvps (user_id);
create index if not exists rsvps_event_status_idx on public.rsvps (event_id, status);
create index if not exists check_ins_user_id_idx on public.check_ins (user_id);
create index if not exists event_matches_user_id_idx on public.event_matches (user_id);
create index if not exists contributions_user_id_idx on public.contributions (user_id);
create index if not exists contributions_reviewed_by_idx on public.contributions (reviewed_by);
create index if not exists contributions_status_idx on public.contributions (status);
create index if not exists feedback_processes_created_by_idx on public.feedback_processes (created_by);
create index if not exists feedback_processes_status_idx on public.feedback_processes (status);
create index if not exists feedback_responses_user_id_idx on public.feedback_responses (user_id);
