---
phase: 3
title: Dashboard and event workflow
status: completed
priority: P1
effort: 8-10h
dependencies:
  - 1
  - 2
---

# Phase 3: Dashboard and event workflow

## Context Links

- [Overview](./plan.md)
- [Routing and shell](./phase-01-routing-and-shell.md)
- [Organizer domain](./phase-02-organizer-domain-and-fixtures.md)

## Overview

Xây dashboard, event list, create wizard, event overview và edit page. Flow phải thể hiện rõ draft → gửi Admin duyệt → yêu cầu sửa/approved fixture → publish.

## Requirements

- Dashboard có metric, sự kiện sắp tới, hoạt động gần đây và việc cần xử lý.
- Event list search/filter/sort theo status, ngày và doanh thu.
- Create/edit dùng cùng form primitives; wizard giữ draft local và chỉ commit khi lưu.
- Organizer không có action approve/reject.
- `pending_review`, `published`, `ongoing`, `ended`, `cancelled`, `rejected` khóa field theo policy UI.
- `changes_requested` hiển thị phản hồi Admin và cho gửi duyệt lại.
- Preview attendee nằm trong panel/dialog, không thêm route thứ 13.

## Architecture

Page nhận canonical workspace + narrow actions qua props. Form hook quản lý draft/error/step; pure validator dùng lại khi save và reducer submit guard. Dashboard metric dùng Phase 2 selectors, không tự tính lại trong TSX.

## Related Code Files

- Create: `src/features/organizer/pages/OrganizerDashboardPage.tsx`
- Create: `src/features/organizer/pages/OrganizerEventListPage.tsx`
- Create: `src/features/organizer/pages/OrganizerEventCreatePage.tsx`
- Create: `src/features/organizer/pages/OrganizerEventOverviewPage.tsx`
- Create: `src/features/organizer/pages/OrganizerEventEditPage.tsx`
- Create: `src/features/organizer/components/OrganizerDashboardEventList.tsx`
- Create: `src/features/organizer/components/OrganizerEventTable.tsx`
- Create: `src/features/organizer/components/OrganizerEventCard.tsx`
- Create: `src/features/organizer/components/OrganizerEventForm.tsx`
- Create: `src/features/organizer/components/OrganizerEventBasicFields.tsx`
- Create: `src/features/organizer/components/OrganizerEventScheduleFields.tsx`
- Create: `src/features/organizer/components/OrganizerEventPolicyFields.tsx`
- Create: `src/features/organizer/components/OrganizerEventWizardProgress.tsx`
- Create: `src/features/organizer/components/OrganizerEventReviewPanel.tsx`
- Create: `src/features/organizer/components/OrganizerEventPreview.tsx`
- Create: `src/features/organizer/hooks/use-organizer-event-form.ts`
- Create: `src/features/organizer/hooks/use-organizer-event-list.ts`
- Create: `src/features/organizer/helpers/validate-organizer-event.ts`
- Create: `src/features/organizer/helpers/validate-organizer-event.test.ts`
- Create: `src/features/organizer/helpers/filter-organizer-events.ts`
- Create: `src/features/organizer/helpers/filter-organizer-events.test.ts`

## Implementation Steps

1. Viết validation tests cho required fields, date range, whitespace và first-invalid-field order.
2. Viết event filter tests cho query, status, sort và empty state.
3. Implement dashboard sections từ selectors và fixture activity.
4. Implement event list responsive: semantic table desktop, labeled cards mobile.
5. Implement wizard: cơ bản → thời gian/địa điểm → lịch trình/chính sách → ticket tier ban đầu → preview/save.
6. Commit create chỉ khi bấm lưu; new event luôn là `draft`.
7. Implement edit reuse form, status-based lock và unsaved-changes confirmation.
8. Implement overview với review panel, inventory/sales/check-in summary và lifecycle CTA hợp lệ.
9. Kiểm tra not-found event ID, direct URL và keyboard completion.

## Todo List

- [ ] Validation/filter tests fail trước implementation.
- [ ] Dashboard và event list đủ fixture states.
- [ ] Create wizard tạo draft trong session.
- [ ] Edit draft cập nhật overview.
- [ ] Valid submit chuyển pending review.
- [ ] Approved fixture publish được; Organizer không tự approve.

## Success Criteria

- [ ] Năm page render đúng từ props/workspace.
- [ ] Wizard không tạo half-complete entity khi thoát giữa chừng.
- [ ] Error liên kết field và focus lỗi đầu tiên.
- [ ] Admin feedback rõ, không nhầm “gửi duyệt” với “xuất bản”.
- [ ] Mỗi TSX giữ trách nhiệm hẹp, khoảng ≤200 LOC.

## Risk Assessment

Form lớn dễ thành monolith và lifecycle CTA dễ lệch reducer. Chia field groups, dùng chung validator/transition outcome, không duplicate rule trong page.

## Security Considerations

Review status chỉ là mock domain; UI không tuyên bố đã có quyền hoặc kiểm duyệt phía server.

## Next Steps

Phase 4 bổ sung vận hành bán vé, order và attendee cho từng event.
