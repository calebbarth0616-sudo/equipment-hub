# Video pitch script (sections 2-6, after your intro)

Target length: about 3 minutes spoken. Lines in quotes are what you say;
[ON SCREEN] lines are what the viewer sees.

## 2. App name (about 10 sec)
"My app is called Equipment Hub."
[ON SCREEN: landing page, headline "Give game-day gear a second life."]

## 3. Purpose (about 10 sec)
"Equipment Hub connects people who have spare sports equipment with verified schools and community leagues that can't afford it."
[ON SCREEN: stay on the landing page, scroll to the three "How it works" steps]

## 4. Target audience (about 25 sec)
"It's built for three groups. First, donors: schools, teams, and families with outgrown gear sitting in closets. Second, underserved schools and community leagues that need equipment and often can't pay for it. And third, the administrators who keep it trustworthy by checking every team before it can receive anything."
[ON SCREEN: the sign-up page, showing the two choices, "Donor" and "School / League"]

## 5. Tools and languages (about 35 sec)
"I built it as a web app. The front end is React and Next.js, written in JavaScript and styled with Tailwind CSS. The back end runs on Supabase, which gives me a PostgreSQL database, user logins, and file storage. I built the back end, meaning the database, the security rules, and the data functions, using SQL and JavaScript, and I used Claude, an AI coding assistant, to guide me and to build most of the front end. It's hosted on Vercel, and the code lives on GitHub."
[ON SCREEN: a simple text slide: JavaScript, React, Next.js, Tailwind CSS, SQL, Supabase (PostgreSQL, Auth, Storage), Vercel, GitHub, Claude Code]

## 6. Live demonstration (about 100 sec)
Have two browser windows ready: a normal window logged in as a donor, and a private window logged in as a school.

1. [Browse page, logged out] "Anyone can see what teams need right now. Each request tells the team's story and shows the school's name with a verified badge. An admin checks every team before donors can offer anything. These listings are demo data. I can filter by sport, or by distance from my ZIP code."
   [Click a sport filter, then tick "Near me" and pick 25 miles.]
2. [School window: My requests, then "+ Request equipment"] "A school posts what it needs and why." [Fill in the form and post it.]
3. [Donor window: Browse] "A donor finds a request they can fill and offers one of their listed donations." [Click "Offer one of my donations", pick one, click "Send offer".] "Behind the scenes, the offer and both status changes happen together or not at all, so nobody can double-book the same gear."
4. [School window: Matches] "The school sees an alert, reviews the offer, and accepts." [Click the Matches badge, then Accept, then "Show contact info".] "Only now, after both sides agree, do they see each other's contact details. Donors are never shown publicly."
5. [Admin window: /admin] "Admins verify new schools, and track accepted matches through to delivery." [Show the verification queue and "Deliveries in progress". Don't click "Mark delivered".]
6. [/results] "Every completed delivery is counted on a public impact page. We're just starting our pilot, so it shows the first deliveries are in progress."

## 7. Security (about 50 sec)
"Security was a design decision from the start, because the app handles accounts and school information. Passwords are handled by Supabase's login system, so I never see or store them, and new accounts must confirm their email. Every database table has row-level security, which means the database itself decides who can read or change each row: donors can only edit their own listings, a match is visible only to the two people in it, and donor profiles are never public. Schools upload a verification document to private storage that only admins can open, and the server refuses offers to unverified schools. Contact details stay hidden until both sides accept. A review of my database also caught a hole: someone calling the signup system directly could have created an admin account, so the server now only allows donor or school roles. Admin powers are checked in the database, not just the browser. And I collect as little as possible: an email, a name, and a ZIP code, never a street address or payment details. Next, I'd add two-factor login for admins, rate limiting, and error monitoring."
[ON SCREEN: a short bullet slide: Passwords handled by Supabase Auth, Row-level security on every table, Private storage for documents, Server-side verification checks, Contact info revealed only after both sides accept, Minimal data: no street addresses or payments]
