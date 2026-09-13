---
phase: 5
title: Check-in console
status: completed
priority: P1
effort: 4-5h
dependencies:
  - 2
  - 4
---

# Phase 5: Check-in console

## Context Links

- [Overview](./plan.md)
- [Organizer domain](./phase-02-organizer-domain-and-fixtures.md)
- [Attendee operations](./phase-04-ticket-inventory-orders-and-attendees.md)

## Overview

Xây console check-in thủ công cho từng event, mô phỏng đầy đủ valid, duplicate, revoked/void, wrong event và not found. Không dùng camera hoặc QR decoder.

## Requirements

- Search bằng tên, email, ticket reference hoặc order reference.
- Nếu nhiều kết quả, người vận hành phải chọn attendee trước khi xác nhận.
- Valid credential check-in đúng một lần.
- Duplicate, void/revoked, wrong event, not found không mutate state.
- Hiển thị tổng checked-in, tỷ lệ và recent activity từ canonical workspace.
- Copy phải ghi rõ “tra cứu/check-in mô phỏng”, không gọi đây là scanner thật.

## Architecture

`eventId + query -> event-scoped candidate selector -> selected attendee ID -> reducer checkInAttendee -> operation result -> aria-live result + activity`. Reducer kiểm tra canonical state tại thời điểm action để chống double click.

## Related Code Files

- Create: `src/features/organizer/pages/OrganizerCheckInPage.tsx`
- Create: `src/features/organizer/components/OrganizerCheckInSearch.tsx`
- Create: `src/features/organizer/components/OrganizerCheckInCandidateList.tsx`
- Create: `src/features/organizer/components/OrganizerCheckInResult.tsx`
- Create: `src/features/organizer/components/OrganizerCheckInActivity.tsx`
- Create: `src/features/organizer/components/OrganizerCheckInSummary.tsx`
- Create: `src/features/organizer/helpers/find-organizer-check-in-candidates.ts`
- Create: `src/features/organizer/helpers/organizer-check-in.test.ts`

## Implementation Steps

1. Viết tests cho normalized lookup, event isolation, no/multiple match.
2. Viết reducer integration tests cho valid, duplicate, void, wrong event và rapid repeat.
3. Implement search form và result selection; Enter không auto-check-in khi nhiều match.
4. Implement confirmation panel hiển thị holder, tier, seat/source và credential status.
5. Render success/failure outcomes với text/icon và live announcement phù hợp.
6. Render recent check-in activity và derived event summary.
7. Thêm reset/continue action để xử lý attendee tiếp theo.
8. Search source bảo đảm không có `mediaDevices`, `BarcodeDetector`, QR library hoặc scanner permission.

## Todo List

- [ ] Check-in tests fail trước implementation.
- [ ] Lookup luôn event-scoped.
- [ ] Valid check-in update attendee + activity atomically.
- [ ] Duplicate/void/wrong-event không mutate.
- [ ] Keyboard flow từ search đến confirmation hoàn chỉnh.

## Success Criteria

- [ ] Một attendee hợp lệ chỉ check-in được một lần.
- [ ] Rapid double click không tạo hai records.
- [ ] Result panel được screen reader thông báo.
- [ ] Không có camera/scanner API hoặc QR payload thật.
- [ ] UI hoạt động ở mobile gate width.

## Risk Assessment

Sai check-in là failure nghiêm trọng dù chỉ prototype. Không dựa vào disabled button; reducer phải guard và trả operation outcome có thể hiển thị.

## Security Considerations

Không tạo credential có thể scan và không ám chỉ kiểm tra danh tính. Fixture code chỉ phục vụ tìm kiếm UI.

## Next Steps

Phase 6 dùng check-in records để dựng analytics; Phase 7 chạy manual matrix toàn flow.
