import type { AdminCaseSeverity, AdminDailyMetric, AdminSubjectType } from '../types/admin-records.ts'
import type { AdminWorkspace } from '../types/admin-workspace.ts'
import type { AdminPath } from '../../../routes/admin-route.ts'

export type AdminDashboardMetric = { readonly id: string; readonly label: string; readonly value: number; readonly detail: string; readonly path: AdminPath }
export type AdminWorkPriority = 'critical' | 'high' | 'medium' | 'low'
export type AdminWorkItem = { readonly id: string; readonly label: string; readonly detail: string; readonly targetId: string; readonly targetType: AdminSubjectType | 'case'; readonly priority: AdminWorkPriority; readonly createdAt: string; readonly path: AdminPath }
export type AdminAlert = { readonly id: string; readonly title: string; readonly description: string; readonly path: AdminPath; readonly tone: 'critical' | 'coral' | 'blue' }
export type AdminVolumeRow = { readonly label: string; readonly value: number; readonly detail: string }

const priorityWeight: Readonly<Record<AdminWorkPriority, number>> = { critical: 0, high: 1, medium: 2, low: 3 }
const unresolvedCaseStatuses = new Set(['open', 'investigating', 'waiting_for_information'])
function formatMoney(value: number) { return `${value.toLocaleString('vi-VN')}đ` }
function latestDate(metrics: readonly AdminDailyMetric[]) { return metrics.reduce((latest, item) => item.date > latest ? item.date : latest, '') }
function priorityFromSeverity(severity: AdminCaseSeverity): AdminWorkPriority { return severity }

export function selectAdminDashboard(workspace: AdminWorkspace) {
  const mostRecentDate = latestDate(workspace.dailyMetrics)
  const currentMonth = mostRecentDate.slice(0, 7)
  const todayMetric = workspace.dailyMetrics.find((item) => item.date === mostRecentDate)
  const monthlyGmv = workspace.dailyMetrics.filter((item) => item.date.startsWith(currentMonth)).reduce((sum, item) => sum + item.primary + item.resale, 0)
  const pendingEvents = workspace.events.filter((item) => item.reviewStatus === 'pending_review')
  const openCases = workspace.cases.filter((item) => unresolvedCaseStatuses.has(item.status))
  const pendingVerifications = workspace.organizers.filter((item) => item.verificationStatus === 'pending')
  const heldPayouts = workspace.payouts.filter((item) => item.status === 'on_hold')
  const metrics: readonly AdminDashboardMetric[] = [
    { id: 'pending-event-reviews', label: 'Sự kiện chờ duyệt', value: pendingEvents.length, detail: 'Mở hàng đợi kiểm duyệt', path: '/admin/events/review' },
    { id: 'open-cases', label: 'Vụ việc đang mở', value: openCases.length, detail: 'Cần theo dõi hoặc xử lý', path: '/admin/cases' },
    { id: 'pending-organizer-verifications', label: 'Organizer chờ xác minh', value: pendingVerifications.length, detail: 'Mở danh sách Organizer', path: '/admin/organizers' },
    { id: 'successful-transactions-today', label: 'Giao dịch thành công hôm nay', value: todayMetric?.successfulTransactions ?? 0, detail: mostRecentDate || 'Chưa có dữ liệu', path: '/admin/orders' },
    { id: 'monthly-gmv', label: 'GMV tháng', value: monthlyGmv, detail: formatMoney(monthlyGmv), path: '/admin/orders' },
    { id: 'held-payouts', label: 'Payout đang giữ', value: heldPayouts.length, detail: 'Mở theo dõi payout', path: '/admin/payouts' },
  ]
  const workItems: AdminWorkItem[] = [
    ...pendingEvents.map((item) => ({ id: `event-${item.id}`, label: item.title, detail: 'Cần xét duyệt sự kiện', targetId: item.id, targetType: 'event' as const, priority: item.riskFlags.length ? 'high' as const : 'medium' as const, createdAt: item.submittedAt, path: `/admin/events/${item.id}/review` as AdminPath })),
    ...openCases.map((item) => ({ id: `case-${item.id}`, label: item.summary, detail: `Vụ việc ${item.category}`, targetId: item.id, targetType: 'case' as const, priority: priorityFromSeverity(item.severity), createdAt: item.createdAt, path: `/admin/cases/${item.id}` as AdminPath })),
    ...pendingVerifications.map((item) => ({ id: `organizer-${item.id}`, label: item.name, detail: 'Chờ xác minh Organizer', targetId: item.id, targetType: 'organizer' as const, priority: 'medium' as const, createdAt: '2026-08-29T08:00:00.000Z', path: '/admin/organizers' as const })),
    ...workspace.refunds.filter((item) => item.status === 'requested' || item.status === 'under_review').map((item) => ({ id: `refund-${item.id}`, label: `Refund ${item.id}`, detail: 'Cần xét duyệt yêu cầu hoàn tiền', targetId: item.id, targetType: 'refund' as const, priority: 'high' as const, createdAt: item.requestedAt, path: '/admin/refunds' as const })),
  ]
  workItems.sort((left, right) => priorityWeight[left.priority] - priorityWeight[right.priority] || left.createdAt.localeCompare(right.createdAt))
  const reportedListings = workspace.resales.filter((item) => item.reported)
  const alerts: readonly AdminAlert[] = [
    ...(workspace.refunds.filter((item) => item.status === 'requested').length >= 1 ? [{ id: 'refund-volume', title: 'Có yêu cầu refund mới', description: 'Kiểm tra yêu cầu refund trước lịch payout.', path: '/admin/refunds' as const, tone: 'coral' as const }] : []),
    ...reportedListings.map((item) => ({ id: `listing-${item.id}`, title: 'Listing resale bị báo cáo', description: 'Cần xem xét listing và case liên quan.', path: '/admin/resale' as const, tone: 'critical' as const })),
    ...heldPayouts.map((item) => ({ id: `payout-${item.id}`, title: 'Payout đang bị giữ', description: 'Payout cần được theo dõi trước khi phát hành.', path: '/admin/payouts' as const, tone: 'critical' as const })),
    ...pendingEvents.filter((item) => item.riskFlags.length > 0).map((item) => ({ id: `event-${item.id}`, title: 'Sự kiện sắp diễn ra chưa duyệt', description: item.title, path: `/admin/events/${item.id}/review` as AdminPath, tone: 'blue' as const })),
  ]
  const volumeRows: readonly AdminVolumeRow[] = [
    { label: 'Sự kiện chờ duyệt', value: pendingEvents.length, detail: `${pendingEvents.length} sự kiện` },
    { label: 'Vụ việc mở', value: openCases.length, detail: `${openCases.length} vụ việc` },
    { label: 'Refund cần xử lý', value: workspace.refunds.filter((item) => item.status === 'requested' || item.status === 'under_review').length, detail: 'Yêu cầu refund' },
    { label: 'Listing bị báo cáo', value: reportedListings.length, detail: 'Listing resale' },
  ]
  return { metrics, workItems, alerts, transactionSeries: workspace.dailyMetrics, volumeRows }
}
