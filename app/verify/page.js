// app/verify/page.js — organization verification ("/verify").
//
// School/league accounts prove they're real before they can receive
// donations. Shows the current status (none / pending / verified /
// rejected with the admin's note) and the submission form. The upload is
// the one new mechanic: a file input hands us a File object, which
// lib/orgs.js sends to Supabase Storage.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrganization, submitVerification } from "@/lib/orgs";

const ORG_TYPES = [
  { value: "school", label: "School" },
  { value: "community_league", label: "Community league" },
  { value: "other", label: "Other youth program" },
];

function StatusPanel({ organization }) {
  if (!organization) return null;
  const { verification_status: status, review_note } = organization;
  const styles = {
    pending: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
    verified: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    rejected: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  };
  const messages = {
    pending: "Submitted — an admin will review it soon. Donors can browse your requests but can't make offers until you're verified.",
    verified: "Verified ✓ — donors can now offer equipment to your requests.",
    rejected: "Not approved. You can fix the details below and resubmit.",
  };
  return (
    <div className={`mt-6 rounded-xl border p-4 text-sm ${styles[status]}`}>
      <p className="font-semibold">Status: {status}</p>
      <p className="mt-1">{messages[status]}</p>
      {review_note && <p className="mt-2 italic">Admin note: “{review_note}”</p>}
    </div>
  );
}

export default function VerifyPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("school");
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.role !== "org") {
        router.push("/");
        return;
      }
      try {
        const { organization: org } = await getMyOrganization();
        setOrganization(org);
        // Pre-fill from the existing submission, or from the account name.
        setOrgName(org?.org_name ?? user.name);
        setOrgType(org?.org_type ?? "school");
        setWebsite(org?.website ?? "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { organization: org } = await submitVerification({ orgName, orgType, website, file });
      setOrganization(org);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900";

  // Verified orgs don't need the form again.
  const showForm = loaded && organization?.verification_status !== "verified";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Verify your organization</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        A quick check that keeps donations going to real teams. Attach
        anything that shows your program exists — a letterhead document,
        a roster page, a league registration, or a photo of your team.
      </p>

      {!loaded && <p className="mt-10 text-center text-sm text-zinc-500">Loading…</p>}

      <StatusPanel organization={organization} />

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="orgName" className="mb-1 block text-sm font-medium">
              Organization name
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="orgType" className="mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              id="orgType"
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className={inputClasses}
            >
              {ORG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="website" className="mb-1 block text-sm font-medium">
              Website or social page <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="document" className="mb-1 block text-sm font-medium">
              Supporting document
            </label>
            {/* A file input gives us a FileList; we keep the first file. */}
            <input
              id="document"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-700 dark:text-zinc-400"
            />
            <p className="mt-1 text-xs text-zinc-500">PDF or image, up to a few MB.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting
              ? "Submitting…"
              : organization
                ? "Resubmit for review"
                : "Submit for verification"}
          </button>
        </form>
      )}
    </main>
  );
}
