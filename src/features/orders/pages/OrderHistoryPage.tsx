import { useMemo, useState } from 'react'
import type { AttendeePath } from '../../../app/routing/attendee-route'
import { filterAttendeeOrders } from '../helpers/filter-attendee-orders'
import type { AttendeeOrder, OrderFilters } from '../types/order'
import { OrderHistoryCard } from '../components/OrderHistoryCard'
import { OrderHistoryFilters } from '../components/OrderHistoryFilters'
type Props = { orders: readonly AttendeeOrder[]; onNavigate: (path: AttendeePath) => void }
export function OrderHistoryPage({ orders, onNavigate }: Props) {
  const [filters, setFilters] = useState<OrderFilters>({ source: 'all', status: 'all' })
  const visibleOrders = useMemo(() => filterAttendeeOrders(orders, filters), [filters, orders])
  return <section className="bg-paper-deep py-[clamp(3.5rem,7vw,6rem)]"><div className="attendee-container"><header className="mb-7"><p className="text-xs font-extrabold tracking-[0.11em] text-coral-dark">LỊCH SỬ GIAO DỊCH MOCK</p><h1 className="mt-2 font-body text-[clamp(3rem,7vw,6.5rem)] leading-[0.8] font-extrabold tracking-[-0.1em]">Mọi đơn hàng, một nơi.</h1><p className="mt-5 max-w-2xl leading-[1.7] text-ink-soft">Theo dõi cả vé chính thức và resale trong phiên minh họa hiện tại.</p></header><OrderHistoryFilters filters={filters} onChange={setFilters} /><div className="mt-6 space-y-4">{visibleOrders.map((order) => <OrderHistoryCard key={order.id} order={order} onNavigate={onNavigate} />)}{visibleOrders.length === 0 && <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center"><h2 className="text-2xl font-extrabold">Chưa có đơn phù hợp.</h2><p className="mt-2 text-ink-soft">Thử thay đổi nguồn hoặc trạng thái.</p></div>}</div></div></section>
}
