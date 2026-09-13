import { useEffect, useRef } from 'react'
import { getOrganizerAttendeeSource } from '../helpers/filter-organizer-attendees.ts'
import type { OrganizerAttendee, OrganizerOrder, OrganizerTicketTier } from '../types/organizer-commerce.ts'

type Props = {
  attendeeId: string | null
  attendees: readonly OrganizerAttendee[]
  orders: readonly OrganizerOrder[]
  returnFocus: HTMLElement | null
  ticketTiers: readonly OrganizerTicketTier[]
  onClose: () => void
}

const credentialLabels = { valid: 'Hợp lệ', checked_in: 'Đã check-in', void: 'Đã thu hồi' } as const
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })

export function OrganizerAttendeeDetailDrawer({ attendeeId, attendees, onClose, orders, returnFocus, ticketTiers }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const attendee = attendees.find((item) => item.id === attendeeId)

  useEffect(() => {
    if (!attendee) return
    closeRef.current?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
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
  }, [attendee, onClose, returnFocus])

  if (!attendee) return null
  const ordersById = new Map(orders.map((order) => [order.id, order]))
  const order = ordersById.get(attendee.orderId)
  const tier = ticketTiers.find((item) => item.id === attendee.ticketTierId)
  const source = getOrganizerAttendeeSource(attendee, ordersById)

  return <div className="fixed inset-0 z-50" role="presentation"><button className="absolute inset-0 h-full w-full bg-pine/55" type="button" aria-label="Đóng chi tiết người tham dự" onClick={onClose} /><section ref={panelRef} className="absolute top-0 right-0 h-full w-full max-w-xl overflow-y-auto bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="attendee-detail-title"><header className="flex items-start justify-between gap-4 border-b border-line pb-4"><div><p className="m-0 text-xs font-extrabold tracking-[.1em] text-coral-dark">CHI TIẾT NGƯỜI THAM DỰ</p><h2 id="attendee-detail-title" className="mt-2 text-2xl font-extrabold">{attendee.fullName}</h2></div><button ref={closeRef} className="min-h-11 rounded border border-line px-3 font-bold" type="button" onClick={onClose}>Đóng</button></header><dl className="mt-5 grid gap-4 text-sm"><div><dt className="font-bold text-ink-soft">Người giữ vé</dt><dd className="m-0">{attendee.fullName}<br />{attendee.email}</dd></div><div><dt className="font-bold text-ink-soft">Người mua và nguồn</dt><dd className="m-0">{order ? `${order.buyerName} · ${source === 'buyer' ? 'Người mua cũng là người giữ vé' : 'Người mua tặng/chuyển cho người giữ vé'}` : 'Không tìm thấy đơn hàng liên kết'}</dd></div><div><dt className="font-bold text-ink-soft">Vé</dt><dd className="m-0">{tier?.name ?? 'Hạng vé không còn'} · {attendee.ticketReference}</dd></div><div><dt className="font-bold text-ink-soft">Trạng thái credential</dt><dd className="m-0">{credentialLabels[attendee.credentialStatus]}</dd></div><div><dt className="font-bold text-ink-soft">Check-in</dt><dd className="m-0">{attendee.checkedInAt ? dateFormatter.format(new Date(attendee.checkedInAt)) : 'Chưa check-in'}</dd></div></dl><p className="mt-6 rounded-lg bg-paper-deep p-4 text-sm text-ink-soft">Thông tin chỉ đọc trong prototype. Không thực hiện check-in, thay đổi credential hoặc gửi dữ liệu ra ngoài ở màn hình này.</p></section></div>
}
