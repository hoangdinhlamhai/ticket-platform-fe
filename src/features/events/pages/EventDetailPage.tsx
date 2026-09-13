import { useCallback } from 'react'
import type { AttendeePath } from '../../../app/routing/attendee-route'
import type { PrimaryCheckoutSelection } from '../../orders'
import { EventActions } from '../components/EventActions'
import { EventDetailHero } from '../components/EventDetailHero'
import { EventDetailOverview } from '../components/EventDetailOverview'
import { EventNotFoundState } from '../components/EventNotFoundState'
import { EventSchedule } from '../components/EventSchedule'
import { EventTicketSelector } from '../components/EventTicketSelector'
import { getEventById } from '../helpers/getEventById'
import { useMockTicketSelection } from '../hooks/useMockTicketSelection'

type EventDetailPageProps = {
  eventId: string
  onNavigate: (path: AttendeePath) => void
  onStartCheckout: (selection: PrimaryCheckoutSelection) => void
}

export function EventDetailPage({ eventId, onNavigate, onStartCheckout }: EventDetailPageProps) {
  const event = getEventById(eventId)
  const selection = useMockTicketSelection(event?.ticketTiers ?? [])

  const goBack = useCallback(() => onNavigate('/'), [onNavigate])
  const startCheckout = useCallback(() => {
    if (!event || !selection.selectedTier) return
    onStartCheckout({
      eventId: event.id,
      eventTitle: event.title,
      date: event.date,
      venue: event.venue,
      address: event.address,
      ticketTierId: selection.selectedTier.id,
      ticketTierName: selection.selectedTier.name,
      unitPrice: selection.selectedTier.price,
      quantity: selection.quantity,
    })
  }, [event, onStartCheckout, selection.quantity, selection.selectedTier])

  if (!event) return <EventNotFoundState onBack={goBack} />

  return (
    <>
      <EventDetailHero event={event} onBack={goBack} />
      <div className="py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="attendee-container grid grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] items-start gap-8 max-[1100px]:block">
          <div>
            <EventDetailOverview event={event} />
            <EventActions event={event} />
            <EventSchedule schedule={event.schedule} />
          </div>
          <div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-10">
            <EventTicketSelector
              onDecrease={selection.decreaseQuantity}
              onIncrease={selection.increaseQuantity}
              onMockSubmit={startCheckout}
              onSelectTier={selection.selectTier}
              quantity={selection.quantity}
              selectedTier={selection.selectedTier}
              selectedTierId={selection.selectedTierId}
              subtotal={selection.subtotal}
              ticketTiers={event.ticketTiers}
            />
          </div>
        </div>
      </div>
    </>
  )
}
