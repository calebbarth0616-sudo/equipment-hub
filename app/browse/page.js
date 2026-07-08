// app/browse/page.js — the public Browse page ("/browse").
//
// The app's storefront: anyone (logged in or not) can see open requests and
// available donations — that's what the "using (true)" RLS policies allow.
// Two tabs + a sport filter. The "Offer a donation" matching flow plugs in
// here in Week 3.

"use client";

import { useEffect, useState } from "react";
import { getAvailableDonations } from "@/lib/donations";
import { getOpenRequests } from "@/lib/requests";
import { SPORTS, CONDITION_LABELS } from "@/lib/constants";

export default function BrowsePage() {
  const [tab, setTab] = useState("requests"); // "requests" | "donations"
  const [sportFilter, setSportFilter] = useState("all");
  const [requests, setRequests] = useState(null);
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState("");

  // Load both lists up front; switching tabs is then instant.
  useEffect(() => {
    async function load() {
      try {
        const [requestsResult, donationsResult] = await Promise.all([
          getOpenRequests(),
          getAvailableDonations(),
        ]);
        setRequests(requestsResult.requests);
        setDonations(donationsResult.donations);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  // Apply the sport filter to whichever list the active tab shows.
  // .filter() = keep only the items the test returns true for.
  const activeList = tab === "requests" ? requests : donations;
  const filtered =
    activeList === null
      ? null
      : sportFilter === "all"
        ? activeList
        : activeList.filter((entry) => entry.sport === sportFilter);

  const tabClasses = (active) =>
    `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
      active
        ? "bg-emerald-600 text-white"
        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
    }`;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Browse</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        See what teams need and what donors are offering.
      </p>

      {/* Tabs + filter bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
          <button onClick={() => setTab("requests")} className={tabClasses(tab === "requests")}>
            Open requests
          </button>
          <button onClick={() => setTab("donations")} className={tabClasses(tab === "donations")}>
            Available donations
          </button>
        </div>

        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="all">All sports</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {filtered === null && !error && (
        <p className="mt-10 text-center text-sm text-zinc-500">Loading…</p>
      )}

      {filtered !== null && filtered.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">
            {tab === "requests" ? "No open requests" : "No available donations"}
            {sportFilter !== "all" && ` for ${sportFilter}`}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {sportFilter !== "all"
              ? "Try a different sport, or check back soon."
              : "Check back soon — new listings appear here."}
          </p>
        </div>
      )}

      {filtered !== null && filtered.length > 0 && (
        <ul className="mt-6 space-y-3">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="font-semibold">
                {entry.item}
                <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                  · {entry.sport} · qty {entry.quantity}
                  {tab === "donations" && ` · ${CONDITION_LABELS[entry.condition]}`}
                </span>
              </p>
              {tab === "requests" && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {entry.need_statement}
                </p>
              )}
              {/* Week 3: donors get an "Offer one of my donations" button here. */}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
