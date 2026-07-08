// app/requests/new/page.js — the "post an equipment request" form
// ("/requests/new"), for school/league accounts.
//
// Same form pattern as always (fully documented in app/signup/page.js).
// Calls createRequest from Caleb's lib/requests.js.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createRequest } from "@/lib/requests";
import { SPORTS } from "@/lib/constants";

export default function NewRequestPage() {
  const router = useRouter();

  const [sport, setSport] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [needStatement, setNeedStatement] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (!user) router.push("/login");
    });
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createRequest({ sport, item, quantity: Number(quantity), needStatement });
      router.push("/requests");
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Request equipment</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Tell donors what your team needs and why.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="sport" className="mb-1 block text-sm font-medium">
            Sport
          </label>
          <select
            id="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            required
            className={inputClasses}
          >
            <option value="" disabled>
              Choose a sport…
            </option>
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="item" className="mb-1 block text-sm font-medium">
            What do you need?
          </label>
          <input
            id="item"
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g. Soccer cleats, youth sizes 3–6"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="needStatement" className="mb-1 block text-sm font-medium">
            Why does your team need this?
          </label>
          {/* textarea = multi-line input. This is the story donors read —
              the most persuasive field on the whole form. */}
          <textarea
            id="needStatement"
            value={needStatement}
            onChange={(e) => setNeedStatement(e.target.value)}
            rows={4}
            placeholder="e.g. Our middle school program doubled in size this year and half our players are sharing cleats between games."
            required
            className={inputClasses}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post request"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/requests" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to my requests
        </Link>
      </p>
    </main>
  );
}
