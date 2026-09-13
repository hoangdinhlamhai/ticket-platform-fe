import { useMemo } from 'react'
import { OrganizerAccessibleBarChart } from '../components/OrganizerAccessibleBarChart.tsx'
import { OrganizerAnalyticsSummary } from '../components/OrganizerAnalyticsSummary.tsx'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { OrganizerTicketSalesBreakdown } from '../components/OrganizerTicketSalesBreakdown.tsx'
import { selectOrganizerEventAnalytics } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../app/routing/organizer-route.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  workspace: OrganizerWorkspace
}

export function OrganizerAnalyticsPage({ activeRoute, eventId, onNavigate, workspace }: Props) {
  const event = workspace.events.find((item) => item.id === eventId)
  const analytics = useMemo(() => selectOrganizerEventAnalytics(workspace, eventId), [eventId, workspace])

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  return <div className="mx-auto max-w-7xl space-y-7">
    <OrganizerPageHeader eyebrow="BÁO CÁO SỰ KIỆN" title="Báo cáo bán vé"><p>{event.title}. Các số liệu được tính từ đơn hàng, hạng vé và lượt check-in trong phiên minh họa.</p></OrganizerPageHeader>
    <OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />
    <OrganizerAnalyticsSummary analytics={analytics} />
    <div className="grid gap-6 xl:grid-cols-2">
      <OrganizerTicketSalesBreakdown ticketTiers={analytics.ticketTiers} />
      <OrganizerAccessibleBarChart title="Doanh thu theo ngày thanh toán" unit="Doanh thu đã thanh toán theo ngày" values={analytics.salesByDay} />
    </div>
  </div>
}
