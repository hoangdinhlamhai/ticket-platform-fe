export const ORGANIZER_TICKET_SALE_STATUSES = ['scheduled', 'on_sale', 'paused', 'sold_out', 'ended'] as const
export type OrganizerTicketSaleStatus = (typeof ORGANIZER_TICKET_SALE_STATUSES)[number]
export type OrganizerPaymentStatus = 'paid' | 'pending' | 'refunded'
export type OrganizerCredentialStatus = 'valid' | 'checked_in' | 'void'
export type OrganizerPayoutStatus = 'scheduled' | 'pending' | 'paid'

export type OrganizerTicketTier = {
  readonly id: string
  readonly eventId: string
  readonly name: string
  readonly price: number
  readonly capacity: number
  readonly soldCount: number
  readonly saleStatus: OrganizerTicketSaleStatus
  readonly salesStartAt: string
  readonly salesEndAt: string
  readonly perOrderLimit: number
}

export type OrganizerOrderLineItem = {
  readonly ticketTierId: string
  readonly quantity: number
  readonly unitPrice: number
}

export type OrganizerOrder = {
  readonly id: string
  readonly eventId: string
  readonly buyerName: string
  readonly buyerEmail: string
  readonly buyerPhone: string
  readonly paymentStatus: OrganizerPaymentStatus
  readonly createdAt: string
  readonly paidAt: string | null
  readonly items: readonly OrganizerOrderLineItem[]
  readonly ticketTierIds: readonly string[]
  readonly total: number
}

export type OrganizerAttendee = {
  readonly id: string
  readonly eventId: string
  readonly orderId: string
  readonly ticketTierId: string
  readonly fullName: string
  readonly email: string
  readonly ticketReference: string
  readonly isOrderBuyer: boolean
  readonly credentialStatus: OrganizerCredentialStatus
  readonly checkedInAt: string | null
}

export type OrganizerRefund = {
  readonly id: string
  readonly orderId: string
  readonly amount: number
  readonly reason: string
  readonly createdAt: string
}

export type OrganizerPayout = {
  readonly id: string
  readonly eventId: string
  readonly amount: number
  readonly status: OrganizerPayoutStatus
  readonly scheduledAt: string
  readonly paidAt: string | null
}

export type OrganizerCheckInActivity = {
  readonly id: string
  readonly eventId: string
  readonly attendeeId: string
  readonly checkedInAt: string
}
