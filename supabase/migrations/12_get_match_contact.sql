-- Names on cards, half two: after a match is accepted, each participant may
-- see the other's name and email. Emails live in the protected auth.users
-- table, so this security-definer function is the single, guarded door to
-- them: it checks you're a participant and the match is accepted before
-- answering, and returns exactly two fields — nothing more.
-- (Run in the Supabase SQL Editor, Week 3.)
create function public.get_match_contact(p_match_id uuid)
returns table (name text, email text)
language plpgsql
security definer set search_path = ''
as $$
declare
  v_donor_id uuid;
  v_org_id   uuid;
  v_other    uuid;
begin
  -- Look up the match's two participants — only if it's been accepted.
  select d.donor_id, r.org_id
    into v_donor_id, v_org_id
  from public.matches m
  join public.donations d on d.id = m.donation_id
  join public.requests  r on r.id = m.request_id
  where m.id = p_match_id
    and m.status in ('accepted', 'handed_to_nonprofit', 'delivered');

  if v_donor_id is null then
    raise exception 'Match not found or not yet accepted.';
  end if;

  -- Whoever is asking gets the OTHER party's contact.
  if auth.uid() = v_donor_id then
    v_other := v_org_id;
  elsif auth.uid() = v_org_id then
    v_other := v_donor_id;
  else
    raise exception 'You are not part of this match.';
  end if;

  return query
    select p.name, u.email::text
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = v_other;
end;
$$;
