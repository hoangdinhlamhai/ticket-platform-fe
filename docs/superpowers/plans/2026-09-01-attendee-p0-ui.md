# Ticketly Attendee P0 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện prototype attendee với primary checkout ba kết quả demo, order history/detail thống nhất, e-ticket QR demo và seller resale flow dùng React memory.

**Architecture:** `App.tsx` giữ state phiên thống nhất cho orders, owned tickets, resale listings và primary checkout selection. Các helper thuần trong từng feature tạo/cập nhật domain object; page nhận state/callback qua props theo pattern hiện tại. Không thêm Context, store, persistence hoặc dependency.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Node test runner, ESLint.

**Spec:** `D:/ĐồÁnTốtNghiệp/ticket-platform-vite/docs/2026-09-01-attendee-p0-ui-design.md`

## Global Constraints

- Target codebase: `D:/ĐồÁnTốtNghiệp/ticket-platform-vite`.
- UI text Vietnamese; dữ liệu chỉ tồn tại trong React memory và reset khi refresh.
- Không login/auth integration, backend, browser storage, reservation thật, payment thật hoặc QR scan được.
- Primary total = ticket price × quantity; service fee luôn 0.
- React page/component dùng PascalCase filename; helper/hook/test theo convention hiện có.
- Hướng code file dưới 200 dòng; tách theo trách nhiệm rõ ràng.
- Không thêm dependency.
- Reuse visual/form patterns hiện có, tránh abstraction dùng một lần.
- Validation cuối: `npm test`, `npm run lint`, `npm run build`.

---

### Task 1: Unified attendee order, ticket, listing domain và route

**Files:**
- Create: `src/features/orders/types/order.ts`
- Create: `src/features/orders/mock/orderData.ts`
- Create: `src/features/orders/helpers/create-attendee-order.ts`
- Create: `src/features/orders/helpers/filter-attendee-orders.ts`
- Create: `src/features/orders/helpers/order-domain.test.ts`
- Modify: `src/features/tickets/types/ticket.ts`
- Modify: `src/features/resale/types/resale.ts`
- Modify: `src/app/routing/attendee-route.ts`
- Modify: `src/app/routing/attendee-route.test.ts`
- Modify: `src/app/application-structure.test.ts`

**Interfaces:**
- Produces `AttendeeOrderSource = 'primary' | 'resale'`.
- Produces `AttendeeOrderStatus = 'completed' | 'failed' | 'expired'`.
- Produces `AttendeeOrder`, `AttendeeOrderLineItem`, `PrimaryCheckoutSelection`, `DemoPaymentOutcome`.
- Produces `createAttendeeOrder(input): AttendeeOrder` and `filterAttendeeOrders(orders, filters): AttendeeOrder[]`.
- Extends `OwnedTicket` with `source`, `orderId`, `credentialCode`, `credentialStatus`, `resaleStatus`, optional seating fields.
- Extends `ResaleListing` with optional `sourceTicketId`, `ownerLabel`, `listingStatus`.
- Produces routes `primary-checkout`, `primary-result`, `orders`, `order-detail`, `resale-sell`, `my-resale-listings`.

- [ ] Write route tests for `/events/:id/checkout`, `/events/:id/checkout/result`, `/orders`, `/orders/:id`, `/resale/sell/:ticketId`, `/resale/my-listings`; verify specific routes beat generic resale listing matching.
- [ ] Run `node --experimental-strip-types --test src/app/routing/attendee-route.test.ts`; expect new route assertions to fail.
- [ ] Add route/path unions and extractor helpers: `getPrimaryCheckoutEventId`, `getAttendeeOrderId`, `getResaleSellTicketId`.
- [ ] Write domain tests proving completed order retains issued ticket IDs, failed/expired orders have no issued IDs, and source/status filters combine with AND semantics.
- [ ] Run domain test; expect missing module/functions failure.
- [ ] Implement minimal types/helpers and fixture orders: at least one completed primary, one failed primary and one completed resale order.
- [ ] Extend ticket/listing types while preserving current fixtures through explicit new fields or safe optional compatibility during this task.
- [ ] Update structural test expected files and PascalCase page/component naming guards.
- [ ] Run route/domain/current test suite; expect pass.

### Task 2: Primary checkout selection and three-outcome result flow

**Files:**
- Create: `src/features/checkout/types/primary-checkout.ts`
- Create: `src/features/checkout/helpers/validate-primary-checkout.ts`
- Create: `src/features/checkout/helpers/validate-primary-checkout.test.ts`
- Create: `src/features/checkout/components/PrimaryCheckoutSteps.tsx`
- Create: `src/features/checkout/components/PrimaryBuyerForm.tsx`
- Create: `src/features/checkout/components/PrimaryVietQrPanel.tsx`
- Create: `src/features/checkout/components/PrimaryPurchaseSummary.tsx`
- Create: `src/features/checkout/components/DemoPaymentOutcomeSelector.tsx`
- Create: `src/features/checkout/pages/PrimaryCheckoutPage.tsx`
- Create: `src/features/checkout/pages/PrimaryOrderResultPage.tsx`
- Create: `src/features/checkout/index.ts`
- Modify: `src/features/events/pages/EventDetailPage.tsx`
- Modify: `src/features/events/components/EventTicketSelector.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes `PrimaryCheckoutSelection`, `DemoPaymentOutcome`, `AttendeeOrder`.
- Produces `PrimaryCheckoutSubmission { selection, buyer, outcome, transferContent }`.
- `EventDetailPage` calls `onStartCheckout(selection)` rather than notice-only submit.
- `PrimaryCheckoutPage` calls `onComplete(submission)` exactly once per user submit.
- Result page consumes `order` selected by route event/order state.

- [ ] Write validation tests for required full name, email, phone, accepted terms and first-invalid-field order.
- [ ] Run validation test; expect module missing.
- [ ] Implement validation helper and verify pass.
- [ ] Add selection callback to event detail and change CTA copy to `Tiếp tục thanh toán`.
- [ ] Add checkout components using current resale form/VietQR visual language but primary-specific props; do not create a shared abstraction unless duplicated logic is truly identical.
- [ ] Implement checkout page with event/selection guard, profile-prefilled buyer, outcome radio group, processing state and disabled submit.
- [ ] Implement result page branches: completed shows order/tickets CTA, failed retry CTA, expired event-detail CTA, missing-order fallback.
- [ ] Wire `App.tsx` selection state, route navigation and order creation callback; completed issues tickets in Task 3 interface, temporarily allows empty issued IDs until Task 3.
- [ ] Run tests, lint and build; fix only failures introduced by this task.

### Task 3: Dynamic owned tickets and demo credential

**Files:**
- Create: `src/features/tickets/helpers/issue-owned-tickets.ts`
- Create: `src/features/tickets/helpers/update-owned-ticket-resale-status.ts`
- Create: `src/features/tickets/helpers/owned-ticket-domain.test.ts`
- Create: `src/features/tickets/components/DemoTicketQr.tsx`
- Create: `src/features/tickets/components/TicketCredentialCard.tsx`
- Create: `src/features/tickets/components/TicketQrDialog.tsx`
- Modify: `src/features/tickets/mock/ticketData.ts`
- Modify: `src/features/tickets/pages/OwnedTicketsPage.tsx`
- Modify: `src/features/tickets/pages/TicketStatusPage.tsx`
- Modify: `src/features/tickets/components/OwnedTicketSummary.tsx`
- Modify: `src/features/tickets/index.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces `issueOwnedTickets({ orderId, selection/listing, buyerName, quantity, source }): OwnedTicket[]`.
- Produces `updateOwnedTicketResaleStatus(tickets, ticketId, status, credentialStatus?): OwnedTicket[]`.
- `OwnedTicketsPage` consumes `tickets` prop instead of importing fixture directly.
- `TicketStatusPage` consumes `tickets` or lookup callback so dynamic tickets resolve.

- [ ] Write tests: quantity 3 issues three unique IDs/codes; resale issue creates one ticket; update helper changes only target and never mutates input.
- [ ] Run test; expect missing helpers.
- [ ] Implement helpers and extend fixture tickets with explicit domain fields.
- [ ] Move ticket lookup to work against supplied collection.
- [ ] Add deterministic geometric demo QR with visible watermark; ensure no encoded payment/check-in payload.
- [ ] Add credential card/status and accessible dialog with close button, Escape handling and focus return.
- [ ] Wire completed primary/resale callbacks to issue tickets and set order `issuedTicketIds`; prevent duplicate completion by existing order identity.
- [ ] Pass live ticket state to ticket list/profile/status pages.
- [ ] Run ticket tests, full tests, lint and build.

### Task 4: Unified order history and detail UI

**Files:**
- Create: `src/features/orders/components/OrderHistoryFilters.tsx`
- Create: `src/features/orders/components/OrderHistoryCard.tsx`
- Create: `src/features/orders/components/OrderStatusBadge.tsx`
- Create: `src/features/orders/components/OrderDetailTimeline.tsx`
- Create: `src/features/orders/pages/OrderHistoryPage.tsx`
- Create: `src/features/orders/pages/OrderDetailPage.tsx`
- Create: `src/features/orders/index.ts`
- Modify: `src/app/layouts/AttendeeHeader.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- `OrderHistoryPage { orders, onNavigate }` owns local filters and uses `filterAttendeeOrders`.
- `OrderDetailPage { orderId, orders, onNavigate }` resolves order and links completed issued tickets.
- Header adds `/orders` navigation with active state for history/detail.

- [ ] Add helper assertions covering empty/filter cases if not already covered.
- [ ] Implement filters: source `all|primary|resale`, status `all|completed|failed|expired`.
- [ ] Implement cards with ID, event, source, created time, total and status.
- [ ] Implement detail with buyer, line items, totals, timeline and source-aware CTA.
- [ ] Implement not-found and empty states in pages.
- [ ] Wire routes/header/App render branches and fixture+session order state.
- [ ] Verify keyboard focus after navigation remains handled by existing `navigate`.
- [ ] Run full tests, lint and build.

### Task 5: Seller resale listing creation and management

**Files:**
- Create: `src/features/resale/helpers/create-resale-listing.ts`
- Create: `src/features/resale/helpers/update-resale-listing-status.ts`
- Create: `src/features/resale/helpers/resale-seller-domain.test.ts`
- Create: `src/features/resale/components/ResaleListingForm.tsx`
- Create: `src/features/resale/components/ResaleListingPreview.tsx`
- Create: `src/features/resale/components/MyResaleListingCard.tsx`
- Create: `src/features/resale/pages/CreateResaleListingPage.tsx`
- Create: `src/features/resale/pages/MyResaleListingsPage.tsx`
- Modify: `src/features/resale/pages/ResaleMarketplacePage.tsx`
- Modify: `src/features/resale/pages/ResaleListingPage.tsx`
- Modify: `src/features/resale/pages/ResaleCheckoutPage.tsx`
- Modify: `src/features/resale/index.ts`
- Modify: `src/features/tickets/components/OwnedTicketSummary.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- `createResaleListing(ticket, price, profile): ResaleListing` sets owner/current-profile, active status and source ticket ID.
- `updateResaleListingStatus(listings, id, status): ResaleListing[]` is immutable.
- Marketplace consumes `listings` prop and includes only active listings.
- Create page calls `onPublish(listing)`; management page calls `onWithdraw(id)`.

- [ ] Write tests for positive price validation, listing field mapping, immutable withdraw and active-only marketplace filtering.
- [ ] Run tests; expect missing helpers.
- [ ] Implement helpers.
- [ ] Add `Bán lại vé` action only for eligible tickets; listed/sold tickets show status instead.
- [ ] Implement create page with source ticket summary, price input, zero mock fee/net amount, terms confirmation and preview.
- [ ] Implement management page tabs/status filters and withdraw action; no edit action.
- [ ] Change marketplace/listing/checkout from static-only fixture reads to supplied combined listings.
- [ ] Wire publish: append listing and mark source ticket listed. Wire withdraw: mark listing withdrawn and source ticket eligible.
- [ ] Wire completed resale: add unified order, mark listing sold, revoke source credential, issue buyer ticket and navigate result.
- [ ] Preserve ability to buy current-profile listing; add `Listing của bạn` label without disabling CTA.
- [ ] Run seller/resale/full tests, lint and build.

### Task 6: Result integration, fallback, accessibility and documentation

**Files:**
- Modify: `src/features/resale/pages/ResaleResultPage.tsx`
- Modify: `src/features/profile/pages/CustomerProfilePage.tsx`
- Modify: `src/features/profile/components/ProfileTicketOverview.tsx`
- Modify: `src/app/application-structure.test.ts`
- Modify: `README.md`
- Modify: `docs/2026-09-01-attendee-p0-ui-design.md` only if implementation intentionally differs

**Interfaces:**
- Resale result consumes unified `AttendeeOrder`, not legacy single completed order type.
- Profile summary consumes live ticket state.

- [ ] Replace legacy resale result/order link with unified order lookup and ticket CTA.
- [ ] Verify all direct URLs have not-found/unavailable states: checkout without selection, missing event/order/ticket/listing, sold/withdrawn listing.
- [ ] Verify form errors use `aria-invalid`/descriptions and focus first invalid field.
- [ ] Verify processing/results use `aria-live`; current checkout step uses `aria-current`.
- [ ] Verify dialog keyboard behavior and 320px layouts by code inspection/build; fix overflow-prone fixed widths.
- [ ] Update structural expected files and ensure every React module under new feature page/component directories is PascalCase.
- [ ] Update README routes and prototype scope, explicitly noting React-memory reset and non-scannable QR.
- [ ] Run `npm test`; expected all tests pass with zero failures.
- [ ] Run `npm run lint`; expected exit 0.
- [ ] Run `npm run build`; expected exit 0.
- [ ] Search source for stale legacy `CompletedResaleOrder` usage and static fixture imports inside live pages; remove obsolete paths/types only when no consumers remain.

## Execution Order

Tasks are sequential because later UI consumes types/state from earlier tasks. Pause after Tasks 1, 3 and 5 for a focused code review before continuing. Do not commit because the target directory is not a git repository.
