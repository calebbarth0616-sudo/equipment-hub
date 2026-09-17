// components/Footer.js — site footer, placed below every page by layout.js.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-zinc-500 dark:text-zinc-400">
        <p>Equipment Hub — giving game-day gear a second life.</p>
        <div className="flex gap-4">
          <Link href="/results" className="hover:underline">Our impact</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
