-- Keep-alive, version 2. A daily one-row READ wasn't enough: Supabase
-- still flagged the project for "insufficient activity". This gives the
-- GitHub job something to WRITE: a one-row table holding the time of the
-- last check, updated through a function.
--
-- Safety: the table has RLS on and no policies, so nobody can read or
-- change it directly. The only way in is heartbeat(), which can do exactly
-- one thing: set that single timestamp to now(). Anyone holding the public
-- key could call it, and the worst they could do is update the timestamp.
-- (Run in the Supabase SQL Editor.)

create table public.heartbeat (
  id int primary key default 1 check (id = 1), -- the check allows only one row, ever
  last_ping timestamptz not null default now()
);

alter table public.heartbeat enable row level security;

insert into public.heartbeat default values;

create function public.heartbeat()
returns timestamptz
language sql
security definer set search_path = ''
as $$
  update public.heartbeat set last_ping = now() where id = 1
  returning last_ping;
$$;
