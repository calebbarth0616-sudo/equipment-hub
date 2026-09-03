-- Storage policies for the PRIVATE bucket "verification-docs".
-- PREREQUISITE: create the bucket first in the dashboard
-- (Storage -> New bucket -> name: verification-docs -> Public: OFF).
--
-- Files are stored at "<user id>/<filename>", so the first folder segment
-- is the owner — that's what these rules check. storage.objects is
-- Supabase's table of uploaded files; RLS on it works like any table.
-- (Run in the Supabase SQL Editor.)

create policy "Orgs can upload their own verification docs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Needed for re-uploads (upsert) when resubmitting after a rejection.
create policy "Orgs can replace their own verification docs"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Orgs can view their own verification docs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can view all verification docs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and public.is_admin()
  );
