-- accept_match / decline_match: the org's answer to a proposed match.
-- Shared guard: the match must exist, still be 'proposed', and its request
-- must belong to the caller (checked via the join). decline releases both
-- sides back to the pool — propose_match in reverse, equally atomic.
-- (Run in the Supabase SQL Editor, Week 3.)
create function public.accept_match(p_match_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
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

  update public.matches set status = 'accepted' where id = p_match_id;
end;
$$;

create function public.decline_match(p_match_id uuid)
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
  update public.requests  set status = 'open'      where id = v_request_id;
end;
$$;
