// components/Navbar.js — the navigation bar shown on every page.
//
// This lives in components/ (not app/) because it isn't a page — it's a
// reusable piece that layout.js places above every page.
//
// It has one job beyond links: reflect login state. Logged out -> show
// "Log in" and "Sign up". Logged in -> show the user's name/role and a
// "Log out" button.

// "use client" marks this as a CLIENT COMPONENT: its JavaScript runs in the
// visitor's browser. Required here because we use state, effects, and
// localStorage — things that only exist in a browser, not on the server.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, signOut } from "@/lib/auth";

export default function Navbar() {
  // useRouter lets us send the visitor to another page from code
  // (used after logging out).
  const router = useRouter();

  // STATE: data that React watches — when it changes (via setUser), React
  // automatically redraws this component. `user` is null when logged out.
  const [user, setUser] = useState(null);

  // EFFECT: code that runs after the component first appears on screen.
  // Here we (1) read the current login state, and (2) subscribe to the
  // "auth-changed" event that lib/auth.js fires on every login/logout, so
  // the navbar updates instantly without a page refresh.
  useEffect(() => {
    // getCurrentUser is async (it checks the real session), so we await it.
    const refresh = async () => setUser(await getCurrentUser());
    refresh();
    window.addEventListener("auth-changed", refresh);
    // The returned function is cleanup: React runs it if the navbar is ever
    // removed, so we don't leave a dead event listener behind.
    return () => window.removeEventListener("auth-changed", refresh);
  }, []); // [] = "run once when first shown", not on every redraw

  async function handleSignOut() {
    await signOut();
    router.push("/"); // back to the home page
  }

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          🏅 Equipment Hub
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          {/* Browse is the public storefront — visible to everyone. */}
          <Link href="/browse" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Browse
          </Link>
          {/* CONDITIONAL RENDERING: `condition ? A : B` shows A when the
              condition is true, otherwise B. Here: logged in vs logged out. */}
          {user ? (
            <>
              {/* Donors and orgs each get a link to their own list page. */}
              {user.role === "donor" && (
                <Link href="/donations" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                  My donations
                </Link>
              )}
              {user.role === "org" && (
                <Link href="/requests" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                  My requests
                </Link>
              )}
              {/* "hidden sm:inline" = hidden on phones, visible on wider
                  screens — the name is nice-to-have, not essential. */}
              <span className="hidden text-zinc-500 sm:inline dark:text-zinc-400">
                {user.name} · {user.role === "donor" ? "Donor" : "School / League"}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-white transition-colors hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
