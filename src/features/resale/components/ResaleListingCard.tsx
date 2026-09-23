import type { MouseEvent } from 'react'
import { ArrowUpRightIcon, CalendarIcon, PinIcon } from '../../../components/icons/TicketlyIcons'
import { shouldUseClientNavigation, type AttendeePath } from '../../../routes/attendee-route'
import { formatResaleDateTime } from '../helpers/format-resale-date-time'
import { formatResalePrice } from '../helpers/format-resale-price'
import type { ResaleListing, ResalePosterTone } from '../types/resale'

const posterClasses: Record<ResalePosterTone, string> = {
  yellow: 'bg-poster-yellow text-pine',
  mint: 'bg-mint text-pine',
  blue: 'bg-blue text-paper',
  coral: 'bg-coral text-paper',
}

const posterAccentClasses: Record<ResalePosterTone, string> = {
  yellow: 'border-coral',
  mint: 'border-blue',
  blue: 'border-poster-yellow',
  coral: 'border-pine',
}

type ResaleListingCardProps = {
  listing: ResaleListing
  onNavigate: (path: AttendeePath) => void
}

export function ResaleListingCard({ listing, onNavigate }: ResaleListingCardProps) {
  const seatLabel = listing.seatingType === 'assigned'
    ? `${listing.section} · ${listing.row ? `Hàng ${listing.row} · ` : ''}Ghế ${listing.seats.join(', ')}`
    : listing.section

  const openListing = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(event)) return
    event.preventDefault()
    onNavigate(`/resale/${listing.id}`)
  }

  return (
    <article className="group grid min-w-0 grid-cols-[minmax(9.5rem,0.72fr)_minmax(0,1.28fr)] overflow-hidden rounded-lg border border-line/70 bg-surface mobile:block">
      <div className={`relative min-h-64 overflow-hidden p-4 ${posterClasses[listing.posterTone]}`}>
        <p className="m-0 text-[0.65rem] font-extrabold tracking-[0.1em]">RESALE · {listing.city.toLocaleUpperCase('vi')}</p>
        <div className={`absolute -right-12 -bottom-10 h-40 w-40 rounded-full border-[1.25rem] ${posterAccentClasses[listing.posterTone]}`} aria-hidden="true" />
        <p className="absolute right-4 bottom-4 left-4 m-0 font-body text-[clamp(2rem,3.4vw,3.45rem)] leading-[0.8] font-extrabold tracking-[-0.09em]">{listing.eventTitle}</p>
      </div>
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className={`rounded-sm border px-2 py-1 text-[0.65rem] font-extrabold tracking-[0.07em] ${listing.availability === 'available' ? 'border-success/40 bg-mint text-success' : 'border-error/30 bg-error-ring text-error'}`}>
            {listing.availability === 'available' ? 'ĐANG CÓ SẴN' : 'ĐÃ CÓ NGƯỜI NHẬN'}
          </span>
          <strong className="text-lg font-extrabold tabular-nums text-blue-deep">{formatResalePrice(listing.price)}</strong>
        </div>
        <div className="mt-5 space-y-3">
          <p className="m-0 flex items-start gap-2 text-sm font-bold text-ink"><CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-dark" />{formatResaleDateTime(listing.startsAt)}</p>
          <p className="m-0 flex items-start gap-2 text-sm leading-[1.5] text-ink-soft"><PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-dark" />{listing.venue} · {listing.city}</p>
          <p className="m-0 text-sm leading-[1.5] text-ink-soft"><strong className="text-ink">{listing.ticketType}</strong> · {seatLabel}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-5">
          <p className="m-0 text-xs leading-[1.45] text-ink-soft">Người bán <strong className="text-ink">{listing.seller.name}</strong><br />{listing.seller.verified ? 'Đã xác minh danh tính' : 'Hồ sơ mới trong cộng đồng'}</p>
          <a className="flex min-h-11 items-center gap-2 rounded-md border border-blue-deep/60 bg-paper px-3 text-sm font-extrabold text-blue-deep no-underline transition-colors hover:bg-blue hover:text-paper" href={`/resale/${listing.id}`} onClick={openListing}>Xem vé <ArrowUpRightIcon className="h-4 w-4" /></a>
        </div>
      </div>
    </article>
  )
}
