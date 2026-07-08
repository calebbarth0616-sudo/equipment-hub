-- Row Level Security policies: each policy is one sentence of permission.
-- No matching policy = not allowed. auth.uid() = the logged-in user's ID.
-- (Run in the Supabase SQL Editor, Week 1.)
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Owners can view their own organization"
  on public.organizations for select
  using (auth.uid() = owner_id);

create policy "Owners can create their own organization"
  on public.organizations for insert
  with check (auth.uid() = owner_id);
