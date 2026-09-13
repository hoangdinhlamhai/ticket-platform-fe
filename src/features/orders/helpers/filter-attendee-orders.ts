import type { AttendeeOrder, OrderFilters } from '../types/order'
export function filterAttendeeOrders(orders: readonly AttendeeOrder[], filters: OrderFilters) {
  return orders.filter((order) => (filters.source === 'all' || order.source === filters.source) && (filters.status === 'all' || order.status === filters.status))
}
