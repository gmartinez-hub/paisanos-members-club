create extension if not exists "pgcrypto";
create extension if not exists "citext";

create schema if not exists app_private;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null,
  company text not null,
  avatar_url text,
  skills text[] not null default '{}',
  building varchar(140),
  looking_for text[] not null default '{}',
  qr_base_url text,
  linkedin_url text,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  invited_email citext not null,
  invited_name text not null,
  invited_by uuid references auth.users(id) on delete set null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists invitations_pending_email_idx
  on public.invitations (invited_email)
  where status = 'pending';

create table if not exists public.whitelist_requests (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text not null,
  company text not null,
  reason varchar(300) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  speaker_name text,
  location text,
  event_date timestamptz not null,
  max_capacity integer,
  status text not null default 'draft' check (status in ('draft', 'published', 'active', 'closed')),
  active_token text,
  image_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'waitlist')),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null check (method in ('scanned_by_staff', 'self_checkin')),
  checked_in_at timestamptz not null default now(),
  ip_address inet,
  unique (event_id, user_id)
);

create table if not exists public.event_matches (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  matches jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('solution', 'event_proposal')),
  title text not null,
  description varchar(300) not null,
  category text not null,
  file_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.feedback_processes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  questions jsonb not null default '[]'::jsonb,
  target_members uuid[] not null default '{}',
  deadline timestamptz,
  status text not null default 'active' check (status in ('active', 'closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  process_id uuid not null references public.feedback_processes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (process_id, user_id)
);

create or replace function app_private.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public, auth, pg_temp
stable
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and is_admin = true
      and is_active = true
  );
$$;

revoke all on function app_private.current_user_is_admin() from public;
grant execute on function app_private.current_user_is_admin() to authenticated, service_role;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function app_private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.whitelist_requests enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.check_ins enable row level security;
alter table public.event_matches enable row level security;
alter table public.contributions enable row level security;
alter table public.feedback_processes enable row level security;
alter table public.feedback_responses enable row level security;

create policy "profiles are visible to active members"
  on public.profiles for select
  to authenticated
  using (is_active = true or user_id = auth.uid() or app_private.current_user_is_admin());

create policy "members create their own profile"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "members update their own profile"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid() or app_private.current_user_is_admin())
  with check (user_id = auth.uid() or app_private.current_user_is_admin());

create policy "admins manage invitations"
  on public.invitations for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "invitees can view their pending invite"
  on public.invitations for select
  to authenticated
  using (invited_email = (auth.jwt() ->> 'email')::citext);

create policy "anyone can request whitelist"
  on public.whitelist_requests for insert
  to anon, authenticated
  with check (true);

create policy "admins manage whitelist"
  on public.whitelist_requests for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "members see published events"
  on public.events for select
  to authenticated
  using (status in ('published', 'active', 'closed') or app_private.current_user_is_admin());

create policy "admins manage events"
  on public.events for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "members see rsvps"
  on public.rsvps for select
  to authenticated
  using (true);

create policy "members manage own rsvps"
  on public.rsvps for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "members update own rsvps"
  on public.rsvps for update
  to authenticated
  using (user_id = auth.uid() or app_private.current_user_is_admin())
  with check (user_id = auth.uid() or app_private.current_user_is_admin());

create policy "admins delete rsvps"
  on public.rsvps for delete
  to authenticated
  using (app_private.current_user_is_admin());

create policy "members see own checkins"
  on public.check_ins for select
  to authenticated
  using (user_id = auth.uid() or app_private.current_user_is_admin());

create policy "admins manage checkins"
  on public.check_ins for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "members see own matches"
  on public.event_matches for select
  to authenticated
  using (user_id = auth.uid() or app_private.current_user_is_admin());

create policy "admins manage matches"
  on public.event_matches for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "members see approved contributions"
  on public.contributions for select
  to authenticated
  using (status = 'approved' or user_id = auth.uid() or app_private.current_user_is_admin());

create policy "members create contributions"
  on public.contributions for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "members update own pending contributions"
  on public.contributions for update
  to authenticated
  using ((user_id = auth.uid() and status = 'pending') or app_private.current_user_is_admin())
  with check ((user_id = auth.uid() and status = 'pending') or app_private.current_user_is_admin());

create policy "admins delete contributions"
  on public.contributions for delete
  to authenticated
  using (app_private.current_user_is_admin());

create policy "target members see feedback processes"
  on public.feedback_processes for select
  to authenticated
  using (auth.uid() = any(target_members) or app_private.current_user_is_admin());

create policy "admins manage feedback processes"
  on public.feedback_processes for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

create policy "members manage own feedback responses"
  on public.feedback_responses for all
  to authenticated
  using (user_id = auth.uid() or app_private.current_user_is_admin())
  with check (user_id = auth.uid() or app_private.current_user_is_admin());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant insert on public.whitelist_requests to anon;
grant usage on schema app_private to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "members upload own avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "members update own avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and owner = auth.uid())
  with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');
