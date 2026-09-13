import { useRef } from 'react'
import type { AttendeePath } from '../../../app/routing/attendee-route'
import type { CustomerProfile } from '../../profile'
import { applyResaleSessionAvailability } from '../helpers/apply-resale-session-availability'
import { getResaleListingById } from '../helpers/get-resale-listing-by-id'
import { useResaleCheckout } from '../hooks/use-resale-checkout'
import type { ResaleBuyer, ResaleCheckoutCompletion, ResaleCheckoutField, ResaleListing } from '../types/resale'
import { ResaleBuyerForm } from '../components/ResaleBuyerForm'
import { ResaleCheckoutSteps } from '../components/ResaleCheckoutSteps'
import { ResalePurchaseSummary } from '../components/ResalePurchaseSummary'
import { ResaleVietQrPanel } from '../components/ResaleVietQrPanel'

type ResaleCheckoutPageProps = {
  completedListingIds: ReadonlySet<string>
  listingId: string
  listings: readonly ResaleListing[]
  onComplete: (completion: ResaleCheckoutCompletion) => void
  onNavigate: (path: AttendeePath) => void
  profile: CustomerProfile
}

type CheckoutContentProps = {
  initialBuyer: ResaleBuyer
  listing: ResaleListing
  onComplete: (completion: ResaleCheckoutCompletion) => void
  onNavigate: (path: AttendeePath) => void
}

function ResaleCheckoutContent({ initialBuyer, listing, onComplete, onNavigate }: CheckoutContentProps) {
  const checkout = useResaleCheckout({ initialBuyer, listing, onComplete })
  const buyerRefs = useRef<(HTMLInputElement | null)[]>([])
  const termsRef = useRef<HTMLInputElement>(null)
  const focusField = (field: ResaleCheckoutField) => {
    const index = { fullName: 0, email: 1, phone: 2 }[field as keyof ResaleBuyer]
    if (typeof index === 'number') buyerRefs.current[index]?.focus()
    else termsRef.current?.focus()
  }
  const submit = () => {
    const firstInvalidField = checkout.submit()
    if (firstInvalidField) window.requestAnimationFrame(() => focusField(firstInvalidField))
  }

  return (
    <div className="py-[clamp(3rem,6vw,5.5rem)]">
      <div className="attendee-container">
        <ResaleCheckoutSteps current="payment" />
        <div className="mt-10 grid grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block">
          <div className="space-y-8">
            <ResaleBuyerForm ref={buyerRefs} buyer={checkout.draft} errors={checkout.errors} onChange={checkout.updateBuyerField} />
            <ResaleVietQrPanel ref={termsRef} acceptedTerms={checkout.draft.acceptedTerms} amount={listing.price} error={checkout.errors.acceptedTerms} onAcceptedTermsChange={checkout.setAcceptedTerms} transferContent={checkout.transferContent} />
          </div>
          <div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-8">
            <ResalePurchaseSummary listing={listing} />
            <button className="mt-4 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper hover:bg-coral-dark disabled:cursor-wait disabled:opacity-60" type="button" disabled={checkout.isProcessing} onClick={submit}>
              {checkout.isProcessing ? 'Đang xác nhận minh họa…' : 'Tôi đã chuyển khoản'}
            </button>
            <p className="mt-3 mb-0 text-center text-xs leading-[1.5] text-ink-soft" aria-live="polite">{checkout.isProcessing ? 'Hệ thống đang tạo order mock và credential mới.' : 'Nút này không kiểm tra giao dịch ngân hàng thật.'}</p>
            <button className="mt-3 min-h-11 w-full text-sm font-extrabold text-blue-deep" type="button" disabled={checkout.isProcessing} onClick={() => onNavigate(`/resale/${listing.id}`)}>Quay lại xem vé</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResaleCheckoutPage({ completedListingIds, listingId, listings, onComplete, onNavigate, profile }: ResaleCheckoutPageProps) {
  const storedListing = getResaleListingById(listings, listingId)
  const listing = storedListing ? applyResaleSessionAvailability(storedListing, completedListingIds) : undefined
  if (!listing || listing.availability !== 'available') {
    return (
      <section className="px-6 py-[clamp(5rem,10vw,9rem)] text-center mobile:px-5">
        <h1 className="m-0 font-body text-[clamp(2.8rem,6vw,5rem)] leading-[0.84] font-extrabold tracking-[-0.095em]">Không thể mở checkout này.</h1>
        <p className="mx-auto mt-5 mb-0 max-w-[38rem] text-base leading-[1.6] text-ink-soft">Listing không tồn tại hoặc đã có người khác nhận. Không có order nào được tạo.</p>
        <button className="mt-7 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/resale')}>Quay lại chợ resale</button>
      </section>
    )
  }

  return <ResaleCheckoutContent key={listing.id} initialBuyer={{ fullName: profile.fullName, email: profile.email, phone: profile.phone }} listing={listing} onComplete={onComplete} onNavigate={onNavigate} />
}
