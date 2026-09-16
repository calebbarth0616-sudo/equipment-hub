// app/profile/page.js — set my location ("/profile").
//
// One field (ZIP) that unlocks distance-based matching on Browse. Both
// donors and orgs use this same page — donors need it to see how far
// requests are; orgs need it to see how far donations are.

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, getMyProfile } from "@/lib/auth";
import { updateMyLocation } from "@/lib/location";

export default function ProfilePage() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [current, setCurrent] = useState(null); // { city, state, zip } or null
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const profile = await getMyProfile();
        if (profile?.zip) {
          setCurrent({ city: profile.city, state: profile.state, zip: profile.zip });
          setZip(profile.zip);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const { city, state } = await updateMyLocation({ zip });
      setCurrent({ city, state, zip });
      setNotice("Location saved — Browse can now show you the nearest matches.");
      // Tell the rest of the app (e.g. Browse, if open) that something
      // changed, reusing the same event pattern as login/logout.
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">My location</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        We only use your ZIP code to show nearby matches — never a street
        address, and it's never shown to other users.
      </p>

      {!loaded && <p className="mt-10 text-center text-sm text-zinc-500">Loading…</p>}

      {loaded && current && (
        <p className="mt-6 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-900">
          Currently set to <span className="font-medium">{current.city}, {current.state}</span> ({current.zip}).
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {loaded && (
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            placeholder="90210"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : current ? "Update" : "Save"}
          </button>
        </form>
      )}
    </main>
  );
}
