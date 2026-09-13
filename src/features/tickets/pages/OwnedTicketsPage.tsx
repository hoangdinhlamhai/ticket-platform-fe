import { useCallback, type MouseEvent } from 'react'
import { shouldUseClientNavigation, type AttendeePath } from '../../../app/routing/attendee-route'
import { OwnedTicketSummary } from '../components/OwnedTicketSummary'
import type { OwnedTicket } from '../types/ticket'

type OwnedTicketsPageProps = {
  onNavigate: (path: AttendeePath) => void
  onSellTicket: (ticket: OwnedTicket) => void
  tickets: readonly OwnedTicket[]
}

export function OwnedTicketsPage({ onNavigate, onSellTicket, tickets }: OwnedTicketsPageProps) {
  const viewTicket = useCallback((ticket: OwnedTicket, event: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(event)) return
    event.preventDefault()
    onNavigate(`/tickets/${ticket.id}`)
  }, [onNavigate])

  return <OwnedTicketSummary tickets={tickets} onSell={onSellTicket} onTicketAction={viewTicket} />
}
