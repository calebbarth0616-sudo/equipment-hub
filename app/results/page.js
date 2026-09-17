// app/results/page.js — public impact page ("/results").
//
// The proof-of-results page for the pilot: three aggregate numbers from
// the get_public_results() database function (aggregates only — individual
// matches stay private to their participants). This page is the artifact
// the whole October deadline points at: real delivered matches, in public.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResultsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: rpcError } = await supabase.rpc("get_public_results");
      if (rpcError) setError(rpcError.message);
      else setStats(data?.[0] ?? null);
    }
    load();
  }, []);

  const tiles = stats
    ? [
        { value: stats.items_delivered, label: "pieces of equipment delivered" },
        { value: stats.delivered_matches, label: "completed donations" },
        { value: stats.teams_helped, label: "teams helped" },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Our impact so far</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
        Every number below is a real, completed donation: equipment that left
        someone's storage closet and reached a verified team that needed it.
      </p>

      {error && (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!stats && !error && <p className="mt-10 text-sm text-zinc-500">Loading…</p>}

      {stats && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
              <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">
                {tile.value}
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tile.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* An honest zero is better than a fake number — frame it as a start. */}
      {stats && Number(stats.delivered_matches) === 0 && (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          The first deliveries are in progress — check back soon.
        </p>
      )}

      <div className="mt-12 flex justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Add to these numbers
        </Link>
        <Link
          href="/browse"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          See what teams need
        </Link>
      </div>
    </main>
  );
}
