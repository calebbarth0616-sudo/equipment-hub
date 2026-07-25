-- Names on cards, half one: school/league profiles become publicly readable
-- so Browse can say "Requested by Westside Middle School". Deliberate
-- asymmetry: DONOR profiles stay private (existing own-profile policy only);
-- donors are revealed only via get_match_contact after acceptance.
-- Note: this exposes the whole org profile row (name, city, state, zip) —
-- no emails live in profiles, and org city/state is fine to show.
-- (Run in the Supabase SQL Editor, Week 3.)
create policy "Org profiles are publicly viewable"
  on public.profiles for select
  using (role = 'org');
