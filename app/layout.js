// app/layout.js — the ROOT LAYOUT.
//
// In Next.js, every file called `page.js` inside `app/` becomes a page of the
// site (app/page.js -> "/", app/login/page.js -> "/login", and so on).
// This layout file is the frame wrapped around ALL of those pages: it renders
// the shared <html> and <body> tags, loads the fonts and global CSS, and puts
// the navbar at the top of every page. `children` is whichever page the
// visitor is currently on.

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// next/font downloads these Google Fonts at build time and serves them from
// our own site (faster, and no request to Google from visitors' browsers).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// `metadata` sets the browser-tab title and the description search engines see.
export const metadata = {
  title: "Equipment Hub",
  description:
    "Donate sports equipment to underserved schools and community leagues.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* min-h-full + flex column lets pages stretch to fill the window */}
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
