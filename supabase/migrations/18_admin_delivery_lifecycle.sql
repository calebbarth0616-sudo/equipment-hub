-- Closes the last functional gap before the pilot: an admin can advance an
-- accepted match through the delivery lifecycle. Without this, nothing
-- could ever reach 'delivered', so /results could never count anything.
--
-- Allowed moves (anything else is refused):
--   accepted            -> handed_to_nonprofit  (partner has the equipment)
--   accepted            -> delivered            (direct handoff, no partner)
--   handed_to_nonprofit -> delivered
-- On 'delivered', the donation becomes 'delivered' and the request
-- 'fulfilled' — all three writes atomic, like every other match function.
-- (Run in the Supabase SQL Editor, AFTER migration 17.)
create function public.admin_advance_match(p_match_id uuid, p_status text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_current     text;
  v_donation_id uuid;
  v_request_id  uuid;
begin
  if not public.is_admin() then
    raise exception 'Only admins can update delivery status.';
  end if;

  select status, donation_id, request_id
    into v_current, v_donation_id, v_request_id
  from public.matches
  where id = p_match_id;

  if v_current is null then
    raise exception 'Match not found.';
  end if;

  if not (
    (v_current = 'accepted' and p_status in ('handed_to_nonprofit', 'delivered'))
    or (v_current = 'handed_to_nonprofit' and p_status = 'delivered')
  ) then
    -- %-placeholders get filled with the values after the message.
    raise exception 'Cannot move a % match to %.', v_current, p_status;
  end if;

  update public.matches set status = p_status where id = p_match_id;

  if p_status = 'delivered' then
    update public.donations set status = 'delivered' where id = v_donation_id;
    update public.requests  set status = 'fulfilled' where id = v_request_id;
  end if;
end;
$$;
