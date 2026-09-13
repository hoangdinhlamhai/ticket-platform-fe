import type { MouseEvent } from 'react'
import type { MockEvent } from '../types/event'
import { EventDiscoveryCard } from './EventDiscoveryCard'

type SavedEventsGridProps = {
  events: readonly MockEvent[]
  onToggleFavorite: (event: MockEvent, isFavorite: boolean) => void
  onViewEvent: (event: MockEvent, clickEvent: MouseEvent<HTMLAnchorElement>) => void
}

export function SavedEventsGrid({ events, onToggleFavorite, onViewEvent }: SavedEventsGridProps) {
  return (
    <section className="py-[clamp(3.5rem,7vw,6.5rem)]" aria-labelledby="saved-events-grid-title">
      <div className="attendee-container">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="m-0 text-[0.72rem] font-extrabold tracking-[0.11em] text-coral-dark">LỊCH HẸN ĐÃ ĐÁNH DẤU</p>
            <h2 id="saved-events-grid-title" className="mt-2 mb-0 font-body text-[clamp(2.45rem,4vw,4.4rem)] leading-[0.84] font-extrabold tracking-[-0.09em] text-ink">
              Ba cuộc hẹn đang chờ bạn.
            </h2>
          </div>
          <p className="m-0 max-w-[24rem] text-[0.88rem] leading-[1.55] text-ink-soft">
            Danh sách minh họa giúp bạn hình dung nơi tập hợp những sự kiện muốn quay lại xem sau.
          </p>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-5 min-[769px]:grid-cols-2 min-[1101px]:grid-cols-3">
          {events.map((event) => (
            <EventDiscoveryCard
              key={event.id}
              event={event}
              favoriteControlMode="informational"
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onViewEvent={onViewEvent}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
