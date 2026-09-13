---
title: Ticketly Organizer UI Prototype
description: >-
  Triển khai bề mặt Organizer P0 bằng mock data và React state trước khi thiết
  kế database/backend.
status: completed
priority: P1
branch: none-target-project-not-git
tags:
  - organizer
  - ui-prototype
  - react
  - ticketing
blockedBy: []
blocks: []
created: '2026-09-02T08:24:24.711Z'
createdBy: 'ck:plan'
source: skill
---

# Ticketly Organizer UI Prototype

## Overview

Xây dựng 12 page Organizer dưới `/organizer`, bao phủ vòng đời tạo sự kiện, Admin review, bán vé, quản lý vận hành, check-in, báo cáo và tài chính. Toàn bộ dữ liệu dùng fixture + React state; refresh reset; không backend, persistence, payment, QR scanner hoặc phân quyền thật.

## Scope Locks

- Một tài khoản quản lý đúng một tổ chức; không organization switcher.
- Organizer được gửi duyệt và xuất bản sự kiện đã được duyệt; không tự phê duyệt.
- Check-in là tra cứu thủ công mô phỏng, nằm trong Organizer.
- Orders, refunds và payouts chỉ đọc ở P0.
- Organizer fixture chưa tự đồng bộ với attendee fixture.
- Giữ History API router hiện tại; không thêm dependency.

## Pages

`/organizer`, `/organizer/events`, `/organizer/events/new`, `/organizer/events/:eventId`, `/edit`, `/tickets`, `/orders`, `/attendees`, `/check-in`, `/analytics`, `/organizer/finance`, `/organizer/settings`.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Routing and shell](./phase-01-routing-and-shell.md) | Completed |
| 2 | [Organizer domain and fixtures](./phase-02-organizer-domain-and-fixtures.md) | Completed |
| 3 | [Dashboard and event workflow](./phase-03-dashboard-and-event-workflow.md) | Completed |
| 4 | [Ticket inventory orders and attendees](./phase-04-ticket-inventory-orders-and-attendees.md) | Completed |
| 5 | [Check-in console](./phase-05-check-in-console.md) | Completed |
| 6 | [Analytics finance and settings](./phase-06-analytics-finance-and-settings.md) | Completed |
| 7 | [Integration accessibility and validation](./phase-07-integration-accessibility-and-validation.md) | Completed |

## Dependencies

- Phases 1 and 2 can start independently.
- Phases 3, 4 and 6 require route/shell and domain contracts.
- Phase 5 requires attendee data and check-in transitions from Phases 2 and 4.
- Phase 7 integrates all phases and owns shared app/test/package/doc updates.
- No overlapping unfinished plan detected in the target project's `plans/` directory.

## Success Criteria

- All 12 Organizer URLs render directly and unknown `/organizer/*` never falls back to attendee home.
- Organizer review, inventory and check-in invariants are guarded by tested pure helpers/reducer.
- UI works at 320px, keyboard navigation and screen-reader status announcements are preserved.
- Existing attendee behavior remains unchanged.
- No persistence, network, camera/scanner, realtime or new runtime dependency is introduced.
- `npm test`, `npm run lint`, and `npm run build` pass.
