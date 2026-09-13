# Thiết kế flow chợ resale Ticketly

## Mục tiêu

Mở rộng prototype attendee trong `ticket-platform-vite` thành flow chợ resale hoàn chỉnh từ khám phá listing đến kết quả thanh toán. Toàn bộ dữ liệu, giao dịch và VietQR đều là mock phía client; không thêm backend, persistence hoặc xử lý thanh toán thật.

## Quyết định đã duyệt

- Flow gồm bốn page: marketplace, listing detail, checkout và result.
- Checkout gộp thông tin người mua và thanh toán trong một page.
- Chỉ hỗ trợ VietQR minh họa.
- Giao dịch mock luôn thành công sau trạng thái xử lý ngắn.
- Thông tin người mua điền sẵn từ profile hiện tại, cho sửa nhưng không ghi ngược vào profile.
- Marketplace có tìm kiếm, bộ lọc và sắp xếp đầy đủ.
- Giá listing là giá trọn gói, không cộng thêm phí ở checkout.
- Tuyệt đối không thêm comment trong code TS, TSX hoặc CSS.

## Kiến trúc

Toàn bộ mã nghiệp vụ resale thuộc `src/features/resale`. `src/app/App.tsx` chỉ điều phối route, profile hiện tại và một order mock trong React memory. Không thêm Context Provider hoặc thư viện quản lý state.

Các route:

- `/resale`: marketplace.
- `/resale/:listingId`: chi tiết listing.
- `/resale/:listingId/checkout`: checkout.
- `/resale/:listingId/result`: kết quả.

Router phải match `checkout` và `result` trước detail. Mọi route resale đều giữ mục “Chợ resale” ở trạng thái active trên header.

## Page marketplace

Marketplace thay thế giao diện spotlight hiện tại bằng một trang mua vé resale hoàn chỉnh:

- Hero giải thích giá trị và tính chất minh họa của chợ resale.
- Tìm kiếm theo tên sự kiện, địa điểm hoặc người bán.
- Lọc theo ngày, khoảng giá, loại vé, thành phố và tình trạng chỗ ngồi.
- Sắp xếp theo phù hợp nhất, giá tăng, giá giảm và sự kiện gần nhất.
- Khoảng tám listing mock với dữ liệu đủ đa dạng để kiểm chứng các filter.
- Card hiển thị poster nội bộ, sự kiện, thời gian, địa điểm, thông tin ghế, người bán xác minh và giá trọn gói.
- CTA “Xem vé” mở trang listing detail.
- Empty state cho phép xóa toàn bộ điều kiện lọc.

Trên desktop, filter nằm ở sidebar và kết quả dùng grid hai cột. Trên mobile, filter là vùng thu gọn trong page và kết quả dùng một cột.

## Page listing detail

Trang chi tiết gồm:

- Breadcrumb quay lại marketplace.
- Hero sự kiện với ngày, giờ và địa điểm.
- Thông tin hạng vé, khu vực, hàng, ghế, số lượng và điều kiện sử dụng.
- Hồ sơ người bán gồm trạng thái xác minh, ngày tham gia và số giao dịch mock.
- Giải thích bảo vệ người mua và quy trình vô hiệu credential cũ, phát hành credential mới.
- Purchase summary sticky trên desktop, chuyển về document flow trên mobile.
- Giá trọn gói và CTA “Tiếp tục mua”.
- Not-found state khi listing ID không tồn tại.
- Unavailable state khi listing mock không còn có thể mua.

## Page checkout

Checkout dùng step indicator `Xem vé → Thanh toán → Hoàn tất` và gồm hai vùng chính.

Form người mua:

- Họ tên.
- Email.
- Số điện thoại.
- Dữ liệu ban đầu lấy từ profile đang giữ trong `App`.
- Cho phép sửa cục bộ trong checkout.
- Không cập nhật profile sau khi thanh toán.

Thanh toán VietQR:

- Hiển thị QR minh họa bằng CSS hoặc SVG nội bộ, không dùng QR thanh toán hoạt động thật.
- Hiển thị ngân hàng, tên tài khoản, số tiền và nội dung chuyển khoản mock.
- Nêu rõ không có giao dịch ngân hàng thực.
- Yêu cầu xác nhận đã đọc điều khoản.
- CTA “Tôi đã chuyển khoản”.

Purchase summary hiển thị listing, ghế và tổng tiền. Tổng tiền bằng đúng giá niêm yết, không có phí ẩn.

Khi submit, hệ thống validate form, focus field lỗi đầu tiên nếu có, khóa nút chống submit lặp và hiển thị trạng thái xử lý ngắn. Sau đó `App` tạo order mock và điều hướng đến result.

## Page result

Result chỉ có trạng thái thành công trong flow hợp lệ:

- Thông báo hoàn tất.
- Mã giao dịch và thời điểm mock.
- Thông tin vé vừa mua và credential mock mới.
- Timeline thanh toán xác nhận, vé cũ vô hiệu và vé mới phát hành.
- CTA chính đến “Vé của tôi”.
- CTA phụ quay lại marketplace.

Nếu người dùng mở result trực tiếp, refresh làm mất memory state hoặc order không khớp listing, page hiển thị trạng thái không tìm thấy giao dịch và CTA quay lại marketplace.

## Dữ liệu và state

`ResaleListing` dùng dữ liệu có cấu trúc thay vì chuỗi trình bày sẵn:

- ID và trạng thái khả dụng.
- Tên sự kiện, ngày giờ, địa điểm và thành phố.
- Loại vé, khu vực, hàng, ghế và số lượng.
- Giá dạng số.
- Thông tin người bán và trạng thái xác minh.
- Điều kiện sử dụng vé.
- Theme poster nội bộ.
- Trường hỗ trợ tìm kiếm, filter và sort.

Order mock gồm ID, listing ID, buyer, amount, transfer content, paid time và trạng thái `completed`. State chỉ tồn tại trong React memory và reset khi reload, đúng giới hạn prototype hiện tại.

## Cấu trúc feature dự kiến

```text
src/features/resale/
├── components/
│   ├── ResaleMarketplaceHero.tsx
│   ├── ResaleMarketplaceToolbar.tsx
│   ├── ResaleFilterPanel.tsx
│   ├── ResaleListingCard.tsx
│   ├── ResaleListingGrid.tsx
│   ├── ResaleListingHero.tsx
│   ├── ResaleTicketDetails.tsx
│   ├── ResaleSellerCard.tsx
│   ├── ResalePurchaseSummary.tsx
│   ├── ResaleBuyerForm.tsx
│   ├── ResaleVietQrPanel.tsx
│   ├── ResaleCheckoutSteps.tsx
│   └── ResaleOrderReceipt.tsx
├── helpers/
│   ├── filterResaleListings.ts
│   ├── formatResalePrice.ts
│   ├── getResaleListingById.ts
│   └── validateResaleBuyer.ts
├── hooks/
│   ├── useResaleMarketplace.ts
│   └── useResaleCheckout.ts
├── mock/resaleData.ts
├── pages/
│   ├── ResaleMarketplacePage.tsx
│   ├── ResaleListingPage.tsx
│   ├── ResaleCheckoutPage.tsx
│   └── ResaleResultPage.tsx
├── types/resale.ts
└── index.ts
```

Chỉ tách component khi có trách nhiệm rõ ràng; component quá nhỏ hoặc chỉ phục vụ một vùng đơn giản có thể nằm trong page. Mỗi code file hướng tới dưới 200 dòng.

## Accessibility và responsive

- Heading hierarchy và landmark rõ ràng.
- Search có label thực.
- Filter dùng `fieldset` và `legend` phù hợp.
- Input lỗi dùng `aria-invalid` và `aria-describedby`.
- Submit lỗi focus field không hợp lệ đầu tiên.
- Trạng thái xử lý dùng `aria-live`.
- Step hiện tại dùng `aria-current="step"`.
- Không truyền trạng thái chỉ bằng màu sắc.
- Control có vùng chạm tối thiểu xấp xỉ 44px.
- Tôn trọng `prefers-reduced-motion` hiện có.
- QR và layout không gây scroll ngang ở màn hình 320px.

## Quy tắc code

- Không thêm bất kỳ comment nào trong code mới hoặc phần code được sửa: không `//`, `/* */` hoặc JSX comment.
- Dùng tên component, function, type và biến tự mô tả để thay thế comment.
- Giữ cấu trúc feature hiện có và naming convention của dự án.
- Không thêm backend, persistence, dependency thanh toán hoặc dependency state management.
- Không tạo QR có thể bị hiểu là yêu cầu thanh toán thật.

## Kiểm thử và validation

Bổ sung test cho:

- Mapping bốn route resale.
- Trích xuất listing ID ở detail, checkout và result.
- Route cụ thể không bị match nhầm thành detail.
- Search, filter và sort listing.
- Lookup listing hợp lệ và không hợp lệ.
- Format giá trọn gói.
- Validate họ tên, email, số điện thoại và xác nhận điều khoản.
- Guard result khi không có order hợp lệ.
- Các page quan trọng nằm đúng feature.

Validation cuối:

```text
npm run test
npm run lint
npm run build
```

## Ngoài phạm vi

- Backend và API.
- Reservation thật hoặc khóa listing đồng thời.
- Thanh toán ngân hàng thật, webhook hoặc polling giao dịch.
- Persistence qua storage, cookie hoặc database.
- Chuyển quyền sở hữu thật.
- Cập nhật danh sách “Vé của tôi” sau giao dịch mock.
- Luồng người bán đăng resale listing.

## Tiêu chí hoàn thành

- Người dùng đi được trọn flow từ marketplace đến result thành công.
- Tất cả page responsive và dùng chung visual language hiện tại của Ticketly.
- Filter và form hoạt động hoàn toàn bằng mock state.
- Direct URL, listing không tồn tại và result thiếu order có fallback rõ ràng.
- Không có comment mới trong code.
- Test, lint và build đều thành công.
