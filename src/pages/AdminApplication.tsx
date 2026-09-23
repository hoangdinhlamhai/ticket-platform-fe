import { useCallback, type ReactNode } from 'react'
import { AdminLayout } from '../layouts/AdminLayout.tsx'
import { getAdminCaseId, getAdminEventId, getAdminRoute, type AdminPath } from '../routes/admin-route.ts'
import {
  AdminAuditLogPage,
  AdminCaseDetailPage,
  AdminCaseListPage,
  AdminDashboardPage,
  AdminEventReviewDetailPage,
  AdminEventReviewListPage,
  AdminMissingRecord,
  AdminOrderPage,
  AdminOrganizerPage,
  AdminPayoutPage,
  AdminPrototypeNotice,
  AdminRefundPage,
  AdminResalePage,
  AdminSettingsPage,
  AdminTicketPage,
  AdminUserPage,
} from '../features/admin/index.ts'
import { selectAdminDashboard } from '../features/admin/helpers/select-admin-dashboard.ts'
import type { AdminWorkspaceController } from '../features/admin/hooks/admin-workspace-controller.ts'
import type { AdminOperationResult } from '../features/admin/types/admin-workspace.ts'
import { RealAdminEventReviews } from '../features/admin/components/RealAdminEventReviews.tsx'

type Props = {
  readonly pathname: string
  readonly workspace: AdminWorkspaceController
  readonly onPathnameChange: (path: AdminPath) => void
  readonly onExitToAttendee: () => void
  readonly accessToken: string | null
}

function getOperationNotice(operation: AdminOperationResult | null) {
  if (!operation) return ''
  if (operation.kind === 'event_reviewed') return 'Đã cập nhật quyết định xét duyệt sự kiện.'
  if (operation.kind === 'organizer_verification_updated') return 'Đã cập nhật hồ sơ xác minh Organizer.'
  if (operation.kind === 'organizer_account_updated') return 'Đã cập nhật trạng thái tài khoản Organizer.'
  if (operation.kind === 'user_account_updated') return 'Đã cập nhật trạng thái tài khoản người tham dự.'
  if (operation.kind === 'resale_visibility_updated') return 'Đã cập nhật hiển thị listing resale.'
  if (operation.kind === 'case_updated') return 'Đã cập nhật trạng thái vụ việc.'
  if (operation.kind === 'refund_updated') return 'Đã cập nhật trạng thái refund; không có giao dịch tiền thật.'
  if (operation.kind === 'payout_updated') return 'Đã cập nhật trạng thái payout; không có chuyển tiền thật.'
  if (operation.kind === 'category_updated') return 'Đã lưu thay đổi danh mục trong phiên này.'
  return operation.reason ?? 'Không thể thực hiện thao tác này.'
}

export function AdminApplication({ pathname, workspace, onPathnameChange, onExitToAttendee, accessToken }: Props) {
  const route = getAdminRoute(pathname)
  const eventId = getAdminEventId(pathname)
  const caseId = getAdminCaseId(pathname)
  const navigate = useCallback((destination: AdminPath) => {
    if (destination === pathname) return
    workspace.clearLastOperation()
    onPathnameChange(destination)
  }, [onPathnameChange, pathname, workspace])
  const navigatePage = useCallback((destination: string) => {
    if (!destination.startsWith('/admin')) return
    navigate(destination as AdminPath)
  }, [navigate])

  let page: ReactNode
  if (route === 'dashboard') page = <AdminDashboardPage workspace={workspace.workspace} navigate={navigatePage} />
  else if (route === 'event-reviews' && accessToken) page = <RealAdminEventReviews accessToken={accessToken} navigate={navigatePage} />
  else if (route === 'event-review-detail' && accessToken) page = <RealAdminEventReviews accessToken={accessToken} eventId={eventId ?? undefined} navigate={navigatePage} />
  else if (route === 'event-reviews') page = <AdminEventReviewListPage controller={workspace} navigate={navigatePage} />
  else if (route === 'event-review-detail') page = eventId && workspace.workspace.events.some((event) => event.id === eventId) ? <AdminEventReviewDetailPage controller={workspace} eventId={eventId} navigate={navigatePage} /> : <AdminMissingRecord title="Không tìm thấy sự kiện" navigate={navigatePage} />
  else if (route === 'cases') page = <AdminCaseListPage controller={workspace} navigate={navigatePage} />
  else if (route === 'case-detail') page = caseId && workspace.workspace.cases.some((item) => item.id === caseId) ? <AdminCaseDetailPage controller={workspace} caseId={caseId} navigate={navigatePage} /> : <AdminMissingRecord title="Không tìm thấy vụ việc" navigate={navigatePage} />
  else if (route === 'organizers') page = <AdminOrganizerPage controller={workspace} />
  else if (route === 'users') page = <AdminUserPage controller={workspace} />
  else if (route === 'orders') page = <AdminOrderPage controller={workspace} />
  else if (route === 'tickets') page = <AdminTicketPage controller={workspace} />
  else if (route === 'resale') page = <AdminResalePage controller={workspace} />
  else if (route === 'refunds') page = <AdminRefundPage controller={workspace} />
  else if (route === 'payouts') page = <AdminPayoutPage controller={workspace} />
  else if (route === 'settings') page = <AdminSettingsPage controller={workspace} />
  else if (route === 'audit-logs') page = <AdminAuditLogPage controller={workspace} navigate={navigate} />
  else page = <AdminMissingRecord title="Không tìm thấy trang Admin" navigate={navigatePage} />

  const pendingCount = selectAdminDashboard(workspace.workspace).workItems.length
  return (
    <AdminLayout activeRoute={route} notice={getOperationNotice(workspace.lastOperation)} onAcknowledgeNotice={workspace.clearLastOperation} onExitToAttendee={onExitToAttendee} onNavigate={navigate} pendingCount={pendingCount}>
      <div className="space-y-6">
        <AdminPrototypeNotice />
        {page}
      </div>
    </AdminLayout>
  )
}
