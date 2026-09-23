import type { MouseEvent } from 'react'
import { ArrowUpRightIcon, TicketIcon } from '../../../components/icons/TicketlyIcons'
import { shouldUseClientNavigation, type AttendeePath } from '../../../routes/attendee-route'
import { applyResaleSessionAvailability } from '../helpers/apply-resale-session-availability'
import { getResaleListingById } from '../helpers/get-resale-listing-by-id'
import type { ResaleListing } from '../types/resale'
import { ResaleListingHero } from '../components/ResaleListingHero'
import { ResalePurchaseSummary } from '../components/ResalePurchaseSummary'
import { ResaleSellerCard } from '../components/ResaleSellerCard'
import { ResaleTicketDetails } from '../components/ResaleTicketDetails'

type ResaleListingPageProps = {
  completedListingIds: ReadonlySet<string>
  listingId: string
  listings: readonly ResaleListing[]
  onNavigate: (path: AttendeePath) => void
}

export function ResaleListingPage({ completedListingIds, listingId, listings, onNavigate }: ResaleListingPageProps) {
  const storedListing = getResaleListingById(listings, listingId)
  const listing = storedListing ? applyResaleSessionAvailability(storedListing, completedListingIds) : undefined
  const goToMarketplace = (event?: MouseEvent<HTMLAnchorElement>) => {
    if (event && !shouldUseClientNavigation(event)) return
    event?.preventDefault()
    onNavigate('/resale')
  }

  if (!listing) {
    return (
      <section className="px-6 py-[clamp(5rem,10vw,9rem)] mobile:px-5">
        <div className="mx-auto max-w-[46rem] rounded-lg border border-line bg-surface p-8 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-coral" />
          <h1 className="mt-5 mb-0 font-body text-[clamp(2.8rem,6vw,5rem)] leading-[0.84] font-extrabold tracking-[-0.095em]">Listing này không còn ở đây.</h1>
          <p className="mx-auto mt-5 mb-0 max-w-[34rem] text-base leading-[1.65] text-ink-soft">Đường dẫn có thể đã cũ hoặc listing mock không tồn tại. Quay lại chợ để xem những chỗ đang có sẵn.</p>
          <button className="mt-7 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper hover:bg-blue-deep" type="button" onClick={() => goToMarketplace()}>Quay lại chợ resale</button>
        </div>
      </section>
    )
  }

  return (
    <>
      <div className="border-b border-line bg-paper py-4">
        <div className="attendee-container">
          <a className="inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-blue-deep" href="/resale" onClick={goToMarketplace}>← Quay lại chợ resale</a>
        </div>
      </div>
      <ResaleListingHero listing={listing} />
      <div className="py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="attendee-container grid grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block">
          <div>
            <ResaleTicketDetails listing={listing} />
            <ResaleSellerCard seller={listing.seller} />
            <section className="mt-8 overflow-hidden rounded-lg bg-blue p-6 text-paper" aria-labelledby="buyer-protection-title">
              <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-mint">BẢO VỆ NGƯỜI MUA · MOCK FLOW</p>
              <h2 id="buyer-protection-title" className="mt-3 mb-0 font-body text-[clamp(2.25rem,4vw,3.6rem)] leading-[0.85] font-extrabold tracking-[-0.09em]">Credential cũ dừng lại. Vé mới bắt đầu từ bạn.</h2>
              <p className="mt-5 mb-0 max-w-[42rem] text-sm leading-[1.7] text-story-copy">Sau xác nhận thanh toán minh họa, flow sẽ mô phỏng việc vô hiệu thông tin xác thực cũ và phát hành credential mới cho người mua.</p>
            </section>
          </div>
          <div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-8">
            {listing.ownerLabel === 'current-profile' && <p className="mb-3 rounded-md border border-coral/40 bg-paper-deep px-4 py-3 text-center text-sm font-extrabold text-coral-dark">LISTING CỦA BẠN · VẪN CÓ THỂ MUA ĐỂ DEMO</p>}
            <ResalePurchaseSummary listing={listing} onNavigate={onNavigate} showAction />
            {listing.listingStatus === 'withdrawn' && <p className="mt-3 rounded-md bg-paper-deep px-4 py-3 text-center text-sm font-bold text-coral-dark">Bạn đã rút listing này khỏi marketplace.</p>}
            <a className="mt-4 flex min-h-11 items-center justify-center gap-2 text-sm font-extrabold text-blue-deep" href="/resale" onClick={goToMarketplace}>Xem listing khác <ArrowUpRightIcon className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </>
  )
}
