---
phase: 1
title: Routing and shell
status: completed
priority: P1
effort: 5-6h
dependencies: []
---

# Phase 1: Routing and shell

## Context Links

- [Overview](./plan.md)
- Existing attendee router: `src/app/routing/attendee-route.ts`
- Existing layouts: `src/app/layouts/AttendeeLayout.tsx`, `AttendeeHeader.tsx`

## Overview

Tạo route parser và layout riêng cho Organizer, giữ nguyên History API hiện tại. Organizer prefix phải được nhận diện trước attendee fallback.

## Requirements

- Hỗ trợ 12 route đã chốt và Organizer not-found.
- `/organizer/events/new` phải ưu tiên hơn dynamic `:eventId`.
- Link dùng `href` thật, giữ Ctrl/Cmd-click, Back/Forward, scroll reset và focus `#main-content`.
- Desktop sidebar; mobile drawer có focus trap, Escape và focus return.

## Architecture

`pathname -> getOrganizerRoute() -> route key + eventId -> OrganizerApplication`. Không thêm router dependency và không trộn `OrganizerRoute` vào `AttendeeRoute`. Tách helper click navigation dùng chung nhưng re-export để không phá import hiện tại.

## Related Code Files

- Create: `src/app/routing/client-navigation.ts`
- Create: `src/app/routing/organizer-route.ts`
- Create: `src/app/routing/organizer-route.test.ts`
- Create: `src/app/layouts/OrganizerLayout.tsx`
- Create: `src/app/layouts/OrganizerHeader.tsx`
- Create: `src/app/layouts/OrganizerSidebar.tsx`
- Create: `src/app/layouts/OrganizerMobileNavigation.tsx`
- Create: `src/features/organizer/components/OrganizerPageHeader.tsx`
- Create: `src/features/organizer/components/OrganizerStatusBadge.tsx`
- Create: `src/features/organizer/components/OrganizerEmptyState.tsx`
- Create: `src/features/organizer/components/OrganizerEventNavigation.tsx`
- Modify: `src/app/routing/attendee-route.ts`

## Implementation Steps

1. Viết test cho mọi route, trailing slash, static precedence, ID extraction và unknown route.
2. Tạo `OrganizerRoute`, `OrganizerPath`, normalize/extractor helpers.
3. Tách client-navigation predicate và giữ compatibility re-export cho attendee.
4. Tạo shell với skip link, main landmark, live notice và prototype warning.
5. Tạo sidebar nhóm Tổng quan/Sự kiện/Tài chính/Cài đặt và event workspace navigation.
6. Tạo mobile navigation dựa trên keyboard contract của `EventFilterDrawer`.
7. Kiểm tra layout 320px, 768px và desktop bằng code/browser inspection.

## Todo List

- [ ] Route tests fail trước implementation.
- [ ] Parser và extraction tests pass.
- [ ] Desktop/mobile navigation hoàn chỉnh.
- [ ] Unknown Organizer route có dedicated state.
- [ ] Attendee imports không bị phá.

## Success Criteria

- [ ] Tất cả Organizer URL được phân loại chính xác.
- [ ] Unknown `/organizer/*` không rơi về attendee home.
- [ ] Navigation hỗ trợ keyboard và modified click.
- [ ] Không horizontal overflow ở 320px.

## Risk Assessment

Rủi ro lớn nhất: attendee fallback che mất Organizer URL và mobile drawer lỗi focus. Giảm thiểu bằng prefix-first dispatch, route tests và tái sử dụng contract drawer đã có.

## Security Considerations

Organizer route chỉ là UI prototype, không được trình bày như auth/authorization boundary.

## Next Steps

Phase 3-7 dùng route/shell này; Phase 7 mới tích hợp vào `App.tsx`.
