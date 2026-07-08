// app/donations/page.js — "My donations" ("/donations").
//
// First LIST page in the app: fetch rows with a lib/ function, show a
// loading state while waiting, an empty state if there's nothing, and a
// card per row. This exact pattern repeats for "My requests" and Browse.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getMyDonations, withdrawDonation } from "@/lib/donations";
import { CONDITION_LABELS } from "@/lib/constants";

// Colored label for each status. A tiny component private to this file —
// not everything needs its own file in components/.
function StatusBadge({ status }) {
  const styles = {
    available: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    matched: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    delivered: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    withdrawn: "bg-zinc-100 text-zinc-500 line-through dark:bg-zinc-900",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function MyDonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState(null); // null = still loading
  const [error, setError] = useState("");

  // Load the list once when the page appears.
  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const result = await getMyDonations();
        setDonations(result.donations);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [router]);

  async function handleWithdraw(id) {
    // confirm() = the browser's built-in "Are you sure?" popup. Basic but
    // effective; a nicer custom dialog is a polish-week candidate.
    if (!confirm("Withdraw this donation? It will no longer be visible to schools.")) return;
    try {
      await withdrawDonation(id);
      // Refresh the list so the change shows immediately.
      const result = await getMyDonations();
      setDonations(result.donations);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My donations</h1>
        <Link
          href="/donations/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          + Post a donation
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {/* LOADING STATE: donations is null until the fetch finishes. */}
      {donations === null && !error && (
        <p className="mt-10 text-center text-sm text-zinc-500">Loading your donations…</p>
      )}

      {/* EMPTY STATE: fetch finished but there's nothing to show. Always
          tell the user what to do next, never just show blank space. */}
      {donations !== null && donations.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No donations yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Post your first donation and a school or league can request it.
          </p>
        </div>
      )}

      {/* THE LIST: one card per donation. */}
      {donations !== null && donations.length > 0 && (
        <ul className="mt-6 space-y-3">
          {donations.map((donation) => (
            <li
              key={donation.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-semibold">
                  {donation.item}
                  <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                    · {donation.sport} · qty {donation.quantity} ·{" "}
                    {CONDITION_LABELS[donation.condition]}
                  </span>
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={donation.status} />
                </div>
              </div>

              {/* Withdraw only makes sense while it's still available. */}
              {donation.status === "available" && (
                <button
                  onClick={() => handleWithdraw(donation.id)}
                  className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Withdraw
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
