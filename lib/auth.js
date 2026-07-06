// lib/auth.js — authentication data functions
//
// ⚠️ MOCK VERSION. This fakes a login system using the browser's localStorage
// so the pages can be built and tested before the real backend exists.
//
// TODO(Caleb) — Week 1 backend session:
//   Replace the INSIDES of these functions with real Supabase calls
//   (supabase.auth.signUp, signInWithPassword, signOut, getUser).
//   Keep the function names, parameters, and return shapes exactly the same —
//   that's the "contract" the frontend pages are built against.
//
// The contract:
//   signUp({ name, email, password, role }) -> { user }  (role: "donor" | "org")
//   signIn({ email, password })             -> { user }
//   signOut()                               -> nothing
//   getCurrentUser()                        -> user object or null
//   Every user object looks like: { id, name, email, role }

const STORAGE_KEY = "equipment-hub-mock-auth";

// Lets the navbar update immediately when someone logs in or out.
function announceAuthChange() {
  window.dispatchEvent(new Event("auth-changed"));
}

export async function signUp({ name, email, password, role }) {
  if (!name || !email || !password || !role) {
    throw new Error("Please fill out every field.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const user = { id: crypto.randomUUID(), name, email, role };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  announceAuthChange();
  return { user };
}

export async function signIn({ email, password }) {
  if (!email || !password) {
    throw new Error("Please enter your email and password.");
  }
  // Mock behavior: "logs in" as whoever last signed up on this browser.
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored || JSON.parse(stored).email !== email) {
    throw new Error("No account found with that email (mock mode: sign up first).");
  }
  announceAuthChange();
  return { user: JSON.parse(stored) };
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  announceAuthChange();
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null; // server-side render: no browser storage
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
