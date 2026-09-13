---
phase: 2
title: Organizer domain and fixtures
status: completed
priority: P1
effort: 7-8h
dependencies: []
---

# Phase 2: Organizer domain and fixtures

## Context Links

- [Overview](./plan.md)
- Existing session state: `src/app/App.tsx`
- Existing attendee event/order/ticket types under `src/features/`

## Overview

Xây domain mock độc lập và một workspace reducer cho tổ chức, event, ticket tier, order, attendee, check-in và payout. Chỉ lưu canonical entities; toàn bộ metric được derive bằng selector.

## Requirements

- Một workspace chứa đúng một `organization`.
- Event statuses: `draft`, `pending_review`, `changes_requested`, `approved`, `published`, `ongoing`, `ended`, `cancelled`, `rejected`.
- Organizer chỉ được submit review và publish event đã approved; không tự approve.
- Inventory không được nhỏ hơn sold count.
- Check-in valid cập nhật attendee + activity atomically; duplicate/void bị từ chối.
- Orders/refunds/payouts fixture-driven, read-only.

## Architecture

`useOrganizerWorkspace()` gọi `useReducer` với fixture factory mới mỗi lần mount. Actions: create/update event, submit review, publish approved event, upsert tier, set sale status, check in attendee, update organization. Guard nằm trong reducer/helper, không chỉ ở UI.

## Related Code Files

- Create: `src/features/organizer/types/organizer-organization.ts`
- Create: `src/features/organizer/types/organizer-event.ts`
- Create: `src/features/organizer/types/organizer-commerce.ts`
- Create: `src/features/organizer/types/organizer-workspace.ts`
- Create: `src/features/organizer/mock/organizer-organization-data.ts`
- Create: `src/features/organizer/mock/organizer-event-data.ts`
- Create: `src/features/organizer/mock/organizer-commerce-data.ts`
- Create: `src/features/organizer/mock/organizer-finance-data.ts`
- Create: `src/features/organizer/mock/create-organizer-workspace.ts`
- Create: `src/features/organizer/helpers/organizer-event-transitions.ts`
- Create: `src/features/organizer/helpers/organizer-inventory-transitions.ts`
- Create: `src/features/organizer/helpers/organizer-check-in-transitions.ts`
- Create: `src/features/organizer/helpers/organizer-workspace-reducer.ts`
- Create: `src/features/organizer/helpers/organizer-workspace-reducer.test.ts`
- Create: `src/features/organizer/helpers/select-organizer-metrics.ts`
- Create: `src/features/organizer/helpers/select-organizer-metrics.test.ts`
- Create: `src/features/organizer/hooks/use-organizer-workspace.ts`

## Implementation Steps

1. Viết types tách organization, event, commerce và workspace để giữ file dưới ~200 LOC.
2. Viết reducer tests trước: create draft, immutable edit, review guards, approved publish, inventory guard, atomic check-in.
3. Tạo fixture bao phủ draft/pending/changes requested/approved/published/ongoing/ended cùng trạng thái commerce đa dạng.
4. Viết referential-integrity test cho event/tier/order/attendee/check-in/payout IDs.
5. Implement pure transition helpers và reducer operation result rõ ràng.
6. Viết selectors doanh thu, tồn vé, sold rate, order count, check-in rate, payout summary và zero cases.
7. Tạo hook expose state và narrow actions; không expose raw dispatch cho page.

## Todo List

- [ ] Domain/reducer tests fail trước code.
- [ ] Fixture IDs liên kết hợp lệ.
- [ ] Illegal event transitions giữ state nguyên vẹn.
- [ ] Duplicate/void check-in không thêm activity.
- [ ] Metrics không lưu trùng trong state.

## Success Criteria

- [ ] Positive và negative test cho mọi lifecycle transition.
- [ ] Inventory luôn `capacity >= soldCount`.
- [ ] Check-in atomic và idempotent trong session.
- [ ] Fixture factory không mutate/shared state qua StrictMode.

## Risk Assessment

Nguy cơ drift giữa counters và entities, hoặc fixture inconsistent. Giảm thiểu bằng selectors thuần, reducer guard và integrity tests.

## Security Considerations

Credential/check-in values chỉ là reference mock; không encode token thật hay tạo cảm giác xác thực an toàn.

## Next Steps

Phases 3-6 consume workspace contracts; tránh sửa attendee domain để P0 không tạo migration giả.
