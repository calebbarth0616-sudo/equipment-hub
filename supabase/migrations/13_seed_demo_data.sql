-- Demo seed data so the pitch never shows an empty page. Rows are owned by
-- the existing test accounts (found by role via subselect), so no fake auth
-- users are needed. Safe to re-run only if you want duplicates — it's a
-- plain insert, run it once.
-- (Run in the Supabase SQL Editor, Week 3.)
insert into public.donations (donor_id, sport, item, condition, quantity)
values
  ((select id from public.profiles where role = 'donor' limit 1), 'Basketball', 'Indoor basketballs, size 7', 'good', 8),
  ((select id from public.profiles where role = 'donor' limit 1), 'Soccer', 'Training bibs, youth medium', 'like_new', 15),
  ((select id from public.profiles where role = 'donor' limit 1), 'Baseball', 'Batting helmets', 'good', 6),
  ((select id from public.profiles where role = 'donor' limit 1), 'Football', 'Shoulder pads, assorted youth sizes', 'fair', 10),
  ((select id from public.profiles where role = 'donor' limit 1), 'Volleyball', 'Competition volleyballs', 'new', 4);

insert into public.requests (org_id, sport, item, quantity, need_statement)
values
  ((select id from public.profiles where role = 'org' limit 1), 'Soccer', 'Cleats, youth sizes 3-6', 20,
   'Our rec league doubled to 90 kids this spring and half are playing in sneakers.'),
  ((select id from public.profiles where role = 'org' limit 1), 'Basketball', 'Practice jerseys', 12,
   'JV program restarted after five years — we have players but no gear budget until next fall.'),
  ((select id from public.profiles where role = 'org' limit 1), 'Track & Field', 'Starting blocks', 4,
   'Our sprinters train on a borrowed track and have never practiced real starts.'),
  ((select id from public.profiles where role = 'org' limit 1), 'Softball', 'Fielding gloves, left and right', 10,
   'Half our middle school team shares gloves between innings.');
