import type { AttendeePath } from '../../../app/routing/attendee-route'
import type { ResaleListing } from '../types/resale'
import { ResaleListingCard } from './ResaleListingCard'

type ResaleListingGridProps = {
  listings: readonly ResaleListing[]
  onNavigate: (path: AttendeePath) => void
  resetFilters: () => void
}

export function ResaleListingGrid({ listings, onNavigate, resetFilters }: ResaleListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-paper-deep px-6 py-14 text-center">
        <p className="m-0 font-body text-[clamp(2rem,4vw,3.25rem)] leading-[0.9] font-extrabold tracking-[-0.08em] text-ink">Chưa tìm thấy chỗ ngồi phù hợp.</p>
        <p className="mx-auto mt-4 mb-0 max-w-[34rem] text-base leading-[1.6] text-ink-soft">Thử mở rộng ngày, khoảng giá hoặc thành phố để xem thêm listing mock.</p>
        <button className="mt-6 min-h-11 rounded-md bg-blue px-5 text-sm font-extrabold text-paper hover:bg-blue-deep" type="button" onClick={resetFilters}>Xóa bộ lọc</button>
      </div>
    )
  }

  return <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,29rem),1fr))] gap-5">{listings.map((listing) => <ResaleListingCard key={listing.id} listing={listing} onNavigate={onNavigate} />)}</div>
}
