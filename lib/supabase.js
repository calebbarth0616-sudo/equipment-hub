// lib/supabase.js — the single connection to our Supabase project.
//
// createClient reads the project URL and publishable key from .env.local
// (Next.js loads that file automatically) and returns a "client" object.
// Every data function in lib/ imports this one shared client — the app's
// single doorway to the database and login system.

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
