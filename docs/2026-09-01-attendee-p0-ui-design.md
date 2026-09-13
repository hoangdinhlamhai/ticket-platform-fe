# Thiết kế P0 Attendee Ticketly

## Mục tiêu

Hoàn thiện prototype UI attendee bằng các luồng mua vé chính thức, đơn hàng, e-ticket credential và người bán resale. Toàn bộ dữ liệu chỉ tồn tại trong React memory; không thêm login, backend, persistence, thanh toán hoặc QR hoạt động thật.

## Quyết định sản phẩm

- Không yêu cầu đăng nhập; dùng hồ sơ mock hiện tại.
- Primary checkout cho phép chọn kết quả demo: thành công, thất bại hoặc hết hạn.
- Primary không có phí dịch vụ: tổng tiền bằng giá vé nhân số lượng.
- Order history gộp primary và resale, có filter theo nguồn và trạng thái.
- Primary và resale thành công đều phát hành vé mới vào “Vé của tôi”.
- Listing attendee tạo xuất hiện ngay trong marketplace và có thể được chính hồ sơ mock mua.
- QR thanh toán và QR vé đều là hình minh họa có cảnh báo không có giá trị thật.

## Kiến trúc state

`App.tsx` giữ state phiên thống nhất:

- `orders`: order fixture và order được tạo trong phiên.
- `ownedTickets`: ticket fixture và ticket được phát hành trong phiên.
- `resaleListings`: listing fixture và listing attendee đăng trong phiên.
- `primaryCheckoutSelection`: event, ticket tier và số lượng đang checkout.

Domain helpers thuần chịu trách nhiệm tạo order, phát hành ticket, tạo listing và cập nhật trạng thái listing/ticket. `App.tsx` chỉ điều phối state, route và callback. Không thêm Context, reducer store hoặc dependency quản lý state.

## Mô hình dữ liệu

`AttendeeOrder` dùng chung cho primary và resale, gồm ID, nguồn, trạng thái, event, buyer, line items, subtotal/total, thời gian, ticket IDs được phát hành và resale listing ID tùy chọn.

Trạng thái order:

- `completed`
- `failed`
- `expired`

`OwnedTicket` được mở rộng với nguồn, order ID, credential code/status và trạng thái resale. Mỗi vé primary trong một order nhiều vé có ID và credential riêng.

`ResaleListing` động có source ticket ID, owner marker và trạng thái `active`, `sold` hoặc `withdrawn`. Marketplace chỉ hiển thị listing active.

## Route và page

### Primary checkout

- `/events/:eventId/checkout`
- `/events/:eventId/checkout/result`

`PrimaryCheckoutPage` gộp buyer form, purchase summary, VietQR demo và bộ chọn kết quả. `PrimaryOrderResultPage` hiển thị success/failure/expired theo order vừa tạo.

### Orders

- `/orders`
- `/orders/:orderId`

`OrderHistoryPage` hiển thị primary và resale, filter nguồn và trạng thái. `OrderDetailPage` hiển thị giao dịch, buyer, line items, timeline và liên kết ticket nếu thành công.

### Seller resale

- `/resale/sell/:ticketId`
- `/resale/my-listings`

`CreateResaleListingPage` cho nhập giá, xem số tiền nhận mock, xác nhận điều kiện và preview. `MyResaleListingsPage` hiển thị active/sold/withdrawn và cho rút listing active.

## Primary purchase flow

Event detail chuyển lựa chọn hạng vé/số lượng sang checkout. Checkout điền sẵn buyer từ profile. Submit tạo order theo demo outcome:

- Thành công: tạo order completed, phát hành đúng số ticket, điều hướng result.
- Thất bại: tạo order failed, không phát hành ticket, cho thử lại.
- Hết hạn: tạo order expired, không phát hành ticket, quay lại event detail.

Submit bị khóa trong lúc xử lý và callback chống phát hành trùng.

## Order và e-ticket

Order fixture giúp UI có dữ liệu ngay khi mở. Order mới được thêm đầu danh sách. Vé phát hành thành công xuất hiện ngay trong `/tickets`.

`TicketStatusPage` mở rộng để hiển thị credential demo:

- QR hình học nội bộ, không encode payload thực.
- Watermark “VÉ DEMO · KHÔNG CÓ GIÁ TRỊ CHECK-IN”.
- Credential code, holder và trạng thái.
- Dialog phóng to QR demo.

## Seller resale flow

Ticket đủ điều kiện có CTA đăng bán. Submit tạo listing active, thêm vào marketplace và đánh dấu ticket nguồn đang đăng bán. Rút listing chuyển listing sang withdrawn và trả ticket về eligible.

Khi checkout resale thành công:

- Order resale completed được thêm vào history.
- Listing chuyển sold.
- Credential ticket nguồn chuyển revoked.
- Ticket buyer mới được phát hành và thêm vào “Vé của tôi”.

Prototype cho phép chính hồ sơ mock mua listing của họ để demo end-to-end; UI chỉ gắn nhãn “Listing của bạn”.

## Fallback và trạng thái lỗi

- Checkout không có selection hợp lệ quay về event detail.
- Event, order, ticket hoặc listing không tồn tại có dedicated not-found state.
- Result chỉ hiển thị nếu order khớp event/listing.
- Ticket listed/sold không thể tạo listing thứ hai.
- Listing sold/withdrawn không thể checkout.
- Filter không có kết quả hiển thị empty state.
- Refresh reset state động và UI tiếp tục ghi rõ dữ liệu demo.

## Accessibility và responsive

- Heading và landmark rõ ràng.
- Form có label, `aria-invalid`, error association và focus lỗi đầu tiên.
- Processing/result dùng `aria-live`.
- Dialog QR có focus management, Escape và nút đóng.
- Filter dùng fieldset/legend hoặc tab semantics phù hợp.
- Vùng chạm tối thiểu khoảng 44px.
- Layout không scroll ngang ở 320px.
- Tôn trọng reduced motion hiện có.

## Kiểm thử

- Route parsing cho toàn bộ route mới.
- Tạo primary order ở ba trạng thái.
- Chỉ completed order phát hành ticket.
- Mua nhiều vé tạo đúng số credential.
- Primary/resale cùng xuất hiện và filter đúng trong order history.
- Tạo/rút listing cập nhật marketplace.
- Resale completed vô hiệu ticket nguồn và phát hành ticket buyer.
- Guard chống order, ticket và listing lặp.
- Not-found/unavailable helpers.
- Structural naming test cho page/component mới.
- Chạy `npm test`, `npm run lint`, `npm run build`.

## Phân kỳ

1. Domain model, fixture, helper và route.
2. Primary checkout/result.
3. Order history/detail và e-ticket credential.
4. Seller resale create/manage và liên kết buyer flow.
5. Responsive, accessibility, fallback và validation cuối.

## Ngoài phạm vi

- Auth/login application flow.
- Backend, API, database hoặc browser storage.
- Reservation hoặc tồn kho đồng thời.
- Payment polling/webhook.
- QR có thể scan hoặc check-in thật.
- Edit listing, refund, transfer hoặc tặng vé.
