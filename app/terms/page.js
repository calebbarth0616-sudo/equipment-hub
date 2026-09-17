// app/terms/page.js — terms of service ("/terms").

const SECTIONS = [
  {
    title: "What Equipment Hub is",
    body: "A free platform that connects donors of used sports equipment with verified schools and community leagues. We facilitate the introduction and track the donation; we are not a party to the donation itself.",
  },
  {
    title: "Your account",
    body: "You must provide accurate information, keep your login to yourself, and be at least 18 to create an account. Organizations must be legitimate schools, leagues, or youth programs and complete verification before receiving donations.",
  },
  {
    title: "Donations",
    body: "All donations are gifts, given as-is and free of charge. Donors are responsible for describing equipment condition honestly; recipients are responsible for inspecting equipment before use, especially protective gear. Equipment Hub makes no warranty about the safety, fitness, or condition of any donated item.",
  },
  {
    title: "Acceptable use",
    body: "No selling, no soliciting payment, no misrepresenting your identity or organization, no listing anything other than sports equipment. We may remove content or accounts that break these rules.",
  },
  {
    title: "Liability",
    body: "Equipment Hub is provided as-is, without warranties of any kind. To the fullest extent permitted by law, we are not liable for any damages arising from the use of donated equipment or from interactions between users. Matched parties and logistics partners coordinate physical handoffs at their own discretion and risk.",
  },
  {
    title: "Contact",
    body: "Questions about these terms: calebbarth0616@gmail.com.",
  },
];

export const metadata = { title: "Terms of Service — Equipment Hub" };

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
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
