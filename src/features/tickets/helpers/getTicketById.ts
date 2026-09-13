import { MOCK_OWNED_TICKETS } from '../mock/ticketData.ts'
import type { OwnedTicket } from '../types/ticket.ts'
export function getTicketById(ticketId: string, tickets: readonly OwnedTicket[] = MOCK_OWNED_TICKETS) { return tickets.find((ticket) => ticket.id === ticketId) }
