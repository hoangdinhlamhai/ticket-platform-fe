# Thiết kế Admin P0 Ticketly

**Ngày:** 2026-09-05  
**Trạng thái:** Đã duyệt để triển khai  
**Mục tiêu:** Hoàn thiện prototype UI Admin bằng fixture và React state trước khi thiết kế database/backend.

## 1. Bối cảnh đã xác minh

- Ticketly hiện là React 19 + TypeScript + Vite + Tailwind CSS 4.
- Attendee và Organizer dùng History API router tự quản lý, mock data và React state trong phiên.
- Organizer đã có vòng đời sự kiện `draft → pending_review → approved/changes_requested/rejected` nhưng không thể tự duyệt.
- Chưa có backend, API, authentication, database, persistence hoặc payment/check-in thật.
- Organizer và Attendee fixtures đang tách riêng có chủ đích; Admin P0 cũng dùng workspace fixture riêng.

## 2. Quyết định sản phẩm

- Admin là role quản trị toàn nền tảng, không phải thành viên của một Organizer.
- P0 có đúng một role Admin; chưa triển khai RBAC hoặc quản lý nhân sự nội bộ.
- Điều hướng theo module nghiệp vụ; Dashboard dùng hàng đợi công việc ưu tiên.
- Admin xử lý qua workflow có kiểm soát, không sửa trực tiếp order, số tiền, payment hoặc credential.
- Duyệt sự kiện không bắt buộc lý do; yêu cầu chỉnh sửa và từ chối bắt buộc lý do.
- Hạn chế tài khoản, ẩn listing, giữ payout và quyết định bất lợi khác bắt buộc lý do.
- Báo cáo dùng một hàng đợi vụ việc chung cho nhiều loại đối tượng.
- Có workflow xác minh Organizer.
- Các workflow cốt lõi cập nhật trạng thái trong React session và sinh audit entry.
- Reload reset mọi thay đổi; mọi trang phải ghi rõ đây là dữ liệu mô phỏng.

## 3. Ngoài phạm vi

- Backend, API, database, authentication hoặc authorization thật.
- `localStorage`, `sessionStorage`, cookie, IndexedDB hoặc đồng bộ realtime.
- Chuyển tiền, refund, payout hoặc thay đổi số tiền thật.
- QR scan, chống gian lận tự động hoặc risk scoring thật.
- Upload/kiểm tra giấy tờ thật.
- RBAC, phân công case cho nhiều Admin hoặc SLA engine.
- Hard delete và sửa trực tiếp dữ liệu giao dịch.
- Đồng bộ React state giữa Admin, Organizer và Attendee.

## 4. Kiến trúc ứng dụng

Admin là application boundary thứ ba:

```text
App
├── Attendee UI             /
├── OrganizerApplication    /organizer/*
└── AdminApplication        /admin/*
```

`App.tsx` tạo một `useAdminWorkspace()` duy nhất cho vòng đời phiên và ưu tiên nhận diện `/admin/*` trước attendee fallback. Admin gồm:

```text
AdminApplication
├── admin-route parser
├── AdminLayout
│   ├── AdminHeader
│   ├── AdminSidebar
│   ├── AdminMobileNavigation
│   └── aria-live notice
├── feature pages/components
└── AdminWorkspace controller → pure reducer → fixture state
```

Không mở rộng `OrganizerWorkspace` thành platform store ở P0. Việc hợp nhất entity giữa các role thuộc phase backend/database sau này.

## 5. Information architecture và route

| Route | Bề mặt |
|---|---|
| `/admin` | Dashboard và hàng đợi |
| `/admin/events/review` | Danh sách sự kiện cần kiểm duyệt |
| `/admin/events/:eventId/review` | Chi tiết xét duyệt sự kiện |
| `/admin/cases` | Danh sách báo cáo/vụ việc |
| `/admin/cases/:caseId` | Chi tiết vụ việc |
| `/admin/organizers` | Danh sách Organizer + detail drawer |
| `/admin/users` | Danh sách attendee + detail drawer |
| `/admin/orders` | Danh sách order/payment + detail drawer |
| `/admin/tickets` | Danh sách ticket/check-in + detail drawer |
| `/admin/resale` | Danh sách resale listing + detail drawer |
| `/admin/refunds` | Danh sách refund + detail drawer |
| `/admin/payouts` | Danh sách payout + detail drawer |
| `/admin/settings` | Danh mục và cấu hình vận hành tối thiểu |
| `/admin/audit-logs` | Nhật ký hành động Admin |

Unknown `/admin/*` phải hiển thị Admin not-found, không rơi về attendee home.

### Sidebar

```text
TỔNG QUAN
└── Tổng quan

KIỂM DUYỆT
├── Duyệt sự kiện
└── Báo cáo & vụ việc

TÀI KHOẢN
├── Organizer
└── Người tham dự

VẬN HÀNH
├── Giao dịch
├── Vé & check-in
└── Resale marketplace

TÀI CHÍNH
├── Refund
└── Payout

HỆ THỐNG
├── Danh mục & cấu hình
└── Nhật ký quản trị
```

## 6. Dashboard

Dashboard ưu tiên hành động, không phải BI trang trí.

### KPI có thể điều hướng

- Sự kiện chờ duyệt.
- Vụ việc đang mở.
- Organizer chờ xác minh.
- Giao dịch thành công hôm nay.
- GMV tháng.
- Payout đang giữ.

### Hàng đợi cần xử lý

Work item được suy ra bằng selector, không lưu counter hoặc queue trùng lặp. Mỗi item có loại, target, priority, createdAt, trạng thái, thời gian chờ và CTA mở module tương ứng.

Thứ tự: `critical → high → medium → low`, sau đó item chờ lâu hơn đứng trước.

### Cảnh báo vận hành

Fixture mô phỏng refund tăng, listing bị báo cáo, credential bất thường, payout có case mở và event sắp diễn ra chưa duyệt. Đây chỉ là giải thích rủi ro, không phải fraud engine.

### Biểu đồ tối thiểu

- Line chart 30 ngày cho giá trị giao dịch thành công, primary và resale là hai series cố định.
- Bar chart cho khối lượng nghiệp vụ theo loại.
- Không dual-axis, không donut trang trí, có legend và bảng dữ liệu thay thế.

## 7. Domain model P0

### Event review

- Event moderation status: `pending_review | approved | changes_requested | rejected`.
- Review record giữ submission number, submittedAt, reviewedAt, decision, reason và checklist.
- UI hiển thị Organizer, thời gian/địa điểm, chính sách, ticket tiers, risk flags và lịch sử review.

### Organizer

- Verification status: `not_submitted | pending | changes_requested | verified | rejected`.
- Account status: `active | restricted | suspended`.
- Verification và account restriction là hai chiều trạng thái độc lập.
- Hồ sơ có giấy tờ demo, sự kiện, doanh số, refund rate, payout và case liên quan.

### User

- Account status: `active | restricted | suspended`.
- Detail drawer hiển thị profile, order, ticket, resale và case liên quan.
- P0 chỉ hỗ trợ restrict/restore qua workflow, không sửa hồ sơ người dùng.

### Unified case

- Subject type: `event | organizer | user | order | ticket | resale | refund | payout`.
- Severity: `low | medium | high | critical`.
- Status: `open | investigating | waiting_for_information | resolved | dismissed`.
- Case có reporter, category, summary, evidence demo, timeline và subject link.

### Commerce records

- Order/payment chỉ đọc.
- Ticket/check-in chỉ đọc; revoke không thuộc P0 trừ khi được biểu diễn như kết quả case fixture.
- Resale moderation: `visible | hidden`; hide bắt buộc reason, restore không bắt buộc.
- Refund status: `requested | under_review | approved | rejected | completed`.
- Payout status: `scheduled | pending | on_hold | released | paid`.
- Amount luôn readonly; workflow chỉ đổi trạng thái.

### Audit

Mỗi sensitive action thành công append đúng một audit entry:

```text
id, actorLabel, action, targetType, targetId,
reason, occurredAt, metadata summary
```

Invalid action không đổi entity và không sinh audit.

## 8. Workflow

### Duyệt sự kiện

- `pending_review → approved`: reason tùy chọn.
- `pending_review → changes_requested`: reason bắt buộc.
- `pending_review → rejected`: reason bắt buộc và có confirm mạnh.
- Admin không sửa nội dung và không xuất bản thay Organizer.

### Xác minh/hạn chế Organizer

- `pending → verified`: note tùy chọn.
- `pending → changes_requested/rejected`: reason bắt buộc.
- `active → restricted/suspended`: reason bắt buộc.
- Restore account ghi audit nhưng reason tùy chọn.

### User và resale

- User restrict/suspend bắt buộc reason; restore reason tùy chọn.
- Listing `visible → hidden` bắt buộc reason; `hidden → visible` reason tùy chọn.

### Case

- Open case có thể chuyển sang investigating hoặc waiting.
- Resolve/dismiss cần resolution note.
- Các action hạn chế target được thực hiện qua dialog riêng và ghi audit độc lập.

### Finance

- Refund approve không sửa amount; reject bắt buộc reason.
- Payout `scheduled/pending/released → on_hold` bắt buộc reason.
- Payout `on_hold → released` reason tùy chọn.
- Không có CTA “đã chuyển tiền” hoặc API thanh toán.

## 9. UI patterns

- Desktop list dùng table; mobile dùng responsive record cards.
- Event review và case có detail route; entity còn lại dùng accessible drawer.
- Drawer có `role="dialog"`, focus ban đầu, Escape, Tab trap và focus return.
- Filter gồm search, status và domain-specific fields; filter không có kết quả dùng empty state.
- Sensitive action dùng shared decision dialog với title, impact copy, reason validation và confirmation.
- Status luôn có text/icon; không dùng màu làm tín hiệu duy nhất.
- User-facing copy dùng tiếng Việt.
- Không có optimistic network state giả; processing chỉ mô phỏng reducer action trong session.

## 10. Error, empty và not-found states

- ID không tồn tại trên event/case detail hiển thị dedicated not-found.
- Invalid transition giữ nguyên state và phát notice dễ hiểu.
- Reason chỉ chứa whitespace được xem là thiếu.
- Empty queue, empty search và no-alert state có nội dung riêng.
- Unknown route hiển thị Admin not-found với CTA về Dashboard.
- Reload reset state và prototype notice giải thích rõ.

## 11. Accessibility và responsive

- Skip link và `main#main-content` có `tabIndex={-1}`.
- Sau client navigation, focus chuyển vào main content.
- Desktop sidebar; mobile drawer/navigation có aria label và focus management.
- Touch target tối thiểu khoảng 44px.
- Table nằm trong vùng scroll riêng; body không scroll ngang ở 320px.
- Form có label, `aria-invalid`, error association và focus lỗi đầu tiên.
- Notice/action result dùng `aria-live`.
- Biểu đồ có legend, tooltip/focus state và bảng dữ liệu thay thế.
- Tôn trọng `prefers-reduced-motion` hiện có.

## 12. Kiểm thử

- Route parser: tất cả route, trailing slash, query/hash, malformed/encoded ID và unknown Admin path.
- Transition helpers: reason rule và legal/illegal transitions.
- Reducer: atomic entity + audit update, invalid action giữ nguyên state, fixture isolation.
- Work queue selectors: count, priority order và cập nhật sau transition.
- Filter helpers cho event/case/entity lists.
- Structural guard: Admin không dùng persistence/network APIs và không làm attendee/organizer route regression.
- Manual: direct load 14 URL, Back/Forward, drawer keyboard, 320px, event review, organizer verification, case, listing hide, refund decision, payout hold và reload reset.
- Validation cuối: `npm test`, `npm run lint`, `npm run build`.

## 13. Các khái niệm database được UI làm rõ

UI tạo đầu vào cho schema sau này:

- `users`, `organizations`, `organization_verifications`, `verification_documents`.
- `events`, `event_versions`, `event_review_submissions`, `event_review_decisions`.
- `orders`, `payments`, `tickets`, `ticket_ownership_history`, `check_ins`.
- `resale_listings`, `resale_transactions`, `listing_moderation_actions`.
- `refund_requests`, `payouts`, `payout_holds`.
- `cases`, `case_subjects`, `case_evidence`, `case_activities`.
- `account_restrictions`, `admin_audit_logs`, `platform_settings`, `event_categories`.

Các bảng trên là discovery output, chưa phải database design cuối cùng. Schema thật chỉ được chốt sau khi kiểm tra UI và lifecycle.

## 14. Tiêu chí hoàn thành

- Tất cả 14 Admin surfaces render trực tiếp và không rơi về attendee.
- Core workflows validate reason, đổi trạng thái session và ghi audit đúng quy tắc.
- Dashboard số liệu được derive từ canonical fixtures.
- Không có persistence, network call, payment action hoặc hard delete.
- UI dùng được bằng keyboard và không overflow ở 320px.
- Existing attendee/organizer behavior không bị phá vỡ.
- Test, lint và build pass.

## Câu hỏi chưa giải quyết

Không có câu hỏi chặn triển khai. Việc đồng bộ dữ liệu thật giữa ba role và RBAC được hoãn rõ ràng sang phase backend/database.
