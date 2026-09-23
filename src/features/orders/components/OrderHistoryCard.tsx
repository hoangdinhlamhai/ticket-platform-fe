import type { MouseEvent } from 'react'
import { shouldUseClientNavigation, type AttendeePath } from '../../../routes/attendee-route'
import { formatTicketPrice } from '../../events'
import type { AttendeeOrder } from '../types/order'
import { OrderStatusBadge } from './OrderStatusBadge'
type Props = { order: AttendeeOrder; onNavigate: (path: AttendeePath) => void }
export function OrderHistoryCard({ order, onNavigate }: Props) {
  const href: AttendeePath = `/orders/${order.id}`
  const open = (event: MouseEvent<HTMLAnchorElement>) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigate(href) }
  return <article className="rounded-lg border border-line bg-surface p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><OrderStatusBadge status={order.status} /><p className="mt-3 mb-0 text-xs font-extrabold tracking-[0.08em] text-blue-deep">{order.source === 'primary' ? 'VÉ CHÍNH THỨC' : 'RESALE'} · {order.id}</p><h2 className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em]">{order.eventTitle}</h2></div><strong className="text-xl text-blue-deep">{formatTicketPrice(order.total)}</strong></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><span className="text-sm text-ink-soft">{new Date(order.createdAt).toLocaleString('vi-VN')}</span><a className="inline-flex min-h-11 items-center rounded-md border border-blue-deep/50 px-4 text-sm font-extrabold text-blue-deep no-underline hover:bg-blue hover:text-paper" href={href} onClick={open}>Xem chi tiết</a></div></article>
}
