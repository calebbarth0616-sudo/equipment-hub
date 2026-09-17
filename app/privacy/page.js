// app/privacy/page.js — privacy policy ("/privacy").
//
// Written to match what the app ACTUALLY collects — nothing aspirational.
// If data practices change, this page must change in the same commit.

const SECTIONS = [
  {
    title: "What we collect",
    body: "Your email address and a display name when you create an account; your city, state, and ZIP code if you choose to set a location (used only to show nearby matches); equipment listings and requests you post; and, for schools and leagues, a verification document you upload (such as a letterhead or roster page).",
  },
  {
    title: "What we never collect",
    body: "Street addresses, payment information, phone numbers, or anything about minors. Physical handoff details are coordinated outside the platform by our logistics partner or directly between matched parties.",
  },
  {
    title: "Who can see what",
    body: "School and league names are public alongside their requests — that visibility is the point of the platform. Donor identities are never shown publicly; a donor's name and email are revealed only to the specific team whose request they matched with, and only after both sides accept. Verification documents are visible only to administrators. Your ZIP code is never displayed to anyone; other users see only approximate distances.",
  },
  {
    title: "How it's protected",
    body: "Passwords are handled by Supabase authentication and are never visible to us. Every database table is protected by row-level security rules that limit each account to exactly the data it is allowed to see. Verification documents live in private storage accessible only through time-limited links generated for administrators.",
  },
  {
    title: "Deleting your data",
    body: "Email us at calebbarth0616@gmail.com and we will delete your account and everything attached to it. Deleting your account automatically removes your profile, listings, requests, and matches.",
  },
  {
    title: "Changes",
    body: "If this policy changes, the date below changes with it. Significant changes will be announced on the site.",
  },
];

export const metadata = { title: "Privacy Policy — Equipment Hub" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Last updated: September 16, 2026</p>
      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
