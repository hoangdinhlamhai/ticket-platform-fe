import { useMemo } from 'react'
import type { AttendeePath } from '../../../routes/attendee-route'
import { ResaleFilterPanel } from '../components/ResaleFilterPanel'
import { ResaleListingGrid } from '../components/ResaleListingGrid'
import { ResaleMarketplaceHero } from '../components/ResaleMarketplaceHero'
import { ResaleMarketplaceToolbar } from '../components/ResaleMarketplaceToolbar'
import { applyResaleSessionAvailability } from '../helpers/apply-resale-session-availability'
import { useResaleMarketplace } from '../hooks/use-resale-marketplace'
import type { ResaleListing } from '../types/resale'

type ResaleMarketplacePageProps = {
  completedListingIds: ReadonlySet<string>
  listings: readonly ResaleListing[]
  onNavigate: (path: AttendeePath) => void
}

export function ResaleMarketplacePage({ completedListingIds, listings: sourceListings, onNavigate }: ResaleMarketplacePageProps) {
  const listings = useMemo(
    () => sourceListings.filter((listing) => (listing.listingStatus ?? 'active') === 'active').map((listing) => applyResaleSessionAvailability(listing, completedListingIds)),
    [completedListingIds, sourceListings],
  )
  const marketplace = useResaleMarketplace(listings)

  return (
    <>
      <ResaleMarketplaceHero />
      <section className="py-[clamp(3.5rem,7vw,6.5rem)]" aria-label="Danh sách vé resale">
        <div className="attendee-container">
          <div className="mb-5 flex justify-end"><button className="min-h-11 rounded-md border border-blue-deep/50 bg-surface px-4 text-sm font-extrabold text-blue-deep" type="button" onClick={() => onNavigate('/resale/my-listings')}>Listing của tôi</button></div>
          <ResaleMarketplaceToolbar
            filters={marketplace.filters}
            resultCount={marketplace.filteredListings.length}
            setFilter={marketplace.setFilter}
          />
          <div className="mt-7 grid grid-cols-[17rem_minmax(0,1fr)] items-start gap-6 max-[1100px]:block">
            <ResaleFilterPanel
              cities={marketplace.cities}
              filters={marketplace.filters}
              hasActiveFilters={marketplace.hasActiveFilters}
              resetFilters={marketplace.resetFilters}
              setFilter={marketplace.setFilter}
              ticketTypes={marketplace.ticketTypes}
            />
            <div className="max-[1100px]:mt-6">
              <ResaleListingGrid listings={marketplace.filteredListings} onNavigate={onNavigate} resetFilters={marketplace.resetFilters} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
