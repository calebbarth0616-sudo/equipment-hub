// app/admin/page.js — basic admin overview ("/admin").
//
// TEMPORARY OPENNESS, KNOWN LIMITS: there is no admin role enforcement yet
// (that's Week 7). Any logged-in user can open this page, but RLS still
// governs what it can see — public listings show fully; profiles and
// matches show only what the viewer is allowed. Week 7 adds the real admin
// role with policies that open these up properly.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
      <p className="text-2xl font-bold">{value ?? "—"}</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        // head:true + count:"exact" = "just count the rows, don't send them"
        const [donationCount, requestCount, matchCount, donationRows, requestRows] =
          await Promise.all([
            supabase.from("donations").select("*", { count: "exact", head: true }),
            supabase.from("requests").select("*", { count: "exact", head: true }),
            supabase.from("matches").select("*", { count: "exact", head: true }),
            supabase.from("donations").select("*").order("created_at", { ascending: false }),
            supabase.from("requests").select("*").order("created_at", { ascending: false }),
          ]);
        setStats({
          donations: donationCount.count,
          requests: requestCount.count,
          // Matches are RLS-limited to the viewer's own until Week 7 —
          // labeled accordingly below.
          matches: matchCount.count,
        });
        setDonations(donationRows.data ?? []);
        setRequests(requestRows.data ?? []);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [router]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Admin overview</h1>
      <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
        Temporary: open to all logged-in users until the admin role lands in
        Week 7. Data is still limited by row-level security.
      </p>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatBox label="Total donations" value={stats?.donations} />
        <StatBox label="Total requests" value={stats?.requests} />
        <StatBox label="Matches (yours until Week 7)" value={stats?.matches} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">All donations</h2>
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
            {donations.map((d) => (
              <tr key={d.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-4 py-2">{d.item}</td>
                <td className="px-4 py-2">{d.sport}</td>
                <td className="px-4 py-2">{d.quantity}</td>
                <td className="px-4 py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold">All requests</h2>
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
            {requests.map((r) => (
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
    </main>
  );
}
