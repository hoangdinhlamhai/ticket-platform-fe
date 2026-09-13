import type { AttendeeOrder, AttendeeOrderBuyer, AttendeeOrderLineItem, AttendeeOrderSource, AttendeeOrderStatus } from '../types/order'

type Input = { id: string; source: AttendeeOrderSource; status: AttendeeOrderStatus; eventId: string; eventTitle: string; buyer: AttendeeOrderBuyer; items: readonly AttendeeOrderLineItem[]; createdAt?: string; issuedTicketIds?: readonly string[]; resaleListingId?: string }
export function createAttendeeOrder(input: Input): AttendeeOrder {
  const now = input.createdAt ?? new Date().toISOString()
  const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const completed = input.status === 'completed'
  return { ...input, createdAt: now, issuedTicketIds: completed ? (input.issuedTicketIds ?? []) : [], paidAt: completed ? now : null, serviceFee: 0, subtotal, total: subtotal }
}
