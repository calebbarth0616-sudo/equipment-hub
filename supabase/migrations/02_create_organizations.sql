-- Extra details for school/league accounts only (donors don't get a row here).
-- (Run in the Supabase SQL Editor, Week 1.)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  org_name text not null,
  org_type text not null check (org_type in ('school', 'community_league', 'other')),
  website text,
  -- every org starts unverified; an admin flips this after reviewing docs (Week 5)
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);
