import { CalendarIcon, PinIcon } from '../../../components/icons/TicketlyIcons'
import { eventPosterAccentClasses, eventPosterToneClasses } from '../helpers/eventPosterStyles'
import type { MockEventDetail } from '../types/event'

type EventDetailHeroProps = {
  event: MockEventDetail
  onBack: () => void
}

export function EventDetailHero({ event, onBack }: EventDetailHeroProps) {
  const dateRange = [event.startsAtLabel, event.endsAtLabel].filter(Boolean).join(' – ') || event.date
  return (
    <section className="bg-pine py-[clamp(3rem,6vw,5rem)] text-paper" aria-labelledby="event-detail-title">
      <div className="attendee-container">
        <button className="min-h-11 rounded-md border border-story-copy/35 bg-transparent px-4 text-sm font-bold text-paper hover:border-mint hover:text-mint" type="button" onClick={onBack}>
          ← Quay lại khám phá
        </button>
        <div className="mt-6 grid grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)] gap-8 max-[1100px]:block">
          {event.thumbnail ? (
            <img className="min-h-[25rem] h-full w-full rounded-lg object-cover" src={event.thumbnail} alt={`Hình ảnh sự kiện ${event.title}`} />
          ) : (
            <div className={`relative min-h-[25rem] overflow-hidden rounded-lg p-6 ${eventPosterToneClasses[event.posterTone]}`}>
              <span className="text-xs font-extrabold tracking-[0.12em]">{event.posterLabel}</span>
              <div className={`absolute top-[17%] -right-[10%] h-64 w-64 rounded-full border-[1.6rem] ${eventPosterAccentClasses[event.posterTone]}`} aria-hidden="true" />
              <p className="absolute right-6 bottom-6 left-6 m-0 font-body text-[clamp(3rem,7vw,6.5rem)] leading-[0.82] font-extrabold tracking-[-0.095em]">{event.title}</p>
            </div>
          )}
          <div className="pt-2 max-[1100px]:mt-8">
            <span className="inline-block rounded-sm border border-poster-yellow/70 bg-poster-yellow px-2 py-1 text-xs font-extrabold tracking-[0.08em] text-pine">{event.category}</span>
            <h1 id="event-detail-title" className="mt-5 mb-0 font-body text-[clamp(3rem,6vw,5.8rem)] leading-[0.9] font-extrabold tracking-[-0.075em]">{event.title}</h1>
            <p className="mt-6 mb-0 max-w-[42rem] text-base leading-[1.7] text-story-copy">{event.description}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm mobile:grid-cols-1">
              <p className="m-0 flex items-center gap-3 rounded-md border border-story-copy/25 p-4"><CalendarIcon className="h-5 w-5 shrink-0 text-poster-yellow" />{dateRange}</p>
              <p className="m-0 flex items-start gap-3 rounded-md border border-story-copy/25 p-4"><PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-poster-yellow" /><span>{event.venue}<br /><span className="text-story-copy">{event.address}</span></span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
