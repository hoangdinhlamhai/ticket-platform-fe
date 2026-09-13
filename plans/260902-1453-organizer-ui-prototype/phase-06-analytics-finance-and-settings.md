---
phase: 6
title: Analytics finance and settings
status: completed
priority: P2
effort: 6-7h
dependencies:
  - 1
  - 2
  - 4
---

# Phase 6: Analytics finance and settings

## Context Links

- [Overview](./plan.md)
- [Organizer domain](./phase-02-organizer-domain-and-fixtures.md)
- [Operations](./phase-04-ticket-inventory-orders-and-attendees.md)
- [Check-in](./phase-05-check-in-console.md)

## Overview

Xây event analytics, organization finance và organization settings. Reporting derive hoàn toàn từ mock entities; settings cập nhật singular organization trong session.

## Requirements

- Analytics: gross revenue, paid orders, sold/capacity rate, check-in rate, ticket tier breakdown, sales time buckets.
- Finance: gross, refunds, net, payout by status và payout history; chỉ đọc.
- Settings: organization profile, public contact, address, payout summary và default policy fields.
- Không chart dependency; giá trị luôn có text/table equivalent.
- Không invent platform fee nếu fixture không có field rõ ràng.

## Architecture

Shared pure reporting helpers là source duy nhất cho dashboard/analytics/finance. Công thức khóa: `gross = paid orders`; `refunds = refunded totals`; `net = gross - refunds`. Settings dùng local draft → validator → `updateOrganization` action.

## Related Code Files

- Create: `src/features/organizer/pages/OrganizerAnalyticsPage.tsx`
- Create: `src/features/organizer/pages/OrganizerFinancePage.tsx`
- Create: `src/features/organizer/pages/OrganizerOrganizationSettingsPage.tsx`
- Create: `src/features/organizer/components/OrganizerAnalyticsSummary.tsx`
- Create: `src/features/organizer/components/OrganizerAccessibleBarChart.tsx`
- Create: `src/features/organizer/components/OrganizerTicketSalesBreakdown.tsx`
- Create: `src/features/organizer/components/OrganizerFinanceSummary.tsx`
- Create: `src/features/organizer/components/OrganizerPayoutTable.tsx`
- Create: `src/features/organizer/components/OrganizerOrganizationForm.tsx`
- Create: `src/features/organizer/helpers/build-organizer-analytics.ts`
- Create: `src/features/organizer/helpers/build-organizer-finance-summary.ts`
- Create: `src/features/organizer/helpers/organizer-reporting.test.ts`
- Create: `src/features/organizer/helpers/validate-organizer-organization.ts`
- Create: `src/features/organizer/helpers/validate-organizer-organization.test.ts`

## Implementation Steps

1. Viết exact-value tests cho gross/refund/net, tier breakdown, utilization, check-in rate và payout groups.
2. Viết zero-sales/zero-capacity/zero-attendee tests để tránh NaN/Infinity.
3. Implement event-scoped analytics helpers và organization-wide finance helper.
4. Implement metric blocks và CSS bar visualization có visible value labels + semantic list/table.
5. Implement payout history/read-only refund context, không action xử lý tiền.
6. Viết settings validation cho name, public email, phone và optional identifier.
7. Implement settings tabs/sections trong một page, không tách thêm routes.
8. Lưu settings trong session và update header/organization summary.

## Todo List

- [ ] Reporting tests fail trước implementation.
- [ ] Arithmetic convention nhất quán giữa pages.
- [ ] Zero cases render 0 đúng.
- [ ] Chart data đọc được không cần màu/hình.
- [ ] Settings update singular organization trong session.

## Success Criteria

- [ ] Analytics scoped đúng event; finance aggregate đúng organization.
- [ ] Tất cả metric fixture khớp test expected values.
- [ ] Không thêm chart/runtime dependency.
- [ ] Payout/refund UI không mutate money state.
- [ ] Settings validation/focus/error semantics đạt yêu cầu.

## Risk Assessment

Dashboard và finance dễ cho số khác nhau nếu tự tính tại page. Bắt buộc shared selector/helper và exact fixture tests.

## Security Considerations

Bank/tax data chỉ là masked fixture; không hiển thị số đầy đủ hay thu thập credential/payment data.

## Next Steps

Phase 7 wiring tất cả page, structural regression và browser validation.
