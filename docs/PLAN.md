# Equipment Hub — Revised Plan (Sep 3, 2026)

The original plan assumed a July start; the build actually began ~Sep 1.
Weeks 1–3 of the original plan (auth, donations/requests, matching, landing,
admin, demo polish) are **done and deployed**. Four weeks remain before the
deadline: *fully functional with real donation results before October 2026*.

Division of labor stays: Caleb runs SQL / owns the backend (guided); Claude
builds the frontend and absorbs overflow. ~10 hrs/week.

| Week | Dates | Focus | Done-check |
|---|---|---|---|
| A | Sep 3–9 | Org verification (storage upload, admin queue), real admin role (`is_admin()` RLS), offers gated to verified teams. **Send nonprofit outreach** (docs/pitch). | Admin approves a test org; unverified orgs can't receive offers |
| B | Sep 10–16 | Geographic matching (ZIP → lat/lng, distance filter + sort) and Resend emails (offer proposed, accepted, verification decision) | Two accounts in different ZIPs see distance-sorted results; emails arrive |
| C | Sep 17–23 | Security pass (role enforcement on posting, RLS audit, `zod` validation), privacy + terms pages, Sentry; **begin onboarding real orgs and donors** | Smoke path green; first real accounts created |
| D | Sep 24–30 | Pilot: shepherd first real matches to `delivered`; public results page | Real `delivered` matches before Oct 1 |

Deferred past October: rate limiting beyond basics, full accessibility pass,
reports/flag queue (admin removal covers moderation), broader test suite,
photos, in-app messaging, weekly digest emails, stale-offer nudges.

Known gaps carried on the list: roles not enforced on donations/requests
insert policies (Week C); a matched request can be closed then reopened by a
decline (Week C, low severity).

Progress log:
- Sep 3: Week A build shipped — migrations 14–15, lib/orgs.js, /verify,
  admin queue, verified badges + offer gating, navbar Admin/Verification links.
