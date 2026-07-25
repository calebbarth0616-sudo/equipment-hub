// app/page.js — the LANDING PAGE (the "/" route).
//
// The storefront window: mission, how it works, and two ways in. This is
// the first thing the nonprofit partner (and every donor a school forwards
// the link to) will see — clarity beats cleverness here.

import Link from "next/link";

const STEPS = [
  {
    title: "Donors list equipment",
    detail:
      "Schools and individuals post gear their teams have outgrown — helmets, cleats, balls, pads — with condition and quantity.",
  },
  {
    title: "Teams tell their story",
    detail:
      "Underserved schools and community leagues post what they need and why. Donors browse requests and offer their equipment directly.",
  },
  {
    title: "Matches get delivered",
    detail:
      "When a team accepts an offer, our nonprofit logistics partner handles the handoff — donors don't ship, teams don't chase.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-4 py-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Give game-day gear a second life.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Equipment Hub connects donors who have sports equipment to spare with
          underserved schools and community leagues that need it — and gets it
          delivered.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
        <Link
          href="/browse"
          className="mt-6 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Or just browse what teams need right now →
        </Link>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="text-center sm:text-left">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white sm:mx-0">
                  {index + 1}
                </div>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust note */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-xl font-bold">Built on trust</h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Every school and league is verified before receiving donations, and
            equipment moves through a dedicated nonprofit partner — so donors
            know their gear lands where it's needed, and teams know offers are
            real.
          </p>
        </div>
      </section>
    </div>
  );
}
