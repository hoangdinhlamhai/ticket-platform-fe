import { CalendarIcon, PinIcon } from '../../../components/icons/TicketlyIcons'
import { formatResaleDateTime } from '../helpers/format-resale-date-time'
import type { ResaleListing, ResalePosterTone } from '../types/resale'

const toneClasses: Record<ResalePosterTone, string> = {
  yellow: 'bg-poster-yellow text-pine',
  mint: 'bg-mint text-pine',
  blue: 'bg-blue text-paper',
  coral: 'bg-coral text-paper',
}

type ResaleListingHeroProps = {
  listing: ResaleListing
}

export function ResaleListingHero({ listing }: ResaleListingHeroProps) {
  return (
    <section className={`relative overflow-hidden py-[clamp(3.5rem,8vw,7rem)] ${toneClasses[listing.posterTone]}`}>
      <div className="absolute -top-20 -right-16 h-72 w-72 rounded-full border-[2rem] border-current opacity-20" aria-hidden="true" />
      <div className="relative attendee-container">
        <p className="m-0 text-xs font-extrabold tracking-[0.12em]">RESALE · {listing.ticketType.toLocaleUpperCase('vi')}</p>
        <h1 className="mt-5 mb-0 max-w-[68rem] font-body text-[clamp(3.4rem,8vw,8rem)] leading-[0.77] font-extrabold tracking-[-0.105em]">{listing.eventTitle}</h1>
        <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 text-sm font-bold">
          <span className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" />{formatResaleDateTime(listing.startsAt)}</span>
          <span className="flex items-center gap-2"><PinIcon className="h-5 w-5" />{listing.venue} · {listing.city}</span>
        </div>
      </div>
    </section>
  )
}
