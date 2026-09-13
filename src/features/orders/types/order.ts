export type AttendeeOrderSource = 'primary' | 'resale'
export type AttendeeOrderStatus = 'completed' | 'failed' | 'expired'
export type DemoPaymentOutcome = AttendeeOrderStatus
export type AttendeeOrderLineItem = { label: string; quantity: number; unitPrice: number }
export type AttendeeOrderBuyer = { fullName: string; email: string; phone: string }
export type AttendeeOrder = {
  id: string; source: AttendeeOrderSource; status: AttendeeOrderStatus; eventId: string; eventTitle: string
  buyer: AttendeeOrderBuyer; items: readonly AttendeeOrderLineItem[]; subtotal: number; serviceFee: 0; total: number
  createdAt: string; paidAt: string | null; issuedTicketIds: readonly string[]; resaleListingId?: string
}
export type PrimaryCheckoutSelection = {
  eventId: string; eventTitle: string; date: string; venue: string; address: string
  ticketTierId: string; ticketTierName: string; unitPrice: number; quantity: number
}
export type OrderFilters = { source: 'all' | AttendeeOrderSource; status: 'all' | AttendeeOrderStatus }
