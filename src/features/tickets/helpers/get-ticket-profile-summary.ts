import type { OwnedTicket, TicketProfileSummary } from '../types/ticket'

export function getTicketProfileSummary(
  tickets: readonly OwnedTicket[],
  recentLimit = 2,
): TicketProfileSummary {
  return {
    upcomingCount: tickets.length,
    usedCount: 0,
    resaleCount: tickets.filter((ticket) => ticket.resaleStatus === 'listed').length,
    recentTickets: tickets.slice(0, Math.max(0, recentLimit)),
  }
}
