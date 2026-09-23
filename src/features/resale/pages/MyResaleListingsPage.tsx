import type { AttendeePath } from '../../../routes/attendee-route'
import { MyResaleListingCard } from '../components/MyResaleListingCard'
import type { ResaleListing } from '../types/resale'
type Props = { listings: readonly ResaleListing[]; onNavigate: (path: AttendeePath) => void; onWithdraw: (id: string) => void }
export function MyResaleListingsPage({ listings, onNavigate, onWithdraw }: Props) {
  const mine = listings.filter((listing) => listing.ownerLabel === 'current-profile')
  return <section className="bg-paper-deep py-[clamp(3.5rem,7vw,6rem)]"><div className="attendee-container"><header className="mb-7"><p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">SELLER DASHBOARD</p><h1 className="mt-2 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">Listing của tôi.</h1><p className="mt-4 text-ink-soft">Theo dõi listing đang bán, đã bán và đã rút trong phiên này.</p></header><div className="space-y-4">{mine.map((listing) => <MyResaleListingCard key={listing.id} listing={listing} onNavigate={onNavigate} onWithdraw={onWithdraw} />)}{mine.length === 0 && <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center"><h2 className="text-2xl font-extrabold">Chưa có listing của bạn.</h2><button className="mt-5 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper" type="button" onClick={() => onNavigate('/tickets')}>Chọn vé để đăng bán</button></div>}</div></div></section>
}
