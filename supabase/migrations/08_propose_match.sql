-- propose_match: a donor offers one of their donations against an open
-- request. Three writes (new match + both status flips) happen atomically —
-- inside a function, all statements succeed or fail as one transaction.
-- security definer bypasses RLS, so the guards below carry the security.
-- Called from the app as supabase.rpc('propose_match', {...}).
-- (Run in the Supabase SQL Editor, Week 3.)
create function public.propose_match(p_donation_id uuid, p_request_id uuid)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_match_id uuid;
begin
  -- caller must own the donation and it must still be available
  if not exists (
    select 1 from public.donations
    where id = p_donation_id
      and donor_id = auth.uid()
      and status = 'available'
  ) then
    raise exception 'That donation is not yours or is no longer available.';
  end if;

  -- the request must still be open
  if not exists (
    select 1 from public.requests
    where id = p_request_id and status = 'open'
  ) then
    raise exception 'That request is no longer open.';
  end if;

  insert into public.matches (donation_id, request_id)
  values (p_donation_id, p_request_id)
  returning id into v_match_id;

  update public.donations set status = 'matched' where id = p_donation_id;
  update public.requests  set status = 'matched' where id = p_request_id;

  return v_match_id;
end;
$$;
