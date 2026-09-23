import type { MouseEvent } from 'react'
import { ArrowUpRightIcon } from '../../../components/icons/TicketlyIcons'
import { shouldUseClientNavigation, type AttendeePath } from '../../../routes/attendee-route'
import { formatResalePrice } from '../helpers/format-resale-price'
import type { ResaleListing } from '../types/resale'

type ResalePurchaseSummaryProps = {
  listing: ResaleListing
  onNavigate?: (path: AttendeePath) => void
  showAction?: boolean
}

export function ResalePurchaseSummary({ listing, onNavigate, showAction = false }: ResalePurchaseSummaryProps) {
  const checkoutPath: AttendeePath = `/resale/${listing.id}/checkout`
  const openCheckout = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || !shouldUseClientNavigation(event)) return
    event.preventDefault()
    onNavigate(checkoutPath)
  }

  return (
    <aside className="rounded-lg border border-line/70 bg-pine p-5 text-paper" aria-labelledby="resale-summary-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-mint">TÓM TẮT LISTING</p>
      <h2 id="resale-summary-title" className="mt-2 mb-0 font-body text-[2.25rem] leading-[0.9] font-extrabold tracking-[-0.08em]">{listing.ticketType}</h2>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-story-copy">Số lượng</dt><dd className="m-0 font-bold">{listing.quantity} vé</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-story-copy">Khu vực</dt><dd className="m-0 text-right font-bold">{listing.section}</dd></div>
        {listing.seats.length > 0 && <div className="flex justify-between gap-4"><dt className="text-story-copy">Ghế</dt><dd className="m-0 font-bold">{listing.seats.join(', ')}</dd></div>}
      </dl>
      <div className="mt-6 border-t border-paper/25 pt-5">
        <p className="m-0 flex items-end justify-between gap-4"><span className="text-sm text-story-copy">Tổng trọn gói</span><strong className="text-2xl font-extrabold tabular-nums text-poster-yellow">{formatResalePrice(listing.price)}</strong></p>
        <p className="mt-2 mb-0 text-xs leading-[1.5] text-story-copy">Không cộng thêm phí ở bước checkout mock.</p>
      </div>
      {showAction && listing.availability === 'available' && (
        <a className="mt-6 flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-extrabold text-paper no-underline hover:bg-coral-dark" href={checkoutPath} onClick={openCheckout}>
          Tiếp tục mua <ArrowUpRightIcon className="h-4 w-4" />
        </a>
      )}
      {showAction && listing.availability === 'unavailable' && <p className="mt-6 mb-0 rounded-md bg-paper/10 px-4 py-3 text-sm font-bold text-story-copy">{listing.listingStatus === 'withdrawn' ? 'Listing này đã được người bán rút khỏi chợ.' : 'Listing này đã có người khác nhận.'}</p>}
    </aside>
  )
}
