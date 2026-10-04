import { useEffect, useState } from 'react'
import type { AttendeePath } from '../../../routes/attendee-route.ts'
import * as eventApi from '../api/eventApi.ts'
import type { PrimaryCheckoutSelection } from '../../orders'
import type { PublicEvent } from '../../../types/event.ts'
import { EventActions } from '../components/EventActions.tsx'
import { EventDetailHero } from '../components/even-detail/EventDetailHero.tsx'
import { EventDetailOverview } from '../components/even-detail/EventDetailOverview.tsx'
import { EventNotFoundState } from '../components/EventNotFoundState.tsx'
import { EventTicketSelector } from '../components/EventTicketSelector.tsx'
import { useTicketSelection } from '../hooks/useTicketSelection.ts'
import type { EventDetailView, EventPosterTone } from '../types/event.ts'

type Props = {
  eventId: string
  onNavigate: (path: AttendeePath) => void
  onStartCheckout: (selection: PrimaryCheckoutSelection) => void
}

type DetailState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; event: EventDetailView | null }

function toEventDetail(event: PublicEvent): EventDetailView {
  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : []
  const address = [event.location.address, event.location.ward?.name, event.location.province.name].filter(Boolean).join(', ')
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000))
  const tones: readonly EventPosterTone[] = ['yellow', 'mint', 'blue', 'coral']
  const toneIndex = [...event.id].reduce((total, character) => total + character.charCodeAt(0), 0) % tones.length

  return {
    id: event.id,
    title: event.title,
    category: event.category.name,
    date: start.toLocaleDateString('vi-VN'),
    venue: event.venueName ?? event.location.address,
    city: event.location.province.name,
    priceFrom: ticketTypes.length ? `Từ ${Math.min(...ticketTypes.map((ticket) => ticket.price)).toLocaleString('vi-VN')}đ` : 'Chưa mở bán',
    posterLabel: event.category.name.toLocaleUpperCase('vi-VN'),
    posterTone: tones[toneIndex],
    thumbnail: event.coverImage ?? event.thumbnail ?? undefined,
    organizerBio: event.organizerBio ?? undefined,
    organizerLogo: event.organizerLogo ?? undefined,
    seatingChartImage: event.seatMap?.imageUrl ?? undefined,
    startsAtLabel: start.toLocaleString('vi-VN'),
    endsAtLabel: end.toLocaleString('vi-VN'),
    descriptionHtml: event.description ?? undefined,
    address,
    description: event.description ?? 'Chưa có mô tả.',
    organizer: event.organizerName ?? 'Chưa cập nhật',
    doorsOpen: start.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    duration: `${duration} phút`,
    calendarSchedule: {
      startsAt: event.startAt,
      endsAt: event.endAt,
      timeZone: 'Asia/Ho_Chi_Minh',
    },
    schedule: [],
    notices: [],
    ticketTiers: ticketTypes.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: ticket.price,
      availabilityLabel: 'Theo thông tin vé của sự kiện',
      note: ticket.description ?? '',
      image: ticket.image ?? undefined,
      minPerOrder: ticket.minPerOrder,
      maxPerOrder: ticket.maxPerOrder,
      quantity: ticket.quantity,
      saleStartAt: ticket.saleStartAt,
      saleEndAt: ticket.saleEndAt,
      eventEndAt: event.endAt,
    })),
  }
}

export function EventDetailPage(props: Props) {
  return <EventDetailLoader key={props.eventId} {...props} />
}

function EventDetailLoader({ eventId, onNavigate, onStartCheckout }: Props) {
  const [state, setState] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const goBack = () => onNavigate('/')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data } = await eventApi.findPublicById(eventId)
        if (active) setState({ status: 'ready', event: toEventDetail(data.event) })
      } catch {
        if (active) setState({ status: 'error' })
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [eventId, attempt])

  if (state.status === 'loading')
    return (
      <p className="attendee-container py-16 text-center" role="status">
        Đang tải thông tin sự kiện...
      </p>
    )
  if (state.status === 'error')
    return (
      <div className="attendee-container py-16 text-center" role="alert">
        <p>Không thể tải thông tin sự kiện. Vui lòng thử lại.</p>
        <button
          type="button"
          className="mt-4 min-h-11 rounded-md bg-blue px-5 font-bold text-paper"
          onClick={() => {
            setState({ status: 'loading' })
            setAttempt((value) => value + 1)
          }}
        >
          Thử lại
        </button>
        <button type="button" className="ml-3 min-h-11 px-5 font-bold" onClick={goBack}>
          Quay lại khám phá
        </button>
      </div>
    )
  if (!state.event) return <EventNotFoundState onBack={goBack} />

  return <EventDetailContent event={state.event} onBack={goBack} onStartCheckout={onStartCheckout} />
}

//`EventDetailContent` vẫn cần thiết cho luồng mua vé: nó giữ lựa chọn hạng vé và số lượng, rồi gửi thông tin vé đã chọn lên luồng checkout qua `onStartCheckout`
function EventDetailContent({ event, onBack, onStartCheckout }: { event: EventDetailView; onBack: () => void; onStartCheckout: (selection: PrimaryCheckoutSelection) => void }) {
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
      unitPrice: Number(selection.selectedTier.price),
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
