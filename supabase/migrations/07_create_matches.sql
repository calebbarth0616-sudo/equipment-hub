-- A match pairs one donation with one request and tracks it through the
-- lifecycle: proposed -> accepted -> handed_to_nonprofit -> delivered
-- (or cancelled). This table is the app's "actual results" record.
-- (Run in the Supabase SQL Editor, Week 3.)
create table public.matches (
  id uuid primary key default gen_random_uuid(),

  -- a match is just two foreign keys shaking hands
  donation_id uuid not null references public.donations (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,

  status text not null default 'proposed'
    check (status in ('proposed', 'accepted', 'handed_to_nonprofit', 'delivered', 'cancelled')),

  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;

-- Policy with a subquery: "you may see this match if you own either side
-- of it" — the donation's donor OR the request's org.
create policy "Participants can view their matches"
  on public.matches for select
  using (
    exists (
      select 1 from public.donations d
      where d.id = donation_id and d.donor_id = auth.uid()
    )
    or exists (
      select 1 from public.requests r
      where r.id = request_id and r.org_id = auth.uid()
    )
  );

-- Deliberately NO insert or update policies: proposing a match must write
-- to three tables atomically (new match + both status flips), so those
-- writes happen inside database functions (migration 08). Direct inserts
-- from the browser stay forbidden.
