# Ticketly domain-boundary refactor

## Completed source changes
- Added neutral shared SVG primitives at `src/components/icons/TicketlyIcons.tsx`.
- Added `events`, `tickets`, and `resale` domain modules with domain-local UI, types, static mock data, and feature barrels.
- Added `pages/attendee` composition boundary. Event discovery state is now feature-owned; local page notices retain the original Vietnamese CTA feedback.
- Updated `src/App.tsx` to import `./pages/attendee`.

## Validation
- `npm --prefix "D:\ĐồÁnTốtNghiệp\ticket-platform-vite" run lint`: not run. The execution tool failed before launching any process with `ENAMETOOLONG: name too long, uv_spawn`.
- `npm --prefix "D:\ĐồÁnTốtNghiệp\ticket-platform-vite" run build`: not run for the same execution-environment failure.
- No test runner exists in this project; none added.

## Blockers
- The execution environment's process-spawn failure also prevented deleting the now-empty `src/features/attendee` files/directories. They have no remaining source content or imports but still must be removed using a functioning shell/file deletion tool before acceptance.
