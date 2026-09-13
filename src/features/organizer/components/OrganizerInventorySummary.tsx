import type { OrganizerTicketTierMetric } from '../helpers/select-organizer-metrics.ts'

type Props = { ticketTiers: readonly OrganizerTicketTierMetric[] }
const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function OrganizerInventorySummary({ ticketTiers }: Props) {
  const capacity = ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0)
  const sold = ticketTiers.reduce((sum, tier) => sum + tier.soldCount, 0)
  const revenue = ticketTiers.reduce((sum, tier) => sum + tier.soldCount * tier.price, 0)
  return <section className="grid gap-4 sm:grid-cols-3" aria-label="Tóm tắt tồn kho">{[['Sức chứa', `${sold}/${capacity} đã bán`], ['Còn lại', `${capacity - sold} vé`], ['Doanh thu dự kiến', money(revenue)]].map(([label, value]) => <article className="rounded-lg border border-line bg-surface p-5" key={label}><p className="m-0 text-sm font-bold text-ink-soft">{label}</p><strong className="mt-2 block text-2xl font-extrabold">{value}</strong></article>)}</section>
}
