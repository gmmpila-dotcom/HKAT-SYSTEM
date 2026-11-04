# Reskin Progress Checklist

## Phase 0 - Setup
- [x] Create RESKIN_PROGRESS.md

## Phase 1 - Shell and Dashboard
- [ ] Rebuild AuthenticatedLayout: left sidebar icon-only, expands on hover, HKAT logo, active cream pill, top bar with greeting, bell, mail, gear, user chip
- [ ] Rebuild Parent/Dashboard.jsx: hero card, upcoming sessions, rate card from config/rates.php, recent progress, billing snapshot
- [ ] Tests pass (`php artisan test`)
- [ ] Build passes (`npm run build`)

## Phase 2 - Booking and Rate
- [ ] Create config/rates.php with price list
- [ ] Rebuild Parent/Book.jsx: session kind, details, date/time, tutor selection, summary card
- [ ] Implement rateFor() per price rules
- [ ] Update calculateRate and BookingWorkflowTest
- [ ] Add RateCalculationTest covering all grade bands, subjects, special teaching, home-based minimum, hours multiplier, no class discount
- [ ] Confirm and Pay calls store(), redirects to Billing if no PayMongo key
- [ ] Reskin Parent/Billing/Index.jsx and Parent/Progress/Index.jsx
- [ ] Tests pass
- [ ] Build passes

## Phase 3 - Modal, Notifications, Messages, Settings
- [ ] Session details modal with tutor card, date/time, what to bring, arrive early note
- [ ] Bell slide-over notifications panel with All/Unread tabs, mark read/all read
- [ ] Messages: two-pane inbox + conversation view with search
- [ ] Settings: profile info, change password with strength meter, notification toggles for existing types only
- [ ] Tests pass
- [ ] Build passes

## Phase 4 - Online Sessions
- [ ] Add "Online" to location_type (convert enum to string column)
- [ ] Add nullable meeting_url, joined_at, started_at, ended_at to tutoring_sessions
- [ ] Tutor/admin can paste Google Meet link
- [ ] Parent Join button opens meeting_url in new tab, enabled 15 min before start until end, shows "Link pending" if no link
- [ ] First click sets joined_at
- [ ] Tutor can mark session started/ended
- [ ] Show times on parent dashboard and admin sessions page
- [ ] Feature tests: parent join access, tutor edit own sessions, Join time window
- [ ] Tests pass
- [ ] Build passes

## Phase 5 - Polish
- [ ] Apply new shell and card styling to Tutor and Admin pages
- [ ] Fix visual leftovers (date formatting)
- [ ] Tests pass
- [ ] Build passes

## Phase 6 - Final Verification
- [ ] Full test suite passes
- [ ] Production build passes
- [ ] Final report: changes per phase, test/assertion count, build result, defaults used, elements left out