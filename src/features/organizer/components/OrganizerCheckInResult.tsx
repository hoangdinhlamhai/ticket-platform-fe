import { getOrganizerAttendeeSource } from '../helpers/filter-organizer-attendees.ts'
import type { OrganizerAttendee, OrganizerOrder, OrganizerTicketTier } from '../types/organizer-commerce.ts'

type Props = {
  attendee: OrganizerAttendee | null
  orders: readonly OrganizerOrder[]
  ticketTiers: readonly OrganizerTicketTier[]
  onConfirm: () => void
}

const credentialLabels = { valid: 'Hợp lệ, có thể check-in', checked_in: 'Đã check-in', void: 'Đã thu hồi' } as const

export function OrganizerCheckInResult({ attendee, orders, ticketTiers, onConfirm }: Props) {
  if (!attendee) return null
  const ordersById = new Map(orders.map((order) => [order.id, order]))
  const tier = ticketTiers.find((item) => item.id === attendee.ticketTierId)
  const source = getOrganizerAttendeeSource(attendee, ordersById) === 'buyer' ? 'Người mua' : 'Người giữ vé'

  return (
    <section className="rounded-lg border border-blue bg-paper-deep p-5" aria-labelledby="check-in-confirmation-title">
      <h2 id="check-in-confirmation-title" className="m-0 text-lg font-extrabold">Xác nhận check-in mô phỏng</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-bold text-ink-soft">Người giữ vé</dt><dd className="m-0">{attendee.fullName}<br />{attendee.email}</dd></div><div><dt className="font-bold text-ink-soft">Hạng vé</dt><dd className="m-0">{tier?.name ?? 'Không tìm thấy hạng vé'}</dd></div><div><dt className="font-bold text-ink-soft">Nguồn</dt><dd className="m-0">{source}</dd></div><div><dt className="font-bold text-ink-soft">Credential</dt><dd className="m-0">{attendee.ticketReference} · {credentialLabels[attendee.credentialStatus]}</dd></div></dl>
      <button className="mt-5 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={onConfirm}>Xác nhận check-in mô phỏng</button>
    </section>
  )
}
