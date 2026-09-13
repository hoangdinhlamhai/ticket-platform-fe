import { useEffect, useRef } from 'react'
import type {
  OrganizerAttendee,
  OrganizerOrder,
  OrganizerPayout,
  OrganizerRefund,
  OrganizerTicketTier,
} from '../types/organizer-commerce.ts'

type Props = {
  attendees: readonly OrganizerAttendee[]
  eventId: string
  orderId: string | null
  orders: readonly OrganizerOrder[]
  payouts: readonly OrganizerPayout[]
  refunds: readonly OrganizerRefund[]
  returnFocus: HTMLElement | null
  ticketTiers: readonly OrganizerTicketTier[]
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})
const paymentLabels = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  refunded: 'Đã hoàn tiền',
} as const
const credentialLabels = {
  valid: 'Hợp lệ',
  checked_in: 'Đã check-in',
  void: 'Đã thu hồi',
} as const

export function OrganizerOrderDetailDrawer({
  attendees,
  eventId,
  onClose,
  orderId,
  orders,
  payouts,
  refunds,
  returnFocus,
  ticketTiers,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const order = orders.find((item) => item.id === orderId && item.eventId === eventId)

  useEffect(() => {
    if (!order) return
    closeRef.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
      returnFocus?.focus()
    }
  }, [onClose, order, returnFocus])

  if (!order) return null

  const refund = refunds.find((item) => item.orderId === order.id)
  const issuedCredentials = attendees.filter(
    (attendee) => attendee.eventId === eventId && attendee.orderId === order.id,
  )
  const ticketTiersById = new Map(ticketTiers.map((tier) => [tier.id, tier]))

  return <div className="fixed inset-0 z-50" role="presentation">
    <button className="absolute inset-0 h-full w-full bg-pine/55" type="button" aria-label="Đóng chi tiết đơn hàng" onClick={onClose} />
    <section ref={panelRef} className="absolute top-0 right-0 h-full w-full max-w-xl overflow-y-auto bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
      <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
        <div><p className="m-0 text-xs font-extrabold tracking-[.1em] text-coral-dark">CHI TIẾT ĐƠN HÀNG</p><h2 id="order-detail-title" className="mt-2 text-2xl font-extrabold">{order.id}</h2></div>
        <button ref={closeRef} className="min-h-11 rounded border border-line px-3 font-bold" type="button" onClick={onClose}>Đóng</button>
      </header>
      <dl className="mt-5 grid gap-4 text-sm">
        <div><dt className="font-bold text-ink-soft">Người mua</dt><dd className="m-0">{order.buyerName}<br />{order.buyerEmail}<br />{order.buyerPhone}</dd></div>
        <div><dt className="font-bold text-ink-soft">Thanh toán</dt><dd className="m-0">{paymentLabels[order.paymentStatus]} · tạo {dateFormatter.format(new Date(order.createdAt))}</dd></div>
      </dl>
      <h3 className="mt-6 text-lg font-extrabold">Hạng vé</h3>
      <ul className="divide-y divide-line rounded border border-line">{order.items.map((item) => <li className="flex justify-between gap-3 p-3 text-sm" key={item.ticketTierId}><span>{ticketTiersById.get(item.ticketTierId)?.name ?? 'Hạng vé không còn'} × {item.quantity}</span><strong>{(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ</strong></li>)}</ul>
      <p className="mt-3 text-right font-extrabold">Tổng: {order.total.toLocaleString('vi-VN')}đ</p>
      <section className="mt-6">
        <h3 className="text-lg font-extrabold">Vé đã phát hành</h3>
        {issuedCredentials.length ? <ul className="divide-y divide-line rounded border border-line">{issuedCredentials.map((attendee) => <li className="p-3 text-sm" key={attendee.id}><strong>{attendee.ticketReference}</strong><span className="block mt-1">{attendee.fullName} · {ticketTiersById.get(attendee.ticketTierId)?.name ?? 'Hạng vé không còn'}</span><span className="block mt-1 text-ink-soft">Trạng thái: {credentialLabels[attendee.credentialStatus]}</span></li>)}</ul> : <p className="rounded border border-line bg-paper-deep p-3 text-sm">Chưa có thông tin vé đã phát hành cho đơn này.</p>}
      </section>
      <section className="mt-6 rounded-lg bg-paper-deep p-4 text-sm">
        <h3 className="m-0 font-extrabold">Hoàn tiền và đối soát</h3>
        <p>{refund ? `Đã hoàn ${refund.amount.toLocaleString('vi-VN')}đ: ${refund.reason}.` : 'Chưa có yêu cầu hoàn tiền trong dữ liệu mô phỏng.'}</p>
        <p className="mb-0">Đối soát sự kiện: {payouts.length ? `${payouts.length} đợt được ghi nhận.` : 'Chưa có đợt đối soát.'} Đây là thông tin chỉ đọc, không gọi thanh toán.</p>
      </section>
    </section>
  </div>
}
