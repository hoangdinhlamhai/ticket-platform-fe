import { useId } from 'react'
import type { OrganizerReportTimelineBucket } from '../../auth/api/event-api.ts'

type Props = {
  timeline: readonly OrganizerReportTimelineBucket[]
}

// Revenue is purple, sold tickets green — a pair validated for contrast on the
// paper/surface tokens. The two series share one 0–100% scale: because revenue
// (đồng) and tickets (vé) have different units, each series is normalised to a
// percentage of its own peak so both lines fit one axis without a misleading
// dual axis. Tooltips carry the real đồng / vé figures.
const REVENUE_COLOR = '#6d28d9'
const TICKETS_COLOR = '#1d6a50'

// Plot geometry (SVG user units). A fixed per-bucket step keeps many timeline
// buckets from squashing; they overflow horizontally inside a scroll container.
const STEP = 72
const PLOT_HEIGHT = 200
const TOP_PADDING = 16
const AXIS_HEIGHT = 46
const LEFT_PADDING = 46
const RIGHT_PADDING = 24

function bucketLabel(bucket: OrganizerReportTimelineBucket) {
  const start = new Date(bucket.startAt)
  if (!Number.isFinite(start.getTime())) return '—'
  const end = new Date(bucket.endAt)
  const spansOneDay = Number.isFinite(end.getTime()) && end.getTime() - start.getTime() <= 24 * 60 * 60 * 1000
  return spansOneDay && end.getTime() - start.getTime() < 24 * 60 * 60 * 1000
    ? start.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
    : start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type Point = { label: string; revenue: number; soldTicketCount: number }

// A single normalised series: value as a percentage of its own peak, plus the
// pixel coordinate for the shared 0–100% axis and the human-readable detail.
function series(
  points: readonly Point[],
  read: (p: Point) => number,
  format: (value: number) => string,
  x: (index: number) => number,
  baseline: number,
) {
  const maximum = Math.max(0, ...points.map(read))
  return points.map((point, index) => {
    const value = read(point)
    const percent = maximum === 0 ? 0 : (value / maximum) * 100
    return {
      x: x(index),
      y: baseline - (percent / 100) * PLOT_HEIGHT,
      percent,
      detail: format(value),
    }
  })
}

export function OrganizerRevenueTicketsChart({ timeline }: Props) {
  const titleId = useId()
  const plotId = useId()
  const points: Point[] = timeline.map((bucket) => ({
    label: bucketLabel(bucket),
    revenue: bucket.revenue,
    soldTicketCount: bucket.soldTicketCount,
  }))

  const x = (index: number) => LEFT_PADDING + index * STEP
  const baseline = TOP_PADDING + PLOT_HEIGHT
  const width = points.length ? LEFT_PADDING + Math.max(0, points.length - 1) * STEP + RIGHT_PADDING : LEFT_PADDING + RIGHT_PADDING
  const height = TOP_PADDING + PLOT_HEIGHT + AXIS_HEIGHT
  const gridPercents = [0, 25, 50, 75, 100]

  const revenue = series(points, (p) => p.revenue, (value) => `${value.toLocaleString('vi-VN')}đ`, x, baseline)
  const tickets = series(points, (p) => p.soldTicketCount, (value) => `${value.toLocaleString('vi-VN')} vé`, x, baseline)
  const line = (nodes: readonly { x: number; y: number }[]) => nodes.map((node) => `${node.x},${node.y}`).join(' ')

  return (
    <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby={titleId}>
      <h2 id={titleId} className="m-0 text-xl font-extrabold">Doanh thu và vé bán theo thời gian</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Biểu đồ đường theo cùng mốc thời gian: doanh thu (tím) và số vé đã bán (xanh lá). Hai chỉ số có đơn vị khác nhau
        nên được quy về phần trăm so với đỉnh của từng chỉ số (thang 0–100%); di chuột lên điểm để xem giá trị thực.
      </p>
      {points.length ? (
        <>
          <ul role="list" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 p-0 text-sm font-bold">
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: REVENUE_COLOR }} aria-hidden="true" />
              Doanh thu (đồng)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: TICKETS_COLOR }} aria-hidden="true" />
              Vé đã bán (vé)
            </li>
          </ul>
          <p className="mt-1 text-xs text-ink-soft">Trục dọc: phần trăm so với đỉnh của mỗi chỉ số (%).</p>
          <div className="mt-3 overflow-x-auto">
            <svg
              role="img"
              aria-labelledby={`${titleId} ${plotId}`}
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="block"
              style={{ maxWidth: 'none' }}
            >
              <title id={plotId}>Doanh thu và vé đã bán theo thời gian, thang phần trăm so với đỉnh của mỗi chỉ số</title>
              {/* Horizontal gridlines + percentage axis labels for the shared 0–100% scale. */}
              {gridPercents.map((percent) => {
                const y = baseline - (percent / 100) * PLOT_HEIGHT
                return (
                  <g key={percent}>
                    <line x1={LEFT_PADDING} y1={y} x2={width - RIGHT_PADDING} y2={y} stroke="var(--color-line)" strokeWidth={1} />
                    <text x={LEFT_PADDING - 8} y={y + 4} textAnchor="end" fontSize={11} fill="var(--color-ink-soft)">{percent}%</text>
                  </g>
                )
              })}
              {/* Revenue line + markers. */}
              <polyline points={line(revenue)} fill="none" stroke={REVENUE_COLOR} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {revenue.map((node, index) => (
                <circle key={`revenue-${index}-${points[index].label}`} cx={node.x} cy={node.y} r={4} fill={REVENUE_COLOR}>
                  <title>{`${points[index].label} · Doanh thu: ${node.detail} (${Math.round(node.percent)}%)`}</title>
                </circle>
              ))}
              {/* Sold-tickets line + markers (dashed to distinguish without relying on colour alone). */}
              <polyline points={line(tickets)} fill="none" stroke={TICKETS_COLOR} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 4" />
              {tickets.map((node, index) => (
                <circle key={`tickets-${index}-${points[index].label}`} cx={node.x} cy={node.y} r={4} fill={TICKETS_COLOR}>
                  <title>{`${points[index].label} · Vé đã bán: ${node.detail} (${Math.round(node.percent)}%)`}</title>
                </circle>
              ))}
              {/* Shared time-axis labels. */}
              {points.map((point, index) => {
                const labelX = x(index)
                return (
                  <text
                    key={`axis-${index}-${point.label}`}
                    x={labelX}
                    y={baseline + 18}
                    textAnchor="end"
                    transform={`rotate(-35 ${labelX} ${baseline + 18})`}
                    fontSize={11}
                    fill="var(--color-ink-soft)"
                  >
                    {point.label}
                  </text>
                )
              })}
            </svg>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-md bg-paper-deep p-4 text-sm font-bold text-ink-soft">
          Chưa có dữ liệu bán vé trong khoảng thời gian này.
        </p>
      )}
    </section>
  )
}
