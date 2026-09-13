import { OrganizerResponsiveRecordList } from './OrganizerResponsiveRecordList.tsx'
import { OrganizerStatusBadge } from './OrganizerStatusBadge.tsx'
import { getOrganizerAttendeeSource } from '../helpers/filter-organizer-attendees.ts'
import { maskOrganizerEmail } from '../helpers/mask-organizer-email.ts'
import type {
  OrganizerAttendee,
  OrganizerOrder,
  OrganizerTicketTier,
} from '../types/organizer-commerce.ts'

type Props = {
  attendees: readonly OrganizerAttendee[]
  orders: readonly OrganizerOrder[]
  ticketTiers: readonly OrganizerTicketTier[]
  onOpen: (attendeeId: string, opener: HTMLElement) => void
}

const credentialLabels = {
  valid: 'Hợp lệ',
  checked_in: 'Đã check-in',
  void: 'Đã thu hồi',
} as const
const credentialTones = { valid: 'mint', checked_in: 'blue', void: 'coral' } as const
const sourceLabels = { buyer: 'Người mua', holder: 'Người giữ vé' } as const
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export function OrganizerAttendeeTable({
  attendees,
  onOpen,
  orders,
  ticketTiers,
}: Props) {
  const ordersById = new Map(orders.map((order) => [order.id, order]))
  const tiersById = new Map(ticketTiers.map((tier) => [tier.id, tier]))

  return <>
    <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Người tham dự theo sự kiện</caption>
        <thead className="bg-paper-deep"><tr><th className="p-4">Người giữ vé</th><th className="p-4">Người mua</th><th className="p-4">Hạng vé</th><th className="p-4">Trạng thái</th><th className="p-4">Check-in</th><th className="p-4"><span className="sr-only">Chi tiết</span></th></tr></thead>
        <tbody>{attendees.map((attendee) => {
          const order = ordersById.get(attendee.orderId)
          const source = getOrganizerAttendeeSource(attendee, ordersById)
          return <tr className="border-t border-line" key={attendee.id}><td className="p-4"><strong>{attendee.fullName}</strong><span className="block text-ink-soft">{attendee.email}</span></td><td className="p-4">{order?.buyerName ?? 'Không tìm thấy đơn'}<span className="block text-ink-soft">{sourceLabels[source]}</span></td><td className="p-4">{tiersById.get(attendee.ticketTierId)?.name ?? 'Hạng vé không còn'}</td><td className="p-4"><OrganizerStatusBadge label={credentialLabels[attendee.credentialStatus]} tone={credentialTones[attendee.credentialStatus]} /></td><td className="p-4">{attendee.checkedInAt ? dateFormatter.format(new Date(attendee.checkedInAt)) : 'Chưa check-in'}</td><td className="p-4"><button className="min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onOpen(attendee.id, event.currentTarget)}>Xem</button></td></tr>
        })}</tbody>
      </table>
    </div>
    <OrganizerResponsiveRecordList label="Người tham dự theo sự kiện">
      {attendees.map((attendee) => {
        const order = ordersById.get(attendee.orderId)
        const source = getOrganizerAttendeeSource(attendee, ordersById)
        return <article className="rounded-lg border border-line bg-surface p-4" key={attendee.id}><strong>{attendee.fullName}</strong><dl className="mt-3 grid gap-3 text-sm"><div><dt className="font-bold text-ink-soft">Email</dt><dd className="m-0">{maskOrganizerEmail(attendee.email)}</dd></div><div><dt className="font-bold text-ink-soft">Nguồn</dt><dd className="m-0">{sourceLabels[source]}: {order?.buyerName ?? 'Không tìm thấy đơn'}</dd></div><div><dt className="font-bold text-ink-soft">Hạng vé</dt><dd className="m-0">{tiersById.get(attendee.ticketTierId)?.name ?? 'Hạng vé không còn'}</dd></div><div><dt className="font-bold text-ink-soft">Trạng thái / check-in</dt><dd className="m-0"><OrganizerStatusBadge label={credentialLabels[attendee.credentialStatus]} tone={credentialTones[attendee.credentialStatus]} /> <span>{attendee.checkedInAt ? dateFormatter.format(new Date(attendee.checkedInAt)) : 'Chưa check-in'}</span></dd></div></dl><button className="mt-4 min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onOpen(attendee.id, event.currentTarget)}>Xem chi tiết</button></article>
      })}
    </OrganizerResponsiveRecordList>
  </>
}
