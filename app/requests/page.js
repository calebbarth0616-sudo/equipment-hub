// app/requests/page.js — "My requests" ("/requests"), for school/league
// accounts. Mirror of app/donations/page.js — same list pattern.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getMyRequests, closeRequest } from "@/lib/requests";

function StatusBadge({ status }) {
  const styles = {
    open: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    matched: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    fulfilled: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    closed: "bg-zinc-100 text-zinc-500 line-through dark:bg-zinc-900",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState(null); // null = still loading
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const result = await getMyRequests();
        setRequests(result.requests);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, [router]);

  async function handleClose(id) {
    if (!confirm("Close this request? Donors will no longer see it.")) return;
    try {
      await closeRequest(id);
      const result = await getMyRequests();
      setRequests(result.requests);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My requests</h1>
        <Link
          href="/requests/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          + Request equipment
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {requests === null && !error && (
        <p className="mt-10 text-center text-sm text-zinc-500">Loading your requests…</p>
      )}

      {requests !== null && requests.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="font-medium">No requests yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tell donors what your team needs — requests with a clear story get
            matched fastest.
          </p>
        </div>
      )}

      {requests !== null && requests.length > 0 && (
        <ul className="mt-6 space-y-3">
          {requests.map((request) => (
            <li
              key={request.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-semibold">
                  {request.item}
                  <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                    · {request.sport} · qty {request.quantity}
                  </span>
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {request.need_statement}
                </p>
                <div className="mt-1.5">
                  <StatusBadge status={request.status} />
                </div>
              </div>

              {request.status === "open" && (
                <button
                  onClick={() => handleClose(request.id)}
                  className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
