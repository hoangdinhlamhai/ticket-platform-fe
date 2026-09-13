import { useMemo, useState } from 'react'
import type { AttendeePath } from '../../../app/routing/attendee-route'
import type { CustomerProfile } from '../../profile'
import type { OwnedTicket } from '../../tickets'
import { ResaleListingForm } from '../components/ResaleListingForm'
import { ResaleListingPreview } from '../components/ResaleListingPreview'
import { createResaleListing } from '../helpers/create-resale-listing'
import type { ResaleListing } from '../types/resale'
type Props = { ticketId: string; tickets: readonly OwnedTicket[]; profile: CustomerProfile; onPublish: (listing: ResaleListing) => void; onNavigate: (path: AttendeePath) => void }
export function CreateResaleListingPage({ ticketId, tickets, profile, onPublish, onNavigate }: Props) {
  const ticket = tickets.find((item) => item.id === ticketId)
  const [price, setPrice] = useState('450000')
  const [accepted, setAccepted] = useState(false)
  const preview = useMemo(() => ticket ? createResaleListing(ticket, Math.max(Number(price) || 1, 1), profile) : null, [price, profile, ticket])
  if (!ticket || ticket.resaleStatus !== 'eligible' || !preview) return <section className="px-6 py-24 text-center"><h1 className="font-body text-5xl font-extrabold">Vé này chưa thể đăng bán.</h1><p className="mt-4 text-ink-soft">Vé không tồn tại, đang được bán hoặc đã hoàn tất resale.</p><button className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/tickets')}>Quay lại vé của tôi</button></section>
  return <div className="py-[clamp(3rem,7vw,6rem)]"><div className="attendee-container"><header className="mb-8"><p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">SELLER RESALE MOCK</p><h1 className="mt-2 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">Đưa vé trở lại cộng đồng.</h1></header><div className="grid grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] gap-8 max-[1100px]:block"><ResaleListingForm ticket={ticket} price={price} accepted={accepted} onPriceChange={setPrice} onAcceptedChange={setAccepted} onSubmit={() => onPublish(createResaleListing(ticket, Number(price), profile))} /><div className="max-[1100px]:mt-7"><ResaleListingPreview listing={preview} /></div></div></div></div>
}
