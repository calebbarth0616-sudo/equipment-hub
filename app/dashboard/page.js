// app/dashboard/page.js — "My matches" dashboard ("/dashboard").
//
// One page, two audiences (the role-based UI pattern from the plan):
//   - orgs see incoming proposed matches with Accept / Decline buttons
//   - donors see their outgoing offers and where each stands
// Both see the full history. Data comes from Caleb's getMyMatches(), which
// arrives with each match's donation and request rows embedded — and is
// already filtered to "matches involving me" by the RLS policy itself.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getMyMatches, acceptMatch, declineMatch } from "@/lib/matches";

const STATUS_STYLES = {
  proposed: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  accepted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  handed_to_nonprofit: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-500 line-through dark:bg-zinc-900",
};

const STATUS_LABELS = {
  proposed: "proposed",
  accepted: "accepted",
  handed_to_nonprofit: "with nonprofit",
  delivered: "delivered ✓",
  cancelled: "declined",
};

function MatchCard({ match, isOrg, onAnswer }) {
  return (
    <li className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* The two halves of the match, embedded by the nested select. */}
          <p className="font-semibold">
            {match.donation.item}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              {" "}(qty {match.donation.quantity}, {match.donation.sport})
            </span>
          </p>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            offered for: <span className="font-medium">{match.request.item}</span>
            {" "}— “{match.request.need_statement}”
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[match.status]}`}
          >
            {STATUS_LABELS[match.status]}
          </span>
        </div>

        {/* Only the org answers, and only while it's still proposed. */}
        {isOrg && match.status === "proposed" && (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => onAnswer(match.id, "accept")}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Accept
            </button>
            <button
              onClick={() => onAnswer(match.id, "decline")}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState(null); // null = loading
  const [error, setError] = useState("");

  async function loadMatches() {
    const result = await getMyMatches();
    setMatches(result.matches);
  }

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);
      try {
        await loadMatches();
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [router]);

  async function handleAnswer(matchId, action) {
    if (action === "decline" && !confirm("Decline this offer? The donation returns to the public pool.")) {
      return;
    }
    try {
      if (action === "accept") await acceptMatch(matchId);
      else await declineMatch(matchId);
      await loadMatches(); // refresh so the card updates immediately
    } catch (err) {
      setError(err.message);
    }
  }

  const isOrg = user?.role === "org";
  // Split proposed matches out so orgs see "needs my answer" on top.
  const proposed = matches?.filter((m) => m.status === "proposed") ?? [];
  const rest = matches?.filter((m) => m.status !== "proposed") ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">
        {isOrg ? "Incoming offers" : "My matches"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {isOrg
          ? "Donors have offered these donations to your requests."
          : "Offers you've made and where each one stands."}
      </p>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {matches === null && !error && (
        <p className="mt-10 text-center text-sm text-zinc-500">Loading matches…</p>
      )}

      {matches !== null && matches.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No matches yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isOrg
              ? "When a donor offers equipment for one of your requests, it appears here."
              : "Browse open requests and offer one of your donations to get started."}
          </p>
          <Link
            href="/browse"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Browse
          </Link>
        </div>
      )}

      {proposed.length > 0 && (
        <ul className="mt-6 space-y-3">
          {proposed.map((match) => (
            <MatchCard key={match.id} match={match} isOrg={isOrg} onAnswer={handleAnswer} />
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <>
          {proposed.length > 0 && (
            <h2 className="mt-8 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Earlier
            </h2>
          )}
          <ul className="mt-3 space-y-3">
            {rest.map((match) => (
              <MatchCard key={match.id} match={match} isOrg={isOrg} onAnswer={handleAnswer} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
