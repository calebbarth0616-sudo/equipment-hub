// lib/auth.js — authentication data functions (REAL version).
//
// This replaced the localStorage mock on integration day, Week 1. The
// contract the pages rely on is unchanged except where reality demanded it:
//
//   signUp({ name, email, password, role }) -> { user, needsEmailConfirmation }
//   signIn({ email, password })             -> { user }
//   signOut()                               -> nothing
//   getCurrentUser()                        -> user object or null  (now async!)
//   Every user object looks like: { id, name, email, role }
//
// Two differences from the mock, both because email confirmation exists:
//   1. signUp does NOT log you in — Supabase emails a confirmation link,
//      so it returns needsEmailConfirmation and the page shows "check email".
//   2. getCurrentUser is async (checking a real session takes a moment),
//      so callers must `await` it.

import { supabase } from "@/lib/supabase";

// Lets the navbar update immediately when someone logs in or out.
function announceAuthChange() {
  window.dispatchEvent(new Event("auth-changed"));
}

// Supabase gives us a raw account object; this reshapes it into the small
// { id, name, email, role } object the rest of the app expects, so pages
// never need to know what Supabase's internals look like.
function toAppUser(supabaseUser) {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    // user_metadata is the extra info we attach at signup (see below).
    // The database trigger reads these same values to build the profiles row.
    name: supabaseUser.user_metadata?.name ?? "New user",
    role: supabaseUser.user_metadata?.role ?? "donor",
  };
}

export async function signUp({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    throw new Error("Please fill out every field.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // "options.data" rides along with the signup and is stored as
    // user_metadata — our on_auth_user_created trigger (snippet 04) uses it
    // to fill in the profiles row's name and role.
    options: { data: { name, role } },
  });
  // Supabase returns errors as values instead of throwing; we convert them
  // to throws so every page can use one consistent try/catch pattern.
  if (error) throw new Error(error.message);

  announceAuthChange();
  return {
    user: toAppUser(data.user),
    // No session yet = Supabase sent a confirmation email and is waiting.
    needsEmailConfirmation: data.session === null,
  };
}

export async function signIn({ email, password }) {
  if (!email || !password) {
    throw new Error("Please enter your email and password.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    // Supabase's raw message for unconfirmed emails is confusing;
    // translate the common cases into friendlier language.
    if (error.message.toLowerCase().includes("email not confirmed")) {
      throw new Error("Please confirm your email first — check your inbox for our link.");
    }
    throw new Error("Incorrect email or password.");
  }

  announceAuthChange();
  return { user: toAppUser(data.user) };
}

export async function signOut() {
  await supabase.auth.signOut();
  announceAuthChange();
}

export async function getCurrentUser() {
  // The session (proof of being logged in) is stored in the browser and
  // survives page refreshes; this reads it back.
  const { data } = await supabase.auth.getSession();
  return toAppUser(data.session?.user ?? null);
}
