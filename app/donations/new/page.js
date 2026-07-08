// app/donations/new/page.js — the "post a donation" form ("/donations/new").
//
// Same form pattern as signup (see app/signup/page.js for the full
// walkthrough): one state per field, submit handler calls a lib/ function,
// error + loading states. The data function it calls — createDonation —
// was written by Caleb in lib/donations.js.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { createDonation } from "@/lib/donations";
import { SPORTS, CONDITIONS } from "@/lib/constants";

export default function NewDonationPage() {
  const router = useRouter();

  const [sport, setSport] = useState("");
  const [item, setItem] = useState("");
  const [condition, setCondition] = useState("good");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // This page is for logged-in donors only — bounce visitors to /login.
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
      // Number(quantity): input fields hand us text ("3"), the database
      // expects a number (3).
      await createDonation({ sport, item, condition, quantity: Number(quantity) });
      router.push("/donations"); // success → my donations list
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Post a donation</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        List equipment you'd like to give to a school or league.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="sport" className="mb-1 block text-sm font-medium">
            Sport
          </label>
          {/* A <select> is a dropdown; the empty first option forces a
              deliberate choice instead of accidentally submitting Baseball. */}
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
            What are you donating?
          </label>
          <input
            id="item"
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="e.g. Youth batting helmets"
            required
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="condition" className="mb-1 block text-sm font-medium">
              Condition
            </label>
            <select
              id="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={inputClasses}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
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
          {submitting ? "Posting…" : "Post donation"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/donations" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Back to my donations
        </Link>
      </p>
    </main>
  );
}
