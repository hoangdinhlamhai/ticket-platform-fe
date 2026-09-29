import { useEffect, useState } from 'react'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerEventReviewPanel } from '../components/OrganizerEventReviewPanel.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { OrganizerReportingRangePicker } from '../components/OrganizerReportingRangePicker.tsx'
import { OrganizerRevenueTicketsChart } from '../components/OrganizerRevenueTicketsChart.tsx'
import { OrganizerStatusBadge } from '../components/OrganizerStatusBadge.tsx'
import type { OrganizerReportState } from '../hooks/organizer-workspace-controller.ts'
import type { OrganizerReportRangeInput } from '../../auth/api/event-api.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../routes/organizer-route.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  onPublish: (eventId: string) => void
  onSubmitReview: (eventId: string) => void
  workspace: OrganizerWorkspace
  report: OrganizerReportState
  loadEventReport: (eventId: string, range?: OrganizerReportRangeInput) => Promise<unknown>
}
const labels = { draft: 'Bản nháp', pending_review: 'Chờ duyệt', changes_requested: 'Cần chỉnh sửa', approved: 'Đã duyệt', published: 'Đã xuất bản', ongoing: 'Đang diễn ra', ended: 'Đã kết thúc', cancelled: 'Đã hủy', rejected: 'Bị từ chối' } as const
const tones = { draft: 'neutral', pending_review: 'blue', changes_requested: 'coral', approved: 'mint', published: 'mint', ongoing: 'blue', ended: 'neutral', cancelled: 'coral', rejected: 'coral' } as const
function date(value: string) { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(value)) }
export function OrganizerEventOverviewPage({ activeRoute, eventId, onNavigate, onPublish, onSubmitReview, workspace, report, loadEventReport }: Props) {
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
  useEffect(() => { void loadEventReport(eventId) }, [eventId, loadEventReport])

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const applyRange = (next: OrganizerReportRangeInput) => {
    setRange(next)
    void loadEventReport(eventId, next)
  }

  const data = report.eventId === eventId ? report.data : null
  const isLoadingReport = report.eventId === eventId && report.loading
  const reportError = report.eventId === eventId ? report.error : null
  const summary = data?.summary
  const cards: readonly [string, string][] = summary
    ? [['Doanh thu', `${summary.revenue.toLocaleString('vi-VN')}đ`], ['Đã bán', `${summary.soldTicketCount}/${summary.capacity}`], ['Còn lại', String(summary.remainingTicketCount)], ['Check-in', String(summary.checkInCount)]]
    : [['Doanh thu', '—'], ['Đã bán', '—'], ['Còn lại', '—'], ['Check-in', '—']]
  return <div className="mx-auto max-w-7xl space-y-7"><OrganizerPageHeader eyebrow="TỔNG QUAN SỰ KIỆN" title={event.title} actions={<OrganizerStatusBadge label={labels[event.status]} tone={tones[event.status]} />}><p>{date(event.startsAt)} · {event.venue}, {event.city}</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />
    {data && (
      <OrganizerReportingRangePicker
        saleWindow={data.saleWindow}
        value={range ?? { from: data.saleWindow.startAt, to: data.saleWindow.endAt } }
        loading={isLoadingReport}
        onApply={applyRange}
      />
    )}
    {reportError && <section className="rounded-lg border border-error-ring bg-red-50 p-4 text-sm font-bold text-error" role="alert">{reportError}<button type="button" className="ml-3 rounded-md border border-error px-3 py-1 font-bold" onClick={() => { void loadEventReport(eventId, range ?? undefined) }}>Thử lại</button></section>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <article key={label} className="rounded-lg border border-line bg-surface p-5"><p className="m-0 text-sm font-bold text-ink-soft">{label}</p><strong className="mt-2 block text-3xl font-extrabold tracking-[-.06em]">{value}</strong></article>)}</section>
    {!data && !reportError && <p className="text-sm font-bold text-ink-soft" aria-live="polite">{isLoadingReport ? 'Đang tải số liệu báo cáo…' : 'Chưa có số liệu báo cáo.'}</p>}
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,.7fr)]"><section className="rounded-lg border border-line bg-surface p-5"><h2 className="m-0 text-xl font-extrabold">Bán vé và vận hành</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="font-bold text-ink-soft">Đơn hàng đã thanh toán</dt><dd className="m-0 mt-1 text-2xl font-extrabold">{summary ? summary.paidOrderCount : '—'}</dd></div><div><dt className="font-bold text-ink-soft">Hạng vé</dt><dd className="m-0 mt-1 text-2xl font-extrabold">{data ? data.ticketTypes.length : '—'}</dd></div></dl><p className="mt-5 text-sm leading-relaxed text-ink-soft">Danh sách vé, đơn hàng và người tham dự tiếp tục được quản lý ở các mục điều hướng của sự kiện.</p></section><OrganizerEventReviewPanel event={event} onPublish={onPublish} onSubmitReview={onSubmitReview} /></div>
    {data && <OrganizerRevenueTicketsChart timeline={data.timeline} />}
  </div>
}
