-- Week A (Sep 3–9): real admin role + org verification groundwork.
-- (Run in the Supabase SQL Editor.)

-- is_admin(): "is the caller an admin?" as a reusable helper. security
-- definer so it can read profiles without tripping RLS recursively.
-- "stable" tells Postgres the answer doesn't change within a query.
create function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Verification submissions need a place to record the uploaded document,
-- when it was submitted, and the admin's decision note.
alter table public.organizations
  add column document_path text,
  add column submitted_at timestamptz,
  add column review_note text;

-- Organizations become publicly viewable so Browse can show a verified
-- badge next to each request. (No sensitive data lives here: name, type,
-- website, status. The document itself is in private storage.)
create policy "Organizations are publicly viewable"
  on public.organizations for select
  using (true);

-- Owners may update their own org row (resubmitting after a rejection).
create policy "Owners can update their own organization"
  on public.organizations for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Admins may update any org — that's how approve/reject works.
create policy "Admins can update any organization"
  on public.organizations for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins see everyone's profile (names in the verification queue) and
-- every match (real stats on the admin page).
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can view all matches"
  on public.matches for select
  using (public.is_admin());

-- Gate: only VERIFIED teams can receive offers. Third guard added to
-- propose_match; everything else unchanged.
create or replace function public.propose_match(p_donation_id uuid, p_request_id uuid)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_match_id uuid;
begin
  if not exists (
    select 1 from public.donations
    where id = p_donation_id
      and donor_id = auth.uid()
      and status = 'available'
  ) then
    raise exception 'That donation is not yours or is no longer available.';
  end if;

  if not exists (
    select 1 from public.requests
    where id = p_request_id and status = 'open'
  ) then
    raise exception 'That request is no longer open.';
  end if;

  -- NEW: the requesting team must be verified.
  if not exists (
    select 1
    from public.requests r
    join public.organizations o on o.owner_id = r.org_id
    where r.id = p_request_id
      and o.verification_status = 'verified'
  ) then
    raise exception 'That team has not been verified yet.';
  end if;

  insert into public.matches (donation_id, request_id)
  values (p_donation_id, p_request_id)
  returning id into v_match_id;

  update public.donations set status = 'matched' where id = p_donation_id;
  update public.requests  set status = 'matched' where id = p_request_id;

  return v_match_id;
end;
$$;
