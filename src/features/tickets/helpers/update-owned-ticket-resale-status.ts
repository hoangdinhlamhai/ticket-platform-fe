import type { OwnedTicket, TicketCredentialStatus, TicketResaleStatus } from '../types/ticket'
export function updateOwnedTicketResaleStatus(tickets: readonly OwnedTicket[], ticketId: string, resaleStatus: TicketResaleStatus, credentialStatus?: TicketCredentialStatus) {
  return tickets.map((ticket) => ticket.id === ticketId ? { ...ticket, resaleStatus, credentialStatus: credentialStatus ?? ticket.credentialStatus } : ticket)
}
