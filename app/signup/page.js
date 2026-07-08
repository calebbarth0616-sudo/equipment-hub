// app/signup/page.js — the SIGN-UP page (the "/signup" route).
//
// The most complete example of a FORM in the app. The pattern used here —
// one piece of state per field, a submit handler that calls a lib/ data
// function, error + loading states — is the same pattern every other form
// (new donation, new request, org verification) will follow. Understand this
// file and you understand most of the app's interactive code.

"use client"; // runs in the browser: this page uses state and form events

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  // One piece of state per form field. The inputs below are "controlled":
  // what they display IS this state, and typing updates it via onChange.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor"); // "donor" | "org" — matches the profiles table
  const [error, setError] = useState(""); // message shown in the red box, "" = no error
  const [submitting, setSubmitting] = useState(false); // true while waiting on the backend
  const [confirmationSent, setConfirmationSent] = useState(false); // signed up, awaiting email click

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page reload
    setError("");
    setSubmitting(true);
    try {
      // The page doesn't know or care HOW signUp works — it only relies on
      // the contract documented in lib/auth.js.
      const { needsEmailConfirmation } = await signUp({ name, email, password, role });
      if (needsEmailConfirmation) {
        setConfirmationSent(true); // swap the form for the "check email" screen
      } else {
        router.push("/"); // already logged in → go home
      }
    } catch (err) {
      // Failure: show the human-readable message and re-enable the button.
      setError(err.message);
      setSubmitting(false);
    }
  }

  // After a successful signup, show this instead of the form.
  if (confirmationSent) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Check your email 📬</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          We sent a confirmation link to <span className="font-semibold">{email}</span>.
          Click it to activate your account, then come back and{" "}
          <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            log in
          </Link>
          .
        </p>
      </main>
    );
  }

  // Shared styling for all text inputs, kept in one variable so the inputs
  // stay identical and a style tweak happens in exactly one place.
  const inputClasses =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-900";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Donate equipment, or request it for your school or league.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Role choice — two radio buttons styled as selectable cards.
            The real <input type="radio"> is visually hidden (sr-only) but
            still there, so keyboards and screen readers work normally. */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            {/* .map() turns each option object into a card — the standard
                React way to render a list without repeating markup. */}
            {[
              { value: "donor", title: "Donor", detail: "I have equipment to give" },
              { value: "org", title: "School / League", detail: "My team needs equipment" },
            ].map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${
                  role === option.value
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950" // selected
                    : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700" // not selected
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={(e) => setRole(e.target.value)}
                  className="sr-only"
                />
                <span className="block font-semibold">{option.title}</span>
                <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                  {option.detail}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          {/* label's htmlFor + input's id link them: clicking the label
              focuses the input, and screen readers announce it. */}
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            {role === "org" ? "Organization name" : "Full name"}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === "org" ? "Westside Youth Soccer League" : "Jordan Smith"}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClasses}
          />
        </div>

        {/* Error box — only rendered when there IS an error ("&&" pattern:
            left side false → render nothing). */}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {/* Disabled while submitting so a slow network can't cause
            double-signups from double-clicks. */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Log in
        </Link>
      </p>
    </main>
  );
}
