// lib/orgs.js — data functions for organization verification.
//
// Written by Claude (schedule compression, Week A) — Caleb, read it: every
// pattern here is one you've used, plus one new one: uploading a file to
// Supabase Storage, then recording where it landed in a table row.
//
// Contract:
//   getMyOrganization()                            -> { organization | null }
//   submitVerification({ orgName, orgType, website, file }) -> { organization }
//   getPendingOrgs()                               -> { organizations } (admin)
//   getDocumentUrl(path)                           -> temporary URL string (admin/owner)
//   reviewOrg({ orgId, decision, note })           -> nothing (admin; decision: 'verified' | 'rejected')

import { supabase } from "@/lib/supabase";

const BUCKET = "verification-docs";

export async function getMyOrganization() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle(); // like .single() but returns null instead of erroring when there's no row

  if (error) throw new Error(error.message);
  return { organization: data };
}

export async function submitVerification({ orgName, orgType, website, file }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");
  if (!orgName || !orgType) throw new Error("Please fill in your organization's name and type.");
  if (!file) throw new Error("Please attach a supporting document.");

  // 1) Upload the file. Path = "<my user id>/<timestamp>-<original name>",
  //    which is exactly the shape the storage policies check.
  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // 2) Create or update my organization row. "upsert" = insert, or update
  //    if a row with this owner_id already exists (resubmission).
  const { data, error } = await supabase
    .from("organizations")
    .upsert(
      {
        owner_id: user.id,
        org_name: orgName,
        org_type: orgType,
        website: website || null,
        document_path: path,
        verification_status: "pending",
        submitted_at: new Date().toISOString(),
        review_note: null,
      },
      { onConflict: "owner_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { organization: data };
}

export async function getPendingOrgs() {
  const { data, error } = await supabase
    .from("organizations")
    .select("*, owner:profiles(name)")
    .eq("verification_status", "pending")
    .order("submitted_at", { ascending: true }); // oldest first — fair queue

  if (error) throw new Error(error.message);
  return { organizations: data };
}

export async function getDocumentUrl(path) {
  // Private bucket: files aren't reachable by URL. A "signed URL" is a
  // temporary link (here: 10 minutes) that storage policies still guard.
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function reviewOrg({ orgId, decision, note }) {
  if (!["verified", "rejected"].includes(decision)) {
    throw new Error("Decision must be 'verified' or 'rejected'.");
  }
  const { error } = await supabase
    .from("organizations")
    .update({ verification_status: decision, review_note: note || null })
    .eq("id", orgId);
  if (error) throw new Error(error.message);
}
