# Equipment Hub — Revised Plan (updated Sep 16, 2026)

The original plan assumed a July start; the build actually began ~Sep 1.
**Second date correction:** the Sep 3 revision assumed 4 remaining weeks;
13 days passed with no session, so as of Sep 16 there are only **2 weeks**
before the deadline: *fully functional with real donation results before
October 2026*. The schedule below is compressed accordingly — Weeks B and C
are merged, and the biggest remaining risk is no longer code, it's whether
a logistics partner (nonprofit or a directly-contacted league) is lined up
in time to produce a real, physical `delivered` match. That step depends on
Caleb, not on code, and needs to happen THIS WEEK regardless of build status.

Division of labor stays: Caleb runs SQL / owns the backend (guided); Claude
builds the frontend and absorbs overflow.

| Week | Dates | Focus | Done-check |
|---|---|---|---|
| A | Sep 3–9 (built; SQL run pending) | Org verification (storage upload, admin queue), real admin role (`is_admin()` RLS), offers gated to verified teams. | Admin approves a test org; unverified orgs can't receive offers |
| B | Sep 16–22 | Geographic matching (built — SQL run pending) + minimal security pass (role enforcement on posting, basic RLS audit) + privacy/terms pages. **Nonprofit/league outreach must go out this week if it hasn't already.** | Distance-sorted results work; a partner (or directly-contacted league) is confirmed for the pilot |
| C | Sep 23–30 | Onboard real orgs/donors immediately (don't wait for perfect polish); shepherd first real matches to `delivered`; public results page | Real `delivered` matches before Oct 1 |

Cut to protect the deadline: Resend email notifications (Browse/dashboard
badges cover the "might miss a match" concern for now — email can follow
right after the deadline), Sentry, broader automated tests, accessibility
deep pass, reports/flag queue (admin removal covers moderation), rate
limiting beyond Supabase's defaults. All previously deferred items (photos,
messaging, weekly digests) stay deferred.

Known gaps carried on the list: roles not enforced on donations/requests
insert policies; a matched request can be closed then reopened by a decline
(both low severity, fine to ship pilot with).

Progress log:
- Sep 3: Week A build shipped — migrations 14–15, lib/orgs.js, /verify,
  admin queue, verified badges + offer gating, navbar Admin/Verification links.
- Sep 16: Schedule re-corrected (2 weeks left, not 4). Week B geographic
  matching shipped — migration 16, lib/location.js, /profile,
  getNearby*/nearby_* RPCs, Browse "Near me" filter + distance badges.
  Caleb has two migrations queued to run: 14+15 (Week A, still pending
  confirmation) and 16 (Week B, new).
- Sep 16 (late): Caleb ran migrations 14–16, promoted bare gmail to admin,
  verified both loops live. Security pass shipped — migration 17 (role
  enforcement on posting, decline/closed fix, get_public_results),
  /results, /privacy, /terms, footer, donor-school outreach template
  (docs/pitch/04). Caleb to run migration 17 next session. Remaining:
  outreach emails (Caleb, morning of Sep 17), real onboarding, pilot
  matches to delivered.
