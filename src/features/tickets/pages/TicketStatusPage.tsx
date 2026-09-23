import { useCallback, type MouseEvent } from 'react'
import { shouldUseClientNavigation, type AttendeePath } from '../../../routes/attendee-route'
import { TicketCredentialCard } from '../components/TicketCredentialCard'
import { TicketInformationCard } from '../components/TicketInformationCard'
import { TicketJourneyTimeline } from '../components/TicketJourneyTimeline'
import { TicketNotFoundState } from '../components/TicketNotFoundState'
import { TicketStatusHero } from '../components/TicketStatusHero'
import { getTicketById } from '../helpers/getTicketById'
import type { OwnedTicket } from '../types/ticket'

type TicketStatusPageProps = {
  onNavigate: (path: AttendeePath) => void
  ticketId: string
  tickets: readonly OwnedTicket[]
}

export function TicketStatusPage({ onNavigate, ticketId, tickets }: TicketStatusPageProps) {
  const ticket = getTicketById(ticketId, tickets)
  const goToTickets = useCallback(() => onNavigate('/tickets'), [onNavigate])
  const viewEvent = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(event) || !ticket) return
    event.preventDefault()
    onNavigate(`/events/${ticket.eventId}`)
  }, [onNavigate, ticket])

  if (!ticket) return <TicketNotFoundState onBack={goToTickets} />

  return (
    <>
      <TicketStatusHero ticket={ticket} onBack={goToTickets} />
      <div className="py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="attendee-container grid grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] items-start gap-8 max-[1100px]:block">
          <div>
            <TicketInformationCard ticket={ticket} />
            <TicketJourneyTimeline journey={ticket.journey} />
          </div>
          <div className="max-[1100px]:mt-10">
            <TicketCredentialCard ticket={ticket} />
            {ticket.eventId && <a className="mt-4 flex min-h-11 items-center justify-center rounded-md border border-blue-deep/60 bg-paper px-4 text-sm font-extrabold text-blue-deep no-underline hover:bg-blue hover:text-paper" href={`/events/${ticket.eventId}`} onClick={viewEvent}>Xem chi tiết sự kiện</a>}
          </div>
        </div>
      </div>
    </>
  )
}
