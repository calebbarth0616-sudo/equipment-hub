// app/browse/page.js — the public Browse page ("/browse").
//
// The app's storefront: anyone (logged in or not) can see open requests and
// available donations — that's what the "using (true)" RLS policies allow.
// Two tabs + a sport filter. The "Offer a donation" matching flow plugs in
// here in Week 3.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, getMyProfile } from "@/lib/auth";
import { getAvailableDonations, getMyDonations, getNearbyAvailableDonations } from "@/lib/donations";
import { getOpenRequests, getNearbyOpenRequests } from "@/lib/requests";
import { proposeMatch } from "@/lib/matches";
import { SPORTS, CONDITION_LABELS } from "@/lib/constants";

const MILE_OPTIONS = [10, 25, 50, 100];

// The org's verification status arrives nested two levels deep
// (request.org.organizations). Supabase may hand back the organizations
// part as an object or a one-item array depending on version — handle both.
function isVerified(request) {
  const org = request.org?.organizations;
  const record = Array.isArray(org) ? org[0] : org;
  return record?.verification_status === "verified";
}

export default function BrowsePage() {
  const [tab, setTab] = useState("requests"); // "requests" | "donations"
  const [sportFilter, setSportFilter] = useState("all");
  const [requests, setRequests] = useState(null);
  const [donations, setDonations] = useState(null);
  const [error, setError] = useState("");

  // Matching flow state (donors only):
  const [user, setUser] = useState(null);
  const [myAvailable, setMyAvailable] = useState([]); // my donations still available
  const [offeringFor, setOfferingFor] = useState(null); // request id with the offer panel open
  const [selectedDonationId, setSelectedDonationId] = useState("");
  const [notice, setNotice] = useState(""); // green success banner

  // Distance filter state. hasLocation is null while we don't yet know —
  // avoids flashing "set your location" before the profile check finishes.
  const [hasLocation, setHasLocation] = useState(null);
  const [nearMe, setNearMe] = useState(false);
  const [maxMiles, setMaxMiles] = useState(25);

  // Fetches whichever pair of lists the current filter state calls for —
  // shared by the initial load and by toggling "Near me".
  async function fetchLists(useDistance) {
    const [requestsResult, donationsResult] = await Promise.all([
      useDistance ? getNearbyOpenRequests(maxMiles) : getOpenRequests(),
      useDistance ? getNearbyAvailableDonations(maxMiles) : getAvailableDonations(),
    ]);
    setRequests(requestsResult.requests);
    setDonations(donationsResult.donations);
  }

  // Load both lists up front; switching tabs is then instant.
  useEffect(() => {
    async function load() {
      try {
        await fetchLists(false);

        // If someone's logged in, check whether they've set a location
        // (unlocks the "Near me" filter) and, for donors, fetch THEIR
        // donations so the "Offer" panel has something to offer.
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const profile = await getMyProfile();
          setHasLocation(Boolean(profile?.lat && profile?.lng));
          if (currentUser.role === "donor") {
            const mine = await getMyDonations();
            setMyAvailable(mine.donations.filter((d) => d.status === "available"));
          }
        } else {
          setHasLocation(false);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function handleToggleNearMe(enabled) {
    setNearMe(enabled);
    setError("");
    try {
      await fetchLists(enabled);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMilesChange(miles) {
    setMaxMiles(miles);
    if (!nearMe) return; // no need to refetch until "Near me" is actually on
    try {
      const [requestsResult, donationsResult] = await Promise.all([
        getNearbyOpenRequests(miles),
        getNearbyAvailableDonations(miles),
      ]);
      setRequests(requestsResult.requests);
      setDonations(donationsResult.donations);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleOffer(requestId) {
    if (!selectedDonationId) return;
    setError("");
    try {
      await proposeMatch({ donationId: selectedDonationId, requestId });
      // Refresh everything: the request leaves the open pool, the donation
      // leaves my available list — the page should reflect that instantly.
      // Respect whichever filter (all vs. near me) is currently active.
      const [, mine] = await Promise.all([fetchLists(nearMe), getMyDonations()]);
      setMyAvailable(mine.donations.filter((d) => d.status === "available"));
      setOfferingFor(null);
      setSelectedDonationId("");
      setNotice("Offer sent! You can track it on your Matches page.");
    } catch (err) {
      setError(err.message);
    }
  }

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Distance filter: only usable once the viewer has set a
              location on their profile — otherwise point them there. */}
          {hasLocation === false && (
            <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Set your location to filter by distance
            </Link>
          )}
          {hasLocation && (
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={nearMe}
                onChange={(e) => handleToggleNearMe(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Near me
            </label>
          )}
          {hasLocation && nearMe && (
            <select
              value={maxMiles}
              onChange={(e) => handleMilesChange(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {MILE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  within {m} miles
                </option>
              ))}
            </select>
          )}

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
      </div>

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
                  {/* Only present when the "Near me" filter fetched this
                      row — the plain (non-distance) queries never set it. */}
                  {typeof entry.distance_miles === "number" &&
                    ` · ~${Math.round(entry.distance_miles)} mi away`}
                </span>
              </p>
              {/* Org name arrives embedded by getOpenRequests' nested select
                  — but only if the profiles visibility policy (Run 11)
                  allows it; entry.org is null otherwise, so render safely. */}
              {tab === "requests" && entry.org?.name && (
                <p className="mt-0.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Requested by {entry.org.name}{" "}
                  {isVerified(entry) ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      verified ✓
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                      pending verification
                    </span>
                  )}
                </p>
              )}
              {tab === "requests" && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {entry.need_statement}
                </p>
              )}

              {/* The matching flow: donors with available donations get an
                  Offer button on each request; clicking it opens a small
                  inline panel to pick which donation to offer. */}
              {/* Offers only go to VERIFIED teams — the propose_match
                  function enforces this too; hiding the button just avoids
                  a confusing error. */}
              {tab === "requests" && user?.role === "donor" && myAvailable.length > 0 && isVerified(entry) && (
                <div className="mt-3">
                  {offeringFor === entry.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedDonationId}
                        onChange={(e) => setSelectedDonationId(e.target.value)}
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <option value="" disabled>
                          Choose a donation to offer…
                        </option>
                        {myAvailable.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.item} (qty {d.quantity}, {CONDITION_LABELS[d.condition]})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleOffer(entry.id)}
                        disabled={!selectedDonationId}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Send offer
                      </button>
                      <button
                        onClick={() => {
                          setOfferingFor(null);
                          setSelectedDonationId("");
                        }}
                        className="text-sm text-zinc-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOfferingFor(entry.id)}
                      className="rounded-lg border border-emerald-600 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                    >
                      Offer one of my donations
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
