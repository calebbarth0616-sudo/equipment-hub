-- One row per user account. Supabase already has a hidden auth.users table
-- that stores emails + passwords; this table holds OUR extra info about them.
-- (Run in the Supabase SQL Editor, Week 1.)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('donor', 'org', 'admin')),
  name text not null,
  city text,
  state text,
  zip text,
  created_at timestamptz not null default now()
);
