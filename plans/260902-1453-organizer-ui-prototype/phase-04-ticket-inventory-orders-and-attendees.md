---
phase: 4
title: Ticket inventory orders and attendees
status: completed
priority: P1
effort: 6-7h
dependencies:
  - 1
  - 2
---

# Phase 4: Ticket inventory orders and attendees

## Context Links

- [Overview](./plan.md)
- [Organizer domain](./phase-02-organizer-domain-and-fixtures.md)
- [Event workflow](./phase-03-dashboard-and-event-workflow.md)

## Overview

Xây ba page vận hành theo event: ticket tiers/inventory, orders và attendees. Dùng drawer/dialog cho detail để không tăng route ngoài 12 page đã duyệt.

## Requirements

- Ticket tier: tạo/sửa, scheduled/on-sale/paused/sold-out/ended, capacity/sold/remaining, sales window và per-order limit.
- Orders: event-scoped search/filter, trạng thái/payment summary, detail drawer, refund information mock nhưng không gọi payment.
- Attendees: phân biệt buyer với ticket holder; filter theo tier/status/source; detail drawer.
- Không chỉnh trực tiếp sold count; không để capacity thấp hơn sold count.
- Export CSV chỉ là UI notice ở P0, không tạo file giả.

## Architecture

Pure helpers validate tier và filter event-scoped collections. Desktop dùng semantic tables; mobile dùng shared labeled record cards. Detail drawer nhận selected ID và resolve từ canonical state, không copy entity vào local state.

## Related Code Files

- Create: `src/features/organizer/pages/OrganizerTicketInventoryPage.tsx`
- Create: `src/features/organizer/pages/OrganizerOrdersPage.tsx`
- Create: `src/features/organizer/pages/OrganizerAttendeesPage.tsx`
- Create: `src/features/organizer/components/OrganizerInventorySummary.tsx`
- Create: `src/features/organizer/components/OrganizerTicketTierList.tsx`
- Create: `src/features/organizer/components/OrganizerTicketTierForm.tsx`
- Create: `src/features/organizer/components/OrganizerOrderFilters.tsx`
- Create: `src/features/organizer/components/OrganizerOrderTable.tsx`
- Create: `src/features/organizer/components/OrganizerOrderDetailDrawer.tsx`
- Create: `src/features/organizer/components/OrganizerAttendeeFilters.tsx`
- Create: `src/features/organizer/components/OrganizerAttendeeTable.tsx`
- Create: `src/features/organizer/components/OrganizerAttendeeDetailDrawer.tsx`
- Create: `src/features/organizer/components/OrganizerResponsiveRecordList.tsx`
- Create: `src/features/organizer/helpers/validate-organizer-ticket-tier.ts`
- Create: `src/features/organizer/helpers/filter-organizer-orders.ts`
- Create: `src/features/organizer/helpers/filter-organizer-attendees.ts`
- Create: `src/features/organizer/helpers/organizer-operations.test.ts`

## Implementation Steps

1. Viết tests cho tier price/capacity/date/per-order limit và immutable update.
2. Viết order/attendee filter tests, đặc biệt event isolation và normalized Vietnamese search.
3. Implement inventory summary và tier CRUD modal/form.
4. Disable/guard invalid status changes và capacity reductions.
5. Implement order filters/table/cards và detail drawer với buyer, line items, tickets, refund/payout context.
6. Implement attendee filters/table/cards và detail drawer với holder, buyer, credential, source và check-in state.
7. Thêm empty, no-match, loading-placeholder semantics phù hợp mock UI.
8. Kiểm tra drawer focus trap/Escape/focus return và 320px presentation.

## Todo List

- [ ] Operations tests fail trước implementation. (Tests đã được bổ sung và chạy pass, nhưng không được viết trước helper implementation.)
- [x] Inventory invariants được test và guard.
- [x] Order/attendee không rò dữ liệu event khác.
- [x] Desktop table và mobile card đều đọc được.
- [x] Detail drawers hỗ trợ keyboard.

## Success Criteria

- [ ] Remaining luôn bằng capacity trừ sold.
- [ ] Mọi order/attendee view scoped đúng event.
- [ ] Filter reset và empty state rõ ràng.
- [ ] Status luôn có text, không chỉ dựa màu.
- [ ] Không có network, file export hoặc payment mutation.

## Risk Assessment

Bảng dày dễ vỡ mobile và attendee/order dễ bị đánh đồng. Dùng view model/card chung chỉ cho presentation; giữ domain types riêng và event-scoped selector bắt buộc.

## Security Considerations

Thông tin email/phone là fixture; UI cần masking hợp lý ở card tóm tắt và không mô tả export như chức năng thật.

## Next Steps

Phase 5 tái sử dụng attendee selector và reducer guard để xây check-in console.
