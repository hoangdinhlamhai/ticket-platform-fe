import { useEffect, useState } from 'react'
import type { AttendeePath } from '../../../routes/attendee-route'
import { createEventApi } from '../../auth/api/event-api.ts'
import type { PrimaryCheckoutSelection } from '../../orders'
import { EventActions } from '../components/EventActions'
import { EventDetailHero } from '../components/EventDetailHero'
import { EventDetailOverview } from '../components/EventDetailOverview'
import { EventNotFoundState } from '../components/EventNotFoundState'
import { EventTicketSelector } from '../components/EventTicketSelector'
import { useTicketSelection } from '../hooks/useTicketSelection'
import type { MockEventDetail } from '../types/event'

type EventDetailPageProps = {
  eventId: string
  onNavigate: (path: AttendeePath) => void
  onStartCheckout: (selection: PrimaryCheckoutSelection) => void
}

const eventApi = createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })

type DetailState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; event: MockEventDetail | null }

export function EventDetailPage(props: EventDetailPageProps) {
  // Reset loading and ticket selection when navigating between event URLs.
  return <EventDetailLoader key={props.eventId} {...props} />
}

function EventDetailLoader({ eventId, onNavigate, onStartCheckout }: EventDetailPageProps) {
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const goBack = () => onNavigate('/')

  useEffect(() => {
    let cancelled = false
    eventApi.findPublicById(eventId).then((event) => {
      if (!cancelled) setState({ status: 'ready', event })
    }).catch(() => {
      if (!cancelled) setState({ status: 'error' })
    })
    return () => { cancelled = true }
  }, [eventId, attempt])

  if (state.status === 'loading') {
    return <p className="attendee-container py-16 text-center" role="status">Đang tải thông tin sự kiện...</p>
  }
  if (state.status === 'error') {
    return (
      <div className="attendee-container py-16 text-center" role="alert">
        <p>Không thể tải thông tin sự kiện. Vui lòng thử lại.</p>
        <button type="button" className="mt-4 min-h-11 rounded-md bg-blue px-5 font-bold text-paper" onClick={() => {
          setState({ status: 'loading' })
          setAttempt((value) => value + 1)
        }}>Thử lại</button>
        <button type="button" className="ml-3 min-h-11 px-5 font-bold" onClick={goBack}>Quay lại khám phá</button>
      </div>
    )
  }
  if (!state.event) return <EventNotFoundState onBack={goBack} />
  return <EventDetailContent event={state.event} onBack={goBack} onStartCheckout={onStartCheckout} />
}

function EventDetailContent({ event, onBack, onStartCheckout }: {
  event: MockEventDetail
  onBack: () => void
  onStartCheckout: (selection: PrimaryCheckoutSelection) => void
}) {
  const selection = useTicketSelection(event.ticketTiers)

  const startCheckout = () => {
    if (!selection.selectedTier) return
    onStartCheckout({
      eventId: event.id,
      eventTitle: event.title,
      date: event.startsAtLabel || event.date,
      venue: event.venue,
      address: event.address,
      ticketTierId: selection.selectedTier.id,
      ticketTierName: selection.selectedTier.name,
      unitPrice: selection.selectedTier.price,
      quantity: selection.quantity,
    })
  }

  return (
    <>
      <EventDetailHero event={event} onBack={onBack} />
      <div className="py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="attendee-container grid grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] items-start gap-8 max-[1100px]:block">
          <div>
            <EventDetailOverview event={event} />
            <EventActions event={event} />
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
