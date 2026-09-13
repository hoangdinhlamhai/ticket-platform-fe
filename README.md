# Ticketly

Prototype giao diện cho đồ án **Event Ticketing Platform**. Phiên bản hiện tại mô phỏng trải nghiệm Attendee, không gian vận hành Organizer và workspace Admin bằng dữ liệu tĩnh cùng React state trong phiên.

## Khởi chạy

```bash
npm install
npm run dev
```

Kiểm tra chất lượng mã:

```bash
npm run lint
npm run build
```

## Phạm vi prototype hiện tại

- Giao diện React + TypeScript + Vite, dùng Tailwind CSS v4.
- Các trang Attendee dùng History API phía client: `/`, `/saved-events`, `/events/:eventId`, primary checkout/result, `/orders`, `/tickets`, resale buyer/seller flow và `/profile`.
- Không gian Organizer có 12 page P0: `/organizer`, `/organizer/events`, `/organizer/events/new`, `/organizer/events/:eventId`, cùng các trang con `/edit`, `/tickets`, `/orders`, `/attendees`, `/check-in`, `/analytics`, plus `/organizer/finance` và `/organizer/settings`.
- Workspace Admin có 14 surface P0: `/admin`, `/admin/events/review`, `/admin/events/:eventId/review`, `/admin/cases`, `/admin/cases/:caseId`, `/admin/organizers`, `/admin/users`, `/admin/orders`, `/admin/tickets`, `/admin/resale`, `/admin/refunds`, `/admin/payouts`, `/admin/settings` và `/admin/audit-logs`.
- Admin mô phỏng dashboard vận hành, duyệt/yêu cầu chỉnh sửa/từ chối sự kiện, xác minh hoặc hạn chế Organizer, hạn chế người dùng, ẩn listing resale, xử lý case hợp nhất và theo dõi refund/payout. Thao tác nhạy cảm bắt buộc lý do theo đúng workflow và mỗi thay đổi hợp lệ thêm một audit entry append-only.
- Các trang order, ticket, refund và payout giữ số tiền, payment, credential và dữ liệu giao dịch ở chế độ chỉ đọc. Duyệt refund hoặc giữ/mở giữ payout chỉ đổi trạng thái trong fixture, không hoàn tiền, chuyển tiền hay gọi cổng thanh toán thật.
- Organizer mô phỏng tạo/chỉnh sửa sự kiện, gửi Admin duyệt, xuất bản fixture đã duyệt, quản lý hạng vé/tồn kho, xem order/attendee, tra cứu check-in thủ công, analytics, đối soát và hồ sơ tổ chức.
- Trang chi tiết sự kiện cho phép chọn hạng vé, số lượng 1–4 và đi tiếp tới checkout mock. Checkout cho chọn kết quả thành công, thất bại hoặc hết hạn; chỉ thành công phát hành e-ticket demo.
- Đơn hàng primary và resale được hiển thị chung, có filter nguồn/trạng thái và liên kết tới credential demo nếu thành công.
- Chợ resale có cả buyer flow và seller flow mock: attendee có thể đăng vé sở hữu lên marketplace, quản lý/rút listing, mua listing của chính hồ sơ demo và nhận credential mới sau giao dịch.
- Trang e-ticket hiển thị QR hình học có watermark `VÉ DEMO · KHÔNG CÓ GIÁ TRỊ CHECK-IN`; QR không encode dữ liệu có thể scan.
- Dữ liệu event, hồ sơ và fixture ban đầu là mock data tĩnh; order, vé phát hành và listing attendee tạo được bổ sung động trong React memory của phiên.
- Trang hồ sơ hiển thị tên gọi, email, số điện thoại và ngày sinh (tuỳ chọn), người dùng có thể cập nhật các trường này trong phiên làm việc; lưu thành công sẽ cập nhật tên và chữ cái đầu của tên trên header ngay trong session hiện tại.
- Trang hồ sơ cũng cho biết số lượng vé sở hữu và hiển thị tối đa 2 vé sở hữu gần nhất kèm CTA đến `/tickets`.
- Tìm kiếm, lọc danh mục và thao tác lưu ở trang khám phá chỉ dùng React state trong bộ nhớ; trang `/saved-events` dùng ba sự kiện mock cố định và chưa đồng bộ với thao tác này. Hồ sơ, order, ticket phát hành, listing seller và toàn bộ workspace Organizer cũng chỉ tồn tại trong phiên; tải lại trang sẽ reset.
- Fixture Organizer, workspace Admin và catalog Attendee được tách riêng có chủ đích ở giai đoạn UI, nên thay đổi trong một boundary chưa tự đồng bộ sang boundary khác. Toàn bộ state Admin chỉ tồn tại trong React memory của phiên và tải lại trang sẽ nạp lại fixture ban đầu.
- Check-in Organizer là tra cứu credential thủ công để mô phỏng trạng thái hợp lệ, đã check-in, bị thu hồi, sai sự kiện hoặc không tìm thấy; không truy cập camera và không giải mã QR.
- Không dùng tài nguyên ảnh bên ngoài cho các poster sự kiện.

## Chưa triển khai

Đây chưa phải là hệ thống giao dịch thật. Prototype **không** có:

- backend, API, xác thực, OAuth hoặc gửi thông tin đăng nhập;
- `localStorage`, `sessionStorage`, cookie, database hay bất kỳ persistence nào;
- reservation, order hoặc payment thật, webhook hay xử lý đồng thời;
- QR check-in thật, xác thực danh tính và chống check-in trùng bằng transaction/khóa đồng thời ở phía server; prototype chỉ chặn lặp trong React session;
- ownership transfer và resale transaction thật;
- refund, payout, payment hoặc chuyển tiền thật từ các CTA Admin;
- kết nối backend, phân quyền hay đồng bộ dữ liệu giữa Attendee, Organizer và Admin.

Các CTA trong giao diện chỉ tạo phản hồi hoặc state minh họa tại client. Flow resale tạo order, VietQR và credential giả trong React memory; không gửi yêu cầu mạng, không nhận tiền và reset khi tải lại trang. Khi triển khai backend, các luồng Ticket → Reservation → Order → Payment → E-ticket → QR Check-in và resale phải được xử lý bằng transaction, kiểm soát tồn vé và kiểm soát quyền sở hữu ở phía máy chủ.
