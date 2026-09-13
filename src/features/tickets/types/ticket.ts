export type TicketJourneyItem = {
  label: string
  detail: string
  state: 'complete' | 'current' | 'future'
}

export type TicketProfileSummary = {
  upcomingCount: number
  usedCount: number
  resaleCount: number
  recentTickets: readonly OwnedTicket[]
}

export type OwnedTicketSource = 'fixture' | 'primary' | 'resale'
export type TicketCredentialStatus = 'ready' | 'pending' | 'revoked'
export type TicketResaleStatus = 'eligible' | 'listed' | 'sold' | 'ineligible'

export type OwnedTicket = {
  id: string
  eventId: string
  eventTitle: string
  date: string
  venue: string
  address: string
  ticketType: string
  holderName: string
  referenceCode: string
  purchaseLabel: string
  status: 'Sẵn sàng check-in' | 'Sắp diễn ra'
  journey: readonly TicketJourneyItem[]
  source: OwnedTicketSource
  orderId: string | null
  credentialCode: string
  credentialStatus: TicketCredentialStatus
  resaleStatus: TicketResaleStatus
  section?: string
  row?: string | null
  seats?: readonly string[]
}
