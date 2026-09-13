import type { OrganizerOrder, OrganizerPaymentStatus } from '../types/organizer-commerce.ts'

export type OrganizerOrderFilters = { readonly query: string; readonly paymentStatus: OrganizerPaymentStatus | 'all' }

function normalizeVietnamese(value: string) {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll('đ', 'd')
}

function searchableOrderText(order: OrganizerOrder) {
  return normalizeVietnamese(`${order.id} ${order.buyerName} ${order.buyerEmail} ${order.buyerPhone}`)
}

export function filterOrganizerOrders(orders: readonly OrganizerOrder[], eventId: string, filters: OrganizerOrderFilters) {
  const query = normalizeVietnamese(filters.query.trim())
  return orders.filter((order) => order.eventId === eventId
    && (!query || searchableOrderText(order).includes(query))
    && (filters.paymentStatus === 'all' || order.paymentStatus === filters.paymentStatus))
}
