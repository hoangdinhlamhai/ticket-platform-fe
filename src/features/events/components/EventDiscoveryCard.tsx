import { eventPosterAccentClasses, eventPosterToneClasses } from '../helpers/eventPosterStyles'
import type { MockEvent } from '../types/event'
import type { MouseEvent } from 'react'
import { ArrowUpRightIcon, CalendarIcon, HeartIcon, PinIcon } from '../../../components/icons/TicketlyIcons'

type EventDiscoveryCardProps = {
  event: MockEvent
  favoriteControlMode?: 'toggle' | 'informational'
  isFavorite: boolean
  onToggleFavorite: (event: MockEvent, isFavorite: boolean) => void
  onViewEvent: (event: MockEvent, clickEvent: MouseEvent<HTMLAnchorElement>) => void
}

export function EventDiscoveryCard({
  event,
  favoriteControlMode = 'toggle',
  isFavorite,
  onToggleFavorite,
  onViewEvent,
}: EventDiscoveryCardProps) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line/70 bg-surface">
      <div className={`relative aspect-[1.16] overflow-hidden p-4 ${eventPosterToneClasses[event.posterTone]}`}>
        <span className="relative z-[1] text-[0.65rem] font-extrabold tracking-[0.1em]">{event.posterLabel}</span>
        <div className={`absolute top-[19%] -right-[14%] h-40 w-40 rounded-full border-[1.2rem] ${eventPosterAccentClasses[event.posterTone]}`} aria-hidden="true" />
        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
          <h3 className="max-w-[70%] font-body text-[clamp(2.2rem,3.6vw,3.7rem)] leading-[0.78] font-extrabold tracking-[-0.1em]">
            {event.title}
          </h3>
          <span className="shrink-0 rounded-sm border border-current/70 px-2 py-1 text-[0.63rem] font-extrabold tracking-[0.08em]">{event.category}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.78rem] font-bold text-blue-deep">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {event.date}
            </p>
            <p className="mt-2 flex items-start gap-2 text-[0.78rem] leading-[1.45] text-ink-soft">
              <PinIcon className="mt-[0.05rem] h-4 w-4 shrink-0" />
              <span>{event.venue} · {event.city}</span>
            </p>
          </div>
          <button
            className={`grid min-h-11 min-w-11 shrink-0 place-items-center rounded-md border ${
              isFavorite ? 'border-coral/70 bg-coral text-paper' : 'border-line/70 bg-paper text-ink hover:border-coral/70 hover:text-coral-dark'
            }`}
            type="button"
            aria-label={favoriteControlMode === 'informational'
              ? `Thông tin sự kiện đã lưu ${event.title}`
              : isFavorite ? `Bỏ lưu sự kiện ${event.title}` : `Lưu sự kiện ${event.title}`}
            aria-pressed={favoriteControlMode === 'toggle' ? isFavorite : undefined}
            onClick={() => onToggleFavorite(event, isFavorite)}
          >
            <HeartIcon className="h-5 w-5" filled={isFavorite} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line/70 pt-4">
          <span className="text-[0.82rem] font-extrabold text-ink">{event.priceFrom}</span>
          <a
            className="flex min-h-11 items-center gap-2 rounded-md border border-blue-deep/60 bg-paper px-3 text-[0.78rem] font-extrabold text-blue-deep no-underline hover:bg-blue hover:text-paper"
            href={`/events/${event.id}`}
            onClick={(clickEvent) => onViewEvent(event, clickEvent)}
          >
            Xem vé
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  )
}
