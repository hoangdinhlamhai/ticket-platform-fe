# Ticketly Resale Marketplace Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng flow chợ resale mock gồm marketplace, chi tiết listing, checkout VietQR và kết quả thành công.

**Architecture:** Giữ History API router hiện tại, mở rộng route union và đặt toàn bộ nghiệp vụ resale trong `src/features/resale`. `App` chỉ giữ một completed order trong React memory, truyền profile làm dữ liệu điền sẵn và điều phối navigation.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Node test runner, npm.

**Spec:** `docs/ticketly-resale-marketplace-flow-design.md`

## Global Constraints

- Không thêm backend, API, persistence, payment SDK, state-management library hoặc dependency mới.
- Giá listing là giá trọn gói; checkout không cộng thêm phí.
- Chỉ dùng VietQR minh họa không thể dùng để thanh toán thật.
- Checkout thành công sau trạng thái xử lý ngắn; result thiếu matching order phải hiện fallback.
- Buyer được điền sẵn từ profile, được sửa cục bộ và không cập nhật ngược profile.
- Giữ code theo feature, kebab-case cho file mới và hướng tới dưới 200 dòng mỗi code file.
- Tuyệt đối không thêm comment trong TS, TSX hoặc CSS: không `//`, `/* */` hoặc JSX comment.
- Target không có Git metadata; bỏ qua bước commit và tạo backup ngoài project trước khi sửa.

---

### Task 1: Baseline, Backup và Route Contracts

**Files:**
- Modify: `src/app/routing/attendee-route.ts`
- Modify: `src/app/routing/attendee-route.test.ts`

**Interfaces:**
- Produces: `AttendeeRoute` với `resale-listing`, `resale-checkout`, `resale-result`.
- Produces: `getAttendeeResaleListingId(pathname: string): string | null`.
- Produces: `isResaleRoute(route: AttendeeRoute): boolean`.

- [ ] **Step 1: Chạy baseline**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: ghi nhận chính xác exit code của từng lệnh trước khi sửa.

- [ ] **Step 2: Tạo backup ngoài project**

Sao chép các file sẽ sửa/xóa vào thư mục timestamp dưới `%TEMP%/ticketly-resale-backup/` và xác minh các bản sao đọc được.

- [ ] **Step 3: Viết route tests thất bại**

Thêm assertions:

```ts
assert.equal(getAttendeeRoute('/resale/resale-midnight-market'), 'resale-listing')
assert.equal(getAttendeeRoute('/resale/resale-midnight-market/checkout'), 'resale-checkout')
assert.equal(getAttendeeRoute('/resale/resale-midnight-market/result'), 'resale-result')
assert.equal(getAttendeeResaleListingId('/resale/resale-midnight-market/result'), 'resale-midnight-market')
assert.equal(isResaleRoute('resale-result'), true)
assert.equal(getAttendeeResaleListingId('/resale//checkout'), null)
```

Bao phủ trailing slash, extra segment, missing ID và giữ nguyên tests event/ticket hiện có.

- [ ] **Step 4: Chạy route test để xác nhận fail**

Run:

```text
node --experimental-strip-types --test src/app/routing/attendee-route.test.ts
```

Expected: FAIL vì route/helper mới chưa tồn tại.

- [ ] **Step 5: Implement matcher chính xác**

Match theo thứ tự checkout, result, detail, marketplace. Không để checkout/result bị nhận dạng thành listing ID.

- [ ] **Step 6: Chạy route test và toàn bộ test**

Run:

```text
node --experimental-strip-types --test src/app/routing/attendee-route.test.ts
npm run test
```

Expected: PASS.

---

### Task 2: Domain Types, Mock Listings và Pure Helpers

**Files:**
- Modify: `src/features/resale/types/resale.ts`
- Modify: `src/features/resale/mock/resaleData.ts`
- Modify: `package.json`
- Create: `src/features/resale/helpers/filter-resale-listings.ts`
- Create: `src/features/resale/helpers/format-resale-price.ts`
- Create: `src/features/resale/helpers/format-resale-date-time.ts`
- Create: `src/features/resale/helpers/get-resale-listing-by-id.ts`
- Create: `src/features/resale/helpers/validate-resale-checkout.ts`
- Create: `src/features/resale/helpers/get-matching-resale-order.ts`
- Create: `src/features/resale/helpers/resale-listing-domain.test.ts`
- Create: `src/features/resale/helpers/resale-checkout-domain.test.ts`

**Interfaces:**
- Produces: structured `ResaleListing`, marketplace filters, buyer, checkout draft, validation, completion và completed-order types.
- Produces: pure helpers dùng bởi hooks/pages sau.

- [ ] **Step 1: Viết listing-domain tests thất bại**

Kiểm tra:

```ts
assert.equal(MOCK_RESALE_LISTINGS.length, 8)
assert.equal(new Set(MOCK_RESALE_LISTINGS.map((listing) => listing.id)).size, 8)
assert.equal(formatResalePrice(1170000), '1.170.000đ')
assert.equal(getResaleListingById(MOCK_RESALE_LISTINGS, 'missing'), undefined)
```

Thêm tests cho query trim/case-insensitive, venue/city/seller, ngày, price bands, loại vé, thành phố, seating type, combined AND filters, ba kiểu sort, curated order và input immutability.

- [ ] **Step 2: Viết checkout-domain tests thất bại**

Kiểm tra thứ tự lỗi `fullName → email → phone → acceptedTerms`, email sai, số điện thoại sau khi bỏ ký tự định dạng, valid draft và matching-order guard.

- [ ] **Step 3: Thêm test files vào npm test script và xác nhận fail**

Run:

```text
npm run test
```

Expected: FAIL do contracts/helpers chưa hoàn tất.

- [ ] **Step 4: Implement types và đúng tám fixtures**

Fixture phải có nhiều thành phố, loại vé, ngày, mức giá, cả assigned/general admission và ít nhất một unavailable listing. Giá là number, thời gian là ISO string.

- [ ] **Step 5: Implement helpers tối thiểu**

Signatures:

```ts
filterResaleListings(listings, filters): ResaleListing[]
formatResalePrice(price): string
formatResaleDateTime(value): string
getResaleListingById(listings, listingId): ResaleListing | undefined
validateResaleCheckout(draft): ResaleCheckoutValidation
getMatchingResaleOrder(order, listingId): CompletedResaleOrder | null
```

Filter phải copy array trước sort và không mutate fixtures.

- [ ] **Step 6: Chạy domain tests và full test**

Run:

```text
npm run test
```

Expected: PASS; `package-lock.json` không đổi.

---

### Task 3: Marketplace Page

**Files:**
- Create: `src/features/resale/hooks/use-resale-marketplace.ts`
- Create: `src/features/resale/components/resale-marketplace-hero.tsx`
- Create: `src/features/resale/components/resale-marketplace-toolbar.tsx`
- Create: `src/features/resale/components/resale-filter-panel.tsx`
- Create: `src/features/resale/components/resale-listing-card.tsx`
- Create: `src/features/resale/components/resale-listing-grid.tsx`
- Modify: `src/features/resale/pages/ResaleMarketplacePage.tsx`

**Interfaces:**
- Consumes: `filterResaleListings`, mock listings và `AttendeePath` navigation.
- Produces: marketplace page với `onNavigate(path: AttendeePath)`.

- [ ] **Step 1: Implement marketplace hook từ pure helper**

Hook trả về filters, filtered listings, cities, ticket types, active-filter flag, generic `setFilter` và `resetFilters` dùng canonical defaults.

- [ ] **Step 2: Implement semantic filter and toolbar controls**

Search có label thật. Filter dùng fieldset/legend. Một control tree responsive duy nhất để tránh duplicate IDs. Sort gồm relevance, price ascending/descending và event date.

- [ ] **Step 3: Implement listing cards và grid**

Card hiển thị poster tone nội bộ, sự kiện, thời gian, địa điểm, loại/ghế, seller verified, availability và all-in price. CTA “Xem vé” dùng native anchor plus existing modified-click behavior.

- [ ] **Step 4: Compose marketplace page**

Desktop sidebar + grid hai cột; mobile filter thu gọn + một cột. Có result count và empty state reset.

- [ ] **Step 5: Chạy test, lint và build**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: PASS.

---

### Task 4: Listing Detail Page và Browse Integration

**Files:**
- Create: `src/features/resale/components/resale-listing-hero.tsx`
- Create: `src/features/resale/components/resale-ticket-details.tsx`
- Create: `src/features/resale/components/resale-seller-card.tsx`
- Create: `src/features/resale/components/resale-purchase-summary.tsx`
- Create: `src/features/resale/pages/resale-listing-page.tsx`
- Modify: `src/app/application-structure.test.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/app/layouts/AttendeeHeader.tsx`
- Modify: `src/features/resale/index.ts`
- Delete: `src/features/resale/components/ResaleSpotlight.tsx`

**Interfaces:**
- Produces: `ResaleListingPage({ listingId, onNavigate })`.
- Purchase summary supports detail/checkout variants without owning order state.

- [ ] **Step 1: Viết structure test thất bại**

Yêu cầu listing page tồn tại và retired spotlight không tồn tại.

- [ ] **Step 2: Chạy structure test để xác nhận fail**

Run:

```text
node --experimental-strip-types --test src/app/application-structure.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement detail states**

Known available listing: breadcrumb, hero, ticket details, seller card, buyer protection, sticky desktop summary và checkout CTA.

Unknown listing: not-found state. Unavailable listing: vẫn hiện thông tin nhưng không cung cấp checkout link.

- [ ] **Step 4: Wire marketplace/detail routes**

`App` truyền navigation vào marketplace/detail. Header dùng `isResaleRoute` để active trên nested routes. Index export đúng public pages/types.

- [ ] **Step 5: Xóa spotlight cũ**

Không giữ parallel implementation.

- [ ] **Step 6: Chạy validation**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: PASS.

---

### Task 5: Checkout Domain Hook và Accessible Form

**Files:**
- Create: `src/features/resale/hooks/use-resale-checkout.ts`
- Create: `src/features/resale/components/resale-checkout-steps.tsx`
- Create: `src/features/resale/components/resale-buyer-form.tsx`
- Create: `src/features/resale/components/resale-vietqr-panel.tsx`
- Create: `src/features/resale/pages/resale-checkout-page.tsx`

**Interfaces:**
- Consumes: `ResaleListing`, initial `ResaleBuyer`, `onComplete(completion)`.
- Produces: local checkout draft, validation, first-invalid focus result, duplicate-submit lock và completion callback.

- [ ] **Step 1: Implement checkout hook**

Clone initial buyer into local draft. Clear field error when edited. `submit()` returns first invalid field synchronously; valid submit sets processing, trims buyer fields and calls completion after about 800ms. Cleanup timeout on unmount.

- [ ] **Step 2: Implement accessible buyer form**

Inputs có label, stable error IDs, `aria-invalid`, `aria-describedby`. Page owns refs and focuses first invalid field.

- [ ] **Step 3: Implement VietQR mock panel**

Dùng non-scannable CSS/SVG illustration, placeholder account data, transfer content, exact listing amount và visible warning “MINH HỌA — KHÔNG CHUYỂN TIỀN”. Không network request.

- [ ] **Step 4: Implement checkout page guards**

Outer page lookup listing và guard missing/unavailable trước khi render inner hook component. Checkout key theo listing ID để đổi listing tạo draft mới.

- [ ] **Step 5: Run validation**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: PASS.

---

### Task 6: Completed Order, Result Page và Transaction Integration

**Files:**
- Create: `src/features/resale/components/resale-order-receipt.tsx`
- Create: `src/features/resale/pages/resale-result-page.tsx`
- Modify: `src/app/application-structure.test.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/features/resale/index.ts`

**Interfaces:**
- Produces: `ResaleResultPage({ listingId, order, onNavigate })`.
- `App` owns `CompletedResaleOrder | null` and creates matching order from completion payload.

- [ ] **Step 1: Viết structure test thất bại cho checkout/result pages**

Run structure test và xác nhận fail trước khi integration hoàn tất.

- [ ] **Step 2: Add order state and completion callback in App**

Tạo ID, ISO paid time, credential code, `status: 'completed'`, lưu một order và navigate đến result. Buyer phải là object mới. Không sửa profile hoặc owned-ticket fixtures.

- [ ] **Step 3: Implement result guard và receipt**

Matching order hiển thị success, transaction ID/time, new credential, timeline và CTA `/tickets` + `/resale`. Missing/mismatched order chỉ hiển thị fallback.

- [ ] **Step 4: Wire all four routes and exports**

Bảo đảm checkout/result dùng extracted listing ID và header vẫn active.

- [ ] **Step 5: Run validation**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: PASS.

---

### Task 7: Accessibility, No-Comment Audit và Browser Validation

**Files:**
- Modify: `src/index.css`
- Review: all modified/new TS, TSX and CSS files.

**Interfaces:**
- No new business interfaces.

- [ ] **Step 1: Extend global form focus/font coverage**

Thêm `select` và `textarea` vào selector font/focus-visible hiện có nếu các element đó được sử dụng.

- [ ] **Step 2: Run prohibited-source scans**

Xác minh resale source không chứa storage, fetch, payment SDK/state library imports hoặc comment tokens mới. Phân biệt URL text với comment syntax khi audit.

- [ ] **Step 3: Run complete automated validation**

Run:

```text
npm run test
npm run lint
npm run build
```

Expected: tất cả exit zero.

- [ ] **Step 4: Run manual browser matrix**

Ở 1440px, 768px và 320px kiểm tra search/filter/sort, empty reset, known/unknown/unavailable detail, form errors/focus, keyboard flow, submit lock, navigation-away cleanup, profile không đổi, valid result, direct/reloaded/mismatched result fallback, back/forward, modified clicks, active header, no horizontal overflow, desktop-only sticky summary, reduced motion và exact all-in amount.

- [ ] **Step 5: Final spec check**

Đối chiếu từng yêu cầu trong `docs/ticketly-resale-marketplace-flow-design.md`; không claim hoàn thành nếu còn validation fail.
