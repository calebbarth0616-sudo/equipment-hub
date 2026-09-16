// lib/location.js — set the logged-in user's location for distance matching.
//
// We only ask for a ZIP code (simplest input for the user), then geocode it
// client-side via Zippopotam.us — a free, no-key, no-signup API — into a
// city, state, and lat/lng, and save all four to the profiles row. No paid
// maps service needed at this scale.

import { supabase } from "@/lib/supabase";

export async function updateMyLocation({ zip }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please log in first.");
  if (!/^\d{5}$/.test(zip)) throw new Error("Please enter a 5-digit ZIP code.");

  // Geocode the ZIP. This throws its own clear error if the ZIP doesn't
  // exist, BEFORE we touch the database — never save half-good data.
  const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!response.ok) {
    throw new Error("That doesn't look like a valid US ZIP code.");
  }
  const geo = await response.json();
  const place = geo.places?.[0];
  if (!place) throw new Error("Couldn't find that ZIP code.");

  const { error } = await supabase
    .from("profiles")
    .update({
      zip,
      city: place["place name"],
      state: place["state abbreviation"],
      lat: Number(place.latitude),
      lng: Number(place.longitude),
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return { city: place["place name"], state: place["state abbreviation"] };
}
