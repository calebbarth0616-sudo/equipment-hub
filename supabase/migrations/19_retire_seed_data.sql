-- RUN THIS ONLY WHEN THE FIRST REAL ORG OR DONOR SIGNS UP.
--
-- The demo seed data (migration 13) made the site look alive for the
-- pitch, but once real people arrive, fake listings are harmful: a real
-- donor could offer real equipment to a request no team actually made.
--
-- This RETIRES rather than deletes (reversible — flip the status back to
-- undo). It matches on the exact seed items AND their shared insert
-- timestamp, so real listings with similar names are never touched.
-- (Run in the Supabase SQL Editor.)

update public.requests
set status = 'closed'
where status = 'open'
  and item in ('Cleats, youth sizes 3-6', 'Practice jerseys', 'Starting blocks',
               'Fielding gloves, left and right')
  and created_at = (select min(created_at) from public.requests
                    where item = 'Starting blocks');

update public.donations
set status = 'withdrawn'
where status = 'available'
  and item in ('Indoor basketballs, size 7', 'Training bibs, youth medium',
               'Batting helmets', 'Shoulder pads, assorted youth sizes',
               'Competition volleyballs')
  and created_at = (select min(created_at) from public.donations
                    where item = 'Competition volleyballs');
