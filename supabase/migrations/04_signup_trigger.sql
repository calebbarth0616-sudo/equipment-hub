-- Auto-create a profiles row whenever a new user signs up.
-- Needed because signups aren't logged in yet (email confirmation pending),
-- so they couldn't insert their own profile under RLS. "security definer"
-- runs the function with the database owner's authority instead.
-- (Run in the Supabase SQL Editor, Week 1.)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'donor'),
    coalesce(new.raw_user_meta_data ->> 'name', 'New user')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
