// lib/matches.js — data functions for matches.

import { supabase } from "@/lib/supabase";

export async function proposeMatch({ donationId, requestId }) {
  // .rpc(name, args) runs a database function. The argument names must
  // match the SQL parameter names exactly — p_donation_id, p_request_id.
  const { data, error } = await supabase.rpc("propose_match", {
    p_donation_id: donationId,
    p_request_id: requestId,
  });
  if (error) throw new Error(error.message);
  return { match: { id: data } }; // data = the uuid the function returns
}

export async function acceptMatch(matchId) {
  const { error } = await supabase.rpc("accept_match", { p_match_id: matchId });
  if (error) throw new Error(error.message);
}

export async function declineMatch(matchId) {
    const { error } = await supabase.rpc("decline_match", { p_match_id: matchId });
    if (error) throw new Error(error.message);
}

export async function getMyMatches() {
  const { data, error } = await supabase
    .from("matches")
    // "table(*)" inside a select follows the foreign key and embeds the
    // whole related row — each match arrives carrying its donation and
    // request objects, so pages never fetch twice.
    .select("*, donation:donations(*), request:requests(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return { matches: data };
}