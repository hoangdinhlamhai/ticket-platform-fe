import type { OrganizerFinanceSummary as Summary } from '../helpers/select-organizer-metrics.ts'

type Props = { summary: Summary }

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function OrganizerFinanceSummary({ summary }: Props) {
  const metrics = [
    ['Tổng thu đã thanh toán', money(summary.grossRevenue)],
    ['Tổng hoàn tiền', money(summary.refundTotal)],
    ['Doanh thu ròng', money(summary.netRevenue)],
    ['Chờ/đã lên lịch chi trả', money(summary.payoutsByStatus.pending + summary.payoutsByStatus.scheduled)],
  ]
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Tóm tắt tài chính">
    {metrics.map(([label, value]) => <article className="rounded-lg border border-line bg-surface p-5" key={label}>
      <p className="m-0 text-sm font-bold text-ink-soft">{label}</p>
      <strong className="mt-2 block text-2xl font-extrabold tracking-[-.04em]">{value}</strong>
    </article>)}
  </section>
}
