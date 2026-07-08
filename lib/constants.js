// lib/constants.js — shared lists used by multiple pages.
//
// Kept in one place so the "New Donation" form, the "New Request" form, and
// the Browse filters all offer identical choices. The condition values must
// match the database's check constraint (see migrations/05).

export const SPORTS = [
  "Baseball",
  "Basketball",
  "Football",
  "Lacrosse",
  "Soccer",
  "Softball",
  "Tennis",
  "Track & Field",
  "Volleyball",
  "Other",
];

// value = what the database stores; label = what humans read.
export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

export const CONDITION_LABELS = Object.fromEntries(
  CONDITIONS.map((c) => [c.value, c.label])
);
