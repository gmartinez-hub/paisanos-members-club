-- Paisaporte Signal Graph v0.
-- Run after docs/setup/apply-p0-backend.sql in Supabase Dashboard > SQL Editor.

create extension if not exists citext with schema extensions;

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) >= 2),
  email citext check (email is null or position('@' in email::text) > 1),
  company text not null default '',
  role text not null default '',
  context text not null default '',
  source text not null default 'manual' check (source in ('manual', 'event', 'luma', 'referral', 'proposal')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.person_tags (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'prospect', 'whitelist_request', 'luma_guest')),
  subject_id text not null check (length(trim(subject_id)) >= 2),
  tag text not null check (length(trim(tag)) between 2 and 80),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (subject_type, subject_id, tag)
);

create table if not exists public.person_notes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('profile', 'prospect', 'whitelist_request', 'luma_guest')),
  subject_id text not null check (length(trim(subject_id)) >= 2),
  body text not null check (length(trim(body)) between 2 and 1000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

drop trigger if exists prospects_set_updated_at on public.prospects;
create trigger prospects_set_updated_at
  before update on public.prospects
  for each row execute function app_private.set_updated_at();

create index if not exists prospects_email_idx
  on public.prospects (email)
  where email is not null;

create index if not exists prospects_status_source_idx
  on public.prospects (status, source);

create index if not exists person_tags_subject_idx
  on public.person_tags (subject_type, subject_id);

create index if not exists person_tags_tag_idx
  on public.person_tags (tag);

create index if not exists person_notes_subject_created_idx
  on public.person_notes (subject_type, subject_id, created_at desc);

alter table public.prospects enable row level security;
alter table public.person_tags enable row level security;
alter table public.person_notes enable row level security;

drop policy if exists "admins manage prospects" on public.prospects;
create policy "admins manage prospects"
  on public.prospects for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

drop policy if exists "admins manage person tags" on public.person_tags;
create policy "admins manage person tags"
  on public.person_tags for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

drop policy if exists "admins manage person notes" on public.person_notes;
create policy "admins manage person notes"
  on public.person_notes for all
  to authenticated
  using (app_private.current_user_is_admin())
  with check (app_private.current_user_is_admin());

grant select, insert, update, delete on table public.prospects to authenticated;
grant select, insert, delete on table public.person_tags to authenticated;
grant select, insert, delete on table public.person_notes to authenticated;

grant select, insert, update, delete on table public.prospects to service_role;
grant select, insert, update, delete on table public.person_tags to service_role;
grant select, insert, update, delete on table public.person_notes to service_role;
