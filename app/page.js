// app/page.js — the HOME PAGE (the "/" route).
//
// This is the simplest kind of component in the app: it takes no input and
// has no state — it just returns JSX (the HTML-like syntax React uses)
// describing what to show. Because it needs no interactivity, there is no
// "use client" line at the top; Next.js renders it on the server, which is
// the default and the fastest option.
//
// NOTE: this is an interim version. The full landing page (mission section,
// "How it works" steps, real impact stats) is scheduled for Week 3 of the
// plan, right before the nonprofit demo.

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      {/* The long strings of class names are Tailwind CSS: each class is one
          small style rule, e.g. mt-4 = margin-top, text-lg = larger text.
          Styling lives right here in the markup instead of a separate file. */}
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Give game-day gear a second life.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Equipment Hub connects donors who have sports equipment to spare with
        underserved schools and community leagues that need it.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {/* <Link> is Next.js's version of an <a> tag — it switches pages
            instantly without a full browser reload. */}
        <Link
          href="/signup"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Donate equipment
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Request equipment for my team
        </Link>
      </div>
    </main>
  );
}
