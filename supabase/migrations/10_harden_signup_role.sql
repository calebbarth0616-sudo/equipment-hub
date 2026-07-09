-- Security fix from the Week 3 SQL review: the original trigger stored
-- whatever role arrived in signup metadata, letting anyone calling the
-- public signup API directly mint an 'admin' profile. Signups may only be
-- donor or org; admin accounts are promoted by hand in the dashboard.
-- (Run in the Supabase SQL Editor, Week 3.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_role text;
begin
  v_role := new.raw_user_meta_data ->> 'role';
  -- Never trust client-supplied data, even our own form's.
  if v_role is null or v_role not in ('donor', 'org') then
    v_role := 'donor';
  end if;

  insert into public.profiles (id, role, name)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data ->> 'name', 'New user')
  );
  return new;
end;
$$;
