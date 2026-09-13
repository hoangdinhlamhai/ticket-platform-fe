import { OrganizerStatusBadge } from './OrganizerStatusBadge.tsx'
import type { OrganizerPayout } from '../types/organizer-commerce.ts'
import type { OrganizerEvent } from '../types/organizer-event.ts'

type Props = {
  events: readonly OrganizerEvent[]
  payouts: readonly OrganizerPayout[]
}

const labels = { scheduled: 'Đã lên lịch', pending: 'Đang chờ', paid: 'Đã chi trả' } as const
const formatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function OrganizerPayoutTable({ events, payouts }: Props) {
  const eventTitle = (eventId: string) => events.find((event) => event.id === eventId)?.title ?? 'Sự kiện không còn trong phiên'
  const sorted = [...payouts].sort((left, right) => Date.parse(right.scheduledAt) - Date.parse(left.scheduledAt))

  return <section className="space-y-4" aria-labelledby="payout-history-heading">
    <div><h2 id="payout-history-heading" className="m-0 text-xl font-extrabold">Lịch sử chi trả</h2><p className="mt-2 text-sm text-ink-soft">Dữ liệu chỉ đọc trong phiên minh họa; không có thao tác chi trả.</p></div>
    {sorted.length ? <>
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block"><table className="min-w-full text-left text-sm"><caption className="sr-only">Lịch sử chi trả theo sự kiện</caption><thead className="bg-paper-deep"><tr><th className="p-4">Sự kiện</th><th className="p-4">Số tiền</th><th className="p-4">Trạng thái</th><th className="p-4">Lịch chi trả</th><th className="p-4">Đã chi trả</th></tr></thead><tbody>{sorted.map((payout) => <tr className="border-t border-line" key={payout.id}><td className="p-4 font-bold">{eventTitle(payout.eventId)}</td><td className="p-4">{money(payout.amount)}</td><td className="p-4"><OrganizerStatusBadge label={labels[payout.status]} /></td><td className="p-4">{formatter.format(new Date(payout.scheduledAt))}</td><td className="p-4">{payout.paidAt ? formatter.format(new Date(payout.paidAt)) : 'Chưa chi trả'}</td></tr>)}</tbody></table></div>
      <ul className="space-y-3 p-0 md:hidden" aria-label="Lịch sử chi trả theo sự kiện">{sorted.map((payout) => <li className="rounded-lg border border-line bg-surface p-4" key={payout.id}><strong>{eventTitle(payout.eventId)}</strong><dl className="mt-3 grid gap-3 text-sm"><div><dt className="font-bold text-ink-soft">Số tiền</dt><dd className="m-0">{money(payout.amount)}</dd></div><div><dt className="font-bold text-ink-soft">Trạng thái</dt><dd className="m-0"><OrganizerStatusBadge label={labels[payout.status]} /></dd></div><div><dt className="font-bold text-ink-soft">Lịch chi trả</dt><dd className="m-0">{formatter.format(new Date(payout.scheduledAt))}</dd></div><div><dt className="font-bold text-ink-soft">Đã chi trả</dt><dd className="m-0">{payout.paidAt ? formatter.format(new Date(payout.paidAt)) : 'Chưa chi trả'}</dd></div></dl></li>)}</ul>
    </> : <p className="rounded-lg border border-line bg-surface p-4 text-sm text-ink-soft">Chưa có lịch chi trả.</p>}
  </section>
}
