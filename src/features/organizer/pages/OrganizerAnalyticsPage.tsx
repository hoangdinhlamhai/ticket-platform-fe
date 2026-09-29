import { useEffect, useMemo, useState } from 'react'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { OrganizerReportingRangePicker } from '../components/OrganizerReportingRangePicker.tsx'
import { OrganizerRevenueTicketsChart } from '../components/OrganizerRevenueTicketsChart.tsx'
import { OrganizerTicketSalesBreakdown } from '../components/OrganizerTicketSalesBreakdown.tsx'
import type { OrganizerReportState } from '../hooks/organizer-workspace-controller.ts'
import type { OrganizerReportRangeInput } from '../../auth/api/event-api.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../routes/organizer-route.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  workspace: OrganizerWorkspace
  report: OrganizerReportState
  loadEventReport: (eventId: string, range?: OrganizerReportRangeInput) => Promise<unknown>
}

export function OrganizerAnalyticsPage({ activeRoute, eventId, onNavigate, workspace, report, loadEventReport }: Props) {
  const event = workspace.events.find((item) => item.id === eventId)
  const [range, setRange] = useState<OrganizerReportRangeInput | null>(null)
  const [rangeEventId, setRangeEventId] = useState(eventId)

  // Reset the selected range when the event changes, using React's render-time state
  // adjustment pattern rather than a setState-in-effect cascade.
  if (rangeEventId !== eventId) {
    setRangeEventId(eventId)
    setRange(null)
  }

  // Load the full sale window on first open (or when the event changes). The picker
  // narrows the range afterwards; the controller guards stale results by event/range.
  useEffect(() => {
    void loadEventReport(eventId)
  }, [eventId, loadEventReport])

  const data = report.eventId === eventId ? report.data : null

  const ticketBreakdown = useMemo(
    () => (data ? data.ticketTypes.map((type) => ({ label: type.name, value: type.soldTicketCount, detail: `${type.soldTicketCount}/${type.capacity} vé` })) : []),
    [data],
  )

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const applyRange = (next: OrganizerReportRangeInput) => {
    setRange(next)
    void loadEventReport(eventId, next)
  }

  const isLoadingReport = report.eventId === eventId && report.loading
  const reportError = report.eventId === eventId ? report.error : null

  return <div className="mx-auto max-w-7xl space-y-7">
    <OrganizerPageHeader eyebrow="BÁO CÁO SỰ KIỆN" title="Báo cáo bán vé"><p>{event.title}. Số liệu được tính trực tiếp từ đơn hàng đã thanh toán, hạng vé và lượt check-in trong khoảng thời gian bạn chọn.</p></OrganizerPageHeader>
    <OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />

    {data && (
      <OrganizerReportingRangePicker
        saleWindow={data.saleWindow}
        value={range ?? { from: data.saleWindow.startAt, to: data.saleWindow.endAt }}
        loading={isLoadingReport}
        onApply={applyRange}
      />
    )}

    {reportError && (
      <section className="rounded-lg border border-error-ring bg-red-50 p-5 text-sm font-bold text-error" role="alert">
        {reportError}
        <button type="button" className="ml-3 rounded-md border border-error px-3 py-1 font-bold" onClick={() => { void loadEventReport(eventId, range ?? undefined) }}>Thử lại</button>
      </section>
    )}

    {!data && !reportError && (
      <section className="rounded-lg border border-line bg-surface p-5 text-sm font-bold text-ink-soft" aria-live="polite">
        {isLoadingReport ? 'Đang tải báo cáo…' : 'Chưa có dữ liệu báo cáo.'}
      </section>
    )}

    {data && (
      <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[['Doanh thu', `${data.summary.revenue.toLocaleString('vi-VN')}đ`], ['Đã bán', `${data.summary.soldTicketCount}/${data.summary.capacity}`], ['Còn lại', String(data.summary.remainingTicketCount)], ['Check-in', String(data.summary.checkInCount)]].map(([label, value]) => <article key={label} className="rounded-lg border border-line bg-surface p-5"><p className="m-0 text-sm font-bold text-ink-soft">{label}</p><strong className="mt-2 block text-3xl font-extrabold tracking-[-.06em]">{value}</strong></article>)}
        </section>
        <div className="grid gap-6 xl:grid-cols-2">
          <OrganizerTicketSalesBreakdown ticketTiers={ticketBreakdown} />
          <OrganizerRevenueTicketsChart timeline={data.timeline} />
        </div>
      </>
    )}
  </div>
}
