-- Week B: geographic matching. Adds lat/lng to profiles and two functions
-- that return open requests / available donations sorted by distance from
-- the CALLER's own profile location — no external maps API needed at our
-- scale; this is the Haversine formula, which treats the Earth as a sphere
-- and turns two lat/lng pairs into a distance in miles.
-- (Run in the Supabase SQL Editor, Week B.)

alter table public.profiles
  add column lat double precision,
  add column lng double precision;

-- Requests near me (called by donors browsing what to offer).
-- "returns table" lets a function hand back a whole result set, like a
-- query. We wrap the distance math in a subquery ("sub") so the outer
-- query can filter and sort by the computed distance_miles column.
create function public.nearby_open_requests(p_max_miles double precision)
returns table (
  id uuid, org_id uuid, sport text, item text, quantity int,
  need_statement text, status text, created_at timestamptz,
  org_name text, verification_status text, distance_miles double precision
)
language sql
stable
security definer set search_path = ''
as $$
  select * from (
    select
      r.id, r.org_id, r.sport, r.item, r.quantity, r.need_statement,
      r.status, r.created_at,
      p.name as org_name,
      coalesce(o.verification_status, 'pending') as verification_status,
      -- Haversine distance in miles. greatest/least clamp the value fed to
      -- acos() to [-1, 1] — floating-point rounding can nudge it a hair
      -- outside that range for very close points, which would otherwise
      -- crash the function with a domain error.
      3959 * acos(greatest(-1, least(1,
        cos(radians(caller.lat)) * cos(radians(p.lat)) * cos(radians(p.lng - caller.lng))
        + sin(radians(caller.lat)) * sin(radians(p.lat))
      ))) as distance_miles
    from public.requests r
    join public.profiles p on p.id = r.org_id
    left join public.organizations o on o.owner_id = r.org_id
    cross join (select lat, lng from public.profiles where id = auth.uid()) as caller
    where r.status = 'open'
      and caller.lat is not null and caller.lng is not null
      and p.lat is not null and p.lng is not null
  ) sub
  where distance_miles <= p_max_miles
  order by distance_miles asc;
$$;

-- Donations near me (called by orgs browsing what's available).
create function public.nearby_available_donations(p_max_miles double precision)
returns table (
  id uuid, donor_id uuid, sport text, item text, condition text,
  quantity int, status text, created_at timestamptz,
  distance_miles double precision
)
language sql
stable
security definer set search_path = ''
as $$
  select * from (
    select
      d.id, d.donor_id, d.sport, d.item, d.condition, d.quantity,
      d.status, d.created_at,
      3959 * acos(greatest(-1, least(1,
        cos(radians(caller.lat)) * cos(radians(p.lat)) * cos(radians(p.lng - caller.lng))
        + sin(radians(caller.lat)) * sin(radians(p.lat))
      ))) as distance_miles
    from public.donations d
    join public.profiles p on p.id = d.donor_id
    cross join (select lat, lng from public.profiles where id = auth.uid()) as caller
    where d.status = 'available'
      and caller.lat is not null and caller.lng is not null
      and p.lat is not null and p.lng is not null
  ) sub
  where distance_miles <= p_max_miles
  order by distance_miles asc;
$$;
