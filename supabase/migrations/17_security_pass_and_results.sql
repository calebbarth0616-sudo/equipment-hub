-- Week B/C security pass + public results (final pre-pilot migration).
-- Three fixes from the known-gaps list, one new public function.
-- (Run in the Supabase SQL Editor.)

-- FIX 1: enforce roles on posting. The old insert policies only checked
-- "you are inserting as yourself" — an org account could post donations
-- and a donor could post requests. Recreate them with a role check.
drop policy "Donors can create their own donations" on public.donations;
create policy "Donors can create their own donations"
  on public.donations for insert
  with check (
    auth.uid() = donor_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'donor'
    )
  );

drop policy "Orgs can create their own requests" on public.requests;
create policy "Orgs can create their own requests"
  on public.requests for insert
  with check (
    auth.uid() = org_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'org'
    )
  );

-- FIX 2: the decline edge case. If an org closed a request while an offer
-- was pending, declining that offer used to flip the request back to
-- 'open'. Adding "and status = 'matched'" means decline only reopens
-- requests that are still in the matched state — a closed one stays closed.
create or replace function public.decline_match(p_match_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_donation_id uuid;
  v_request_id  uuid;
begin
  if not exists (
    select 1
    from public.matches m
    join public.requests r on r.id = m.request_id
    where m.id = p_match_id
      and m.status = 'proposed'
      and r.org_id = auth.uid()
  ) then
    raise exception 'Match not found, already handled, or not yours to answer.';
  end if;

  select donation_id, request_id
    into v_donation_id, v_request_id
  from public.matches
  where id = p_match_id;

  update public.matches   set status = 'cancelled' where id = p_match_id;
  update public.donations set status = 'available' where id = v_donation_id;
  update public.requests  set status = 'open'
    where id = v_request_id and status = 'matched';
end;
$$;

-- NEW: public impact numbers for the /results page. Matches are only
-- visible to their participants and admins, so this security-definer
-- function is the deliberate public window: aggregate counts only,
-- never row-level detail.
create function public.get_public_results()
returns table (delivered_matches bigint, items_delivered bigint, teams_helped bigint)
language sql
stable
security definer set search_path = ''
as $$
  select
    count(*)::bigint as delivered_matches,
    coalesce(sum(d.quantity), 0)::bigint as items_delivered,
    count(distinct r.org_id)::bigint as teams_helped
  from public.matches m
  join public.donations d on d.id = m.donation_id
  join public.requests  r on r.id = m.request_id
  where m.status = 'delivered';
$$;
