-- Run this once in the Supabase SQL editor to enable the "open rooms" browser.
-- Online play works WITHOUT this table (join-by-code only); the table just
-- powers the list of available rooms in the lobby.

create table if not exists public.rooms (
  code        text primary key,
  host        text not null,
  count       int  not null default 1,
  started     boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- This is a public party-game lobby, so allow the anon (publishable) key to
-- read/write room rows. No sensitive data lives here.
alter table public.rooms enable row level security;

drop policy if exists "rooms anon all" on public.rooms;
create policy "rooms anon all"
  on public.rooms for all
  to anon
  using (true)
  with check (true);

-- Optional housekeeping: a scheduled job could delete stale rooms, e.g.
--   delete from public.rooms where updated_at < now() - interval '1 hour';
