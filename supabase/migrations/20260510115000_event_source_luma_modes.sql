alter table public.events
  add column if not exists source text not null default 'paisanos'
    check (source in ('paisanos', 'luma')),
  add column if not exists luma_url text,
  add column if not exists luma_event_id text,
  add column if not exists registration_mode text not null default 'paisanos'
    check (registration_mode in ('paisanos', 'luma')),
  add column if not exists checkin_mode text not null default 'paisanos'
    check (checkin_mode in ('paisanos', 'luma', 'hybrid')),
  add column if not exists sync_status text not null default 'not_configured'
    check (sync_status in ('not_configured', 'manual', 'synced', 'error'));

create index if not exists events_source_idx
  on public.events (source);

create index if not exists events_luma_event_id_idx
  on public.events (luma_event_id)
  where luma_event_id is not null;
