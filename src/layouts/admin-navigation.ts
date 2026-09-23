import type { AdminPath, AdminRoute } from '../routes/admin-route.ts'

export const ADMIN_NAVIGATION: readonly { readonly group: string; readonly items: readonly { readonly label: string; readonly path: Extract<AdminPath, string>; readonly routes: readonly AdminRoute[] }[] }[] = [
  { group: 'TỔNG QUAN', items: [{ label: 'Tổng quan', path: '/admin', routes: ['dashboard'] }] },
  { group: 'KIỂM DUYỆT', items: [{ label: 'Duyệt sự kiện', path: '/admin/events/review', routes: ['event-reviews', 'event-review-detail'] }, { label: 'Báo cáo & vụ việc', path: '/admin/cases', routes: ['cases', 'case-detail'] }] },
  { group: 'TÀI KHOẢN', items: [{ label: 'Organizer', path: '/admin/organizers', routes: ['organizers'] }, { label: 'Người tham dự', path: '/admin/users', routes: ['users'] }] },
  { group: 'VẬN HÀNH', items: [{ label: 'Giao dịch', path: '/admin/orders', routes: ['orders'] }, { label: 'Vé & check-in', path: '/admin/tickets', routes: ['tickets'] }, { label: 'Resale marketplace', path: '/admin/resale', routes: ['resale'] }] },
  { group: 'TÀI CHÍNH', items: [{ label: 'Refund', path: '/admin/refunds', routes: ['refunds'] }, { label: 'Payout', path: '/admin/payouts', routes: ['payouts'] }] },
  { group: 'HỆ THỐNG', items: [{ label: 'Danh mục & cấu hình', path: '/admin/settings', routes: ['settings'] }, { label: 'Nhật ký quản trị', path: '/admin/audit-logs', routes: ['audit-logs'] }] },
]
