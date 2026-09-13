import type { OrganizerAnalytics } from '../helpers/select-organizer-metrics.ts'

type Props = { analytics: OrganizerAnalytics }

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`
const percent = (value: number) => `${Math.round(value * 100)}%`

export function OrganizerAnalyticsSummary({ analytics }: Props) {
  const metrics = [
    ['Doanh thu đã thanh toán', money(analytics.grossRevenue)],
    ['Đơn đã thanh toán', String(analytics.paidOrderCount)],
    ['Vé đã bán', `${analytics.soldCount}/${analytics.capacity} · ${percent(analytics.soldRate)}`],
    ['Đã check-in', `${analytics.checkedInCount}/${analytics.attendeeCount} · ${percent(analytics.checkInRate)}`],
  ]
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tóm tắt báo cáo sự kiện">
    {metrics.map(([label, value]) => <article className="rounded-lg border border-line bg-surface p-5" key={label}>
      <p className="m-0 text-sm font-bold text-ink-soft">{label}</p>
      <strong className="mt-2 block text-2xl font-extrabold tracking-[-.04em] text-ink">{value}</strong>
    </article>)}
  </section>
}
