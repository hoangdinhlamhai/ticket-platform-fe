---
phase: 7
title: Integration accessibility and validation
status: completed
priority: P1
effort: 5-7h
dependencies:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
---

# Phase 7: Integration accessibility and validation

## Context Links

- [Overview](./plan.md)
- All prior phase files in this plan
- Existing app shell: `src/app/App.tsx`
- Structural tests: `src/app/application-structure.test.ts`
- Test command inventory: `package.json`

## Overview

Tích hợp Organizer vào app, hoàn thiện not-found/empty/error states, accessibility, responsive, regression tests, docs và validation cuối. Phase này sở hữu các shared files để tránh conflict.

## Requirements

- 12 direct URLs render đúng; unknown Organizer URL không rơi về attendee.
- Organizer state giữ qua SPA navigation, reset khi refresh.
- Existing attendee state/routes/flows không đổi.
- Tất cả page có landmark, heading, focus handling, status text và demo limitation.
- Browser validation ở 320px, 768px và desktop.
- Mọi test file mới được thêm vào explicit npm test script.

## Architecture

`App` sở hữu shared pathname/navigation và gọi `useOrganizerWorkspace()` unconditionally. Prefix `/organizer` dispatch sang `OrganizerApplication`; còn lại dùng attendee application hiện tại. `OrganizerApplication` resolve route/event và truyền narrow state/actions tới page.

## Related Code Files

- Create: `src/app/OrganizerApplication.tsx`
- Create: `src/features/organizer/pages/OrganizerNotFoundPage.tsx`
- Create: `src/features/organizer/components/OrganizerPrototypeNotice.tsx`
- Create: `src/features/organizer/index.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/application-structure.test.ts`
- Modify: `package.json`
- Modify: `README.md`

## Implementation Steps

1. Tạo Organizer barrel exports sau khi toàn bộ modules ổn định.
2. Tạo `OrganizerApplication` render switch, event resolution và event-not-found behavior.
3. Refactor `App.tsx` tối thiểu: shared path/navigation, organizer prefix dispatch, giữ attendee orchestration không đổi.
4. Gọi workspace hook unconditional để không vi phạm Rules of Hooks và giữ session state khi chuyển persona route.
5. Mở rộng structural tests: expected files, PascalCase page/component, App wiring, shell a11y contracts.
6. Thêm negative structural scan cho `localStorage`, `sessionStorage`, IndexedDB, fetch/API, Supabase, WebSocket, `mediaDevices`, `BarcodeDetector` trong Organizer source.
7. Thêm tất cả `.test.ts` mới vào `package.json`; kiểm tra test inventory không bỏ sót.
8. Bổ sung Organizer scope/routes/demo limitations vào README.
9. Chạy unit tests theo phase, sau đó full `npm test`, `npm run lint`, `npm run build`.
10. Chạy browser smoke matrix: direct URL, Back/Forward, keyboard, create/edit/review/publish, inventory guard, filters, check-in, analytics, settings, refresh reset.
11. Kiểm tra 320px/768px/desktop, console errors và horizontal overflow.
12. Sau validation, dùng code-reviewer rà correctness, maintainability và regression; xử lý finding xác thực rồi rerun gates.

## Todo List

- [ ] OrganizerApplication và prefix dispatch hoàn tất.
- [ ] Existing attendee regression tests pass.
- [ ] Structural/no-forbidden-API checks pass.
- [ ] Full test/lint/build pass.
- [ ] Browser matrix và responsive pass.
- [ ] README phản ánh đúng prototype boundary.
- [ ] Code review không còn finding nghiêm trọng.

## Success Criteria

- [ ] Chính xác 12 page P0 reachable dưới `/organizer`.
- [ ] Create → edit → submit review → publish approved fixture chạy end-to-end trong session.
- [ ] Inventory, event isolation và check-in invariants không thể bypass qua UI callback.
- [ ] Finance/analytics deterministic và accessible.
- [ ] Refresh reset fixture được ghi rõ trên UI và README.
- [ ] Không backend/persistence/payment/QR/camera/realtime/new runtime dependency.
- [ ] `npm test`, `npm run lint`, `npm run build` exit 0.

## Risk Assessment

`App.tsx` có nguy cơ thành coordination monolith. Giới hạn thay đổi ở persona dispatch; Organizer route/page logic nằm trong `OrganizerApplication`, domain logic trong feature helpers/hook. Manual UI coverage là cần thiết vì project chưa có component/E2E runner.

## Security Considerations

- Không coi client route là authorization.
- Không chứa secret, payment credential hoặc QR payload.
- Mask finance fixture và ghi rõ dữ liệu minh họa.
- Backend tương lai phải tái xác thực event ownership, lifecycle, inventory và check-in atomically.

## Next Steps

Sau khi phase này hoàn tất, dùng Organizer UI/domain contracts làm đầu vào thiết kế database và backend; chưa tự động hợp nhất Organizer fixture với attendee catalog trong cùng plan.
