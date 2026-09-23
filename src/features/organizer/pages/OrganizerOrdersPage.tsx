import { useMemo, useState } from 'react'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerOrderDetailDrawer } from '../components/OrganizerOrderDetailDrawer.tsx'
import { OrganizerOrderFilters } from '../components/OrganizerOrderFilters.tsx'
import { OrganizerOrderTable } from '../components/OrganizerOrderTable.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { filterOrganizerOrders, type OrganizerOrderFilters as FilterState } from '../helpers/filter-organizer-orders.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../routes/organizer-route.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  workspace: OrganizerWorkspace
}

const initialFilters: FilterState = { query: '', paymentStatus: 'all' }

export function OrganizerOrdersPage({ activeRoute, eventId, onNavigate, workspace }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [exportNotice, setExportNotice] = useState('')
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)
  const event = workspace.events.find((item) => item.id === eventId)
  const eventOrders = useMemo(() => workspace.orders.filter((order) => order.eventId === eventId), [eventId, workspace.orders])
  const orders = useMemo(() => filterOrganizerOrders(workspace.orders, eventId, filters), [eventId, filters, workspace.orders])
  const paymentSummary = useMemo(() => ({ paid: eventOrders.filter((order) => order.paymentStatus === 'paid').length, pending: eventOrders.filter((order) => order.paymentStatus === 'pending').length, refunded: eventOrders.filter((order) => order.paymentStatus === 'refunded').length }), [eventOrders])

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const changeFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }
  const openOrder = (orderId: string, opener: HTMLElement) => {
    setReturnFocus(opener)
    setSelectedOrderId(orderId)
  }

  return <div className="mx-auto max-w-7xl space-y-7"><OrganizerPageHeader eyebrow="VẬN HÀNH ĐƠN HÀNG" title="Đơn hàng" actions={<button className="min-h-11 rounded-md border border-blue px-4 font-extrabold text-blue-deep" type="button" onClick={() => setExportNotice('Xuất CSV sẽ được bổ sung sau; chưa có tệp nào được tạo.')}>Xuất CSV</button>}><p>{event.title}. Danh sách chỉ đọc; không gọi thanh toán hoặc hoàn tiền.</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />{exportNotice && <p className="rounded-md border border-blue bg-paper-deep p-3 text-sm font-bold text-blue-deep" role="status">{exportNotice}</p>}<section className="grid gap-4 sm:grid-cols-3" aria-label="Tóm tắt thanh toán"><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Đã thanh toán</p><strong className="mt-2 block text-2xl font-extrabold">{paymentSummary.paid}</strong></article><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Chờ thanh toán</p><strong className="mt-2 block text-2xl font-extrabold">{paymentSummary.pending}</strong></article><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Đã hoàn tiền</p><strong className="mt-2 block text-2xl font-extrabold">{paymentSummary.refunded}</strong></article></section><OrganizerOrderFilters filters={filters} onChange={changeFilter} onReset={() => setFilters(initialFilters)} />{orders.length ? <OrganizerOrderTable orders={orders} onOpen={openOrder} /> : <OrganizerEmptyState title={eventOrders.length ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng'} description={eventOrders.length ? 'Thử đặt lại bộ lọc hoặc thay đổi từ khóa tìm kiếm.' : 'Đơn hàng sẽ xuất hiện ở đây khi có người mua vé.'} />}{selectedOrderId && <OrganizerOrderDetailDrawer eventId={eventId} orderId={selectedOrderId} attendees={workspace.attendees} orders={eventOrders} payouts={workspace.payouts.filter((payout) => payout.eventId === eventId)} refunds={workspace.refunds} returnFocus={returnFocus} ticketTiers={workspace.ticketTiers.filter((tier) => tier.eventId === eventId)} onClose={() => setSelectedOrderId(null)} />}</div>
}
