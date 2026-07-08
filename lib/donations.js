// lib/donations.js — data functions for donations.

import { supabase } from "@/lib/supabase";

export async function createDonation({ sport, item, condition, quantity }) {
  // Ask Supabase who is logged in right now.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");

  const { data, error } = await supabase
    .from("donations")                    // which table
    .insert({ donor_id: user.id, sport, item, condition, quantity })
    .select()                             // give me back the row you created...
    .single();                            // ...as one object, not a list

  if (error) throw new Error(error.message);
  return { donation: data };
}

export async function getMyDonations() {

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error ("Please log in first.");

    const { data, error } = await supabase
        .from("donations")                            // table
        .select("*")                                  // give me all columns
        .eq("donor_id", user.id)                      // where donor_id = me
        .order("created_at", { ascending: false });   // newest first

    if (error) throw new Error(error.message);
    return { donations: data };

}

export async function withdrawDonation(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");

  const { error } = await supabase       // note: only { error } — no data expected
    .from("donations")
    .update({ status: "withdrawn" })
    .eq("id", id)                        // this donation...
    .eq("donor_id", user.id);            // ...and only if it's mine

  if (error) throw new Error(error.message);
}

export async function getAvailableDonations() {
    const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { donations: data };
}