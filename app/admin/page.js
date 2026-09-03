// app/admin/page.js — admin area ("/admin").
//
// REAL ADMIN GATE (Week A): the role is read from the profiles table via
// getMyProfile() — not from signup metadata — and non-admins are sent
// home. The database enforces the same rule independently through the
// is_admin() policies, so even a tampered browser gets empty data.
//
// Sections: verification queue (the important one), stats, listings.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile } from "@/lib/auth";
import { getPendingOrgs, getDocumentUrl, reviewOrg } from "@/lib/orgs";
import { supabase } from "@/lib/supabase";

const ORG_TYPE_LABELS = {
  school: "School",
  community_league: "Community league",
  other: "Other youth program",
};

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
      <p className="text-2xl font-bold">{value ?? "—"}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function ListingTable({ rows }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs text-zinc-500 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Sport</th>
            <th className="px-4 py-2">Qty</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
              <td className="px-4 py-2">{r.item}</td>
              <td className="px-4 py-2">{r.sport}</td>
              <td className="px-4 py-2">{r.quantity}</td>
              <td className="px-4 py-2">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [pending, setPending] = useState(null);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadQueue() {
    const { organizations } = await getPendingOrgs();
    setPending(organizations);
  }

  useEffect(() => {
    async function load() {
      try {
        const profile = await getMyProfile();
        if (!profile) {
          router.push("/login");
          return;
        }
        if (profile.role !== "admin") {
          router.push("/");
          return;
        }
        await loadQueue();
        const [donationCount, requestCount, matchCount, deliveredCount, donationRows, requestRows] =
          await Promise.all([
            supabase.from("donations").select("*", { count: "exact", head: true }),
            supabase.from("requests").select("*", { count: "exact", head: true }),
            supabase.from("matches").select("*", { count: "exact", head: true }),
            supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "delivered"),
            supabase.from("donations").select("*").order("created_at", { ascending: false }),
            supabase.from("requests").select("*").order("created_at", { ascending: false }),
          ]);
        setStats({
          donations: donationCount.count,
          requests: requestCount.count,
          matches: matchCount.count,
          delivered: deliveredCount.count,
        });
        setDonations(donationRows.data ?? []);
        setRequests(requestRows.data ?? []);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [router]);

  async function handleViewDocument(path) {
    try {
      const url = await getDocumentUrl(path);
      window.open(url, "_blank"); // temporary signed link, opens in a new tab
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReview(org, decision) {
    // prompt() = built-in text popup; a note is required for rejections so
    // the org knows what to fix.
    let note = "";
    if (decision === "rejected") {
      note = prompt("Reason for rejection (the organization will see this):");
      if (note === null) return; // cancelled
      if (!note.trim()) return setError("A rejection needs a reason.");
    }
    try {
      await reviewOrg({ orgId: org.id, decision, note });
      setNotice(`${org.org_name} marked ${decision}.`);
      await loadQueue();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Admin</h1>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {/* Verification queue */}
      <h2 className="mt-8 text-lg font-semibold">
        Verification queue
        {pending && pending.length > 0 && (
          <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
            {pending.length}
          </span>
        )}
      </h2>
      {pending === null && !error && <p className="mt-3 text-sm text-zinc-500">Loading…</p>}
      {pending !== null && pending.length === 0 && (
        <p className="mt-3 text-sm text-zinc-500">No organizations waiting for review.</p>
      )}
      {pending !== null && pending.length > 0 && (
        <ul className="mt-3 space-y-3">
          {pending.map((org) => (
            <li key={org.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{org.org_name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {ORG_TYPE_LABELS[org.org_type]} · account: {org.owner?.name ?? "—"}
                    {org.website && (
                      <>
                        {" · "}
                        <a href={org.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline dark:text-emerald-400">
                          website
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Submitted {new Date(org.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {org.document_path && (
                    <button
                      onClick={() => handleViewDocument(org.document_path)}
                      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      View document
                    </button>
                  )}
                  <button
                    onClick={() => handleReview(org, "verified")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReview(org, "rejected")}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox label="Donations" value={stats?.donations} />
        <StatBox label="Requests" value={stats?.requests} />
        <StatBox label="Matches" value={stats?.matches} />
        <StatBox label="Delivered" value={stats?.delivered} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">All donations</h2>
      <ListingTable rows={donations} />

      <h2 className="mt-10 text-lg font-semibold">All requests</h2>
      <ListingTable rows={requests} />
    </main>
  );
}
