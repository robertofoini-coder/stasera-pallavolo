# V001 — changes and verification, 18 November 2026

## Organizer and group court update

Organizer name/badge and Group Court/Participants tabs are included in V001.
The group court shares the 12 regulation zones with match details. Additional
capacity is shown as bench seats, up to 18 for capacity 30. Existing members
without positions receive explicit demo assignments. Personal position changes,
booking, cancellation/rebooking, persistence, invitations and IT/EN were checked
in an isolated Edge context. Publication of this increment is to the two GitHub `Html` branches; the hosted
public mockup remains a separate deployment.

## Published baseline

Branch `Html`, V001 only. V000 remains identical to baseline `eed6e08`.
Plain HTML/CSS/JavaScript; no application build step or new runtime dependencies.

## Implemented

- Temporary top V000/V001 selector with bilingual changes dialog on every switch.
  V000 loads unmodified in a comparison frame.
- Match information/progress, Court/Participants/Info tabs, event-specific Maps
  searches without invented coordinates. Proper volleyball zones: lower front
  4–3–2/back 5–6–1; upper team rotated 180 degrees; existing slot IDs preserved.
- Demo participant names/initials per event, own uploaded photo and seat highlight.
  Choosing a spot enables, highlights, scrolls to and focuses the booking button.
  Reduced motion respected. Cancellation releases the spot.
- Created group matches appear in Explore with date/search filtering and open
  their own group-match detail, retaining support for capacities above 12.
- Organizer edits: only own unstarted matches, capacity 2–30 and at least current
  attendance. Members/invitations preserved. Only the selected occurrence changes.
  Date/time/venue locked with other registered members. Duplication preserves the
  original behavior of starting a fresh match without members or invitations.
- Central IT/EN catalog, explicit message/attribute bindings and render helpers.
  Selector only in Settings; immediate updates and localStorage persistence.
  Covers app, admin demo, guides, notifications, forms, feedback code and payment/
  refund dialogs. Stored roles/statuses and proper names are not translated.
  V000 intentionally remains original/Italian. V001 storage namespace is isolated.

## Verification

Headless Edge/Playwright at 390, 820 and 1440 pixels: syntax, version switch and
dialog, IT/EN switching, navigation, Maps, zones, seat/focus, payment/cancellation,
group creation/edit limits, member preservation, invites, duplication, recurring
holiday exclusion, theme/profile and ratings. No pageerror or horizontal overflow
in tested paths. Additional English tests check language persistence, unchanged
group name `Campo`, created-match selection in Explore, draft preservation, own
photo on court/player card, tutorial and payment/refund labels.

Harnesses: `tests/flows.mjs` and `tests/english.mjs` and `tests/group-court.mjs`. Run with Node, Edge and
Playwright. Set `PLAYWRIGHT_MODULE` to a file URL for an external Playwright
installation if needed. Tests use a temporary loopback server, isolated contexts
and local demo data. Screenshots go to the OS temporary directory. No live data,
real payments or invitations used.

## Limits

Groups, organizer identity, payments, invites and admin PIN are local demos,
not shared data or real authorization. Group matches now include both the member-list and interactive twelve-zone
court with additional bench seats.
No waitlist, real notification service or backend integration claimed.
The original payment demo uses a simulated start timestamp for its 24h policy.
No certification on physical iPhone/Android devices. Original fixed mockup clock
and device frame remain. Preview deployment is separate from public production.
