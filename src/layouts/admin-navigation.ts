import type { AdminPath, AdminRoute } from '../routes/admin-route.ts'

export const ADMIN_NAVIGATION: readonly { readonly group: string; readonly items: readonly { readonly label: string; readonly path: Extract<AdminPath, string>; readonly routes: readonly AdminRoute[] }[] }[] = [
  { group: 'TỔNG QUAN', items: [{ label: 'Dashboard', path: '/admin', routes: ['dashboard'] }] },
  { group: 'QUẢN TRỊ', items: [{ label: 'Người dùng', path: '/admin/users', routes: ['users'] }, { label: 'Danh mục', path: '/admin/categories', routes: ['categories'] }, { label: 'Organizer', path: '/admin/organizers', routes: ['organizers'] }] },
  { group: 'SỰ KIỆN', items: [{ label: 'Tất cả sự kiện', path: '/admin/events', routes: ['events-all'] }, { label: 'Chờ duyệt', path: '/admin/events/review', routes: ['event-reviews', 'event-review-detail'] }] },
  { group: 'GIAO DỊCH', items: [{ label: 'Orders', path: '/admin/orders', routes: ['orders'] }, { label: 'Payments', path: '/admin/payments', routes: ['payments'] }, { label: 'Refunds', path: '/admin/refunds', routes: ['refunds'] }, { label: 'Payouts', path: '/admin/payouts', routes: ['payouts'] }] },
  { group: 'TICKET RESALE', items: [{ label: 'Listings', path: '/admin/resale', routes: ['resale'] }, { label: 'Transactions', path: '/admin/resale/transactions', routes: ['resale-transactions'] }] },
]
