// lib/requests.js — data functions for requests.

import { supabase } from "@/lib/supabase";

export async function createRequest({ sport, item, quantity, needStatement }) {
  // Ask Supabase who is logged in right now.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");

  const { data, error } = await supabase
    .from("requests")
    .insert({ org_id: user.id, sport, item, quantity, need_statement: needStatement })
    .select()                             // give me back the row you created...
    .single();
    
    if (error) throw new Error(error.message);
    return { request: data };
}

export async function getMyRequests() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please log in first.");

    const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("org_id", user.id)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { requests: data };
}

export async function closeRequest(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please log in first.");

    const { error } = await supabase
        .from("requests")
        .update({status: "closed"})
        .eq("id", id)
        .eq("org_id", user.id);

    if (error) throw new Error(error.message);
}

export async function getOpenRequests() {
    const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { requests: data };
}