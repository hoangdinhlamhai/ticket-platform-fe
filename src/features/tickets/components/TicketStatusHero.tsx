import { CalendarIcon, PinIcon, TicketIcon } from '../../../components/icons/TicketlyIcons'
import type { OwnedTicket } from '../types/ticket'

type TicketStatusHeroProps = { onBack: () => void; ticket: OwnedTicket }

export function TicketStatusHero({ onBack, ticket }: TicketStatusHeroProps) {
  return (
    <section className="bg-pine py-[clamp(3rem,6vw,5rem)] text-paper" aria-labelledby="ticket-status-title">
      <div className="attendee-container">
        <button className="min-h-11 rounded-md border border-story-copy/35 bg-transparent px-4 text-sm font-bold text-paper hover:border-mint hover:text-mint" type="button" onClick={onBack}>← Về danh sách vé</button>
        <div className="mt-6 grid grid-cols-[minmax(17rem,0.65fr)_minmax(0,1.35fr)] gap-8 max-[1100px]:block">
          <div className="relative min-h-[22rem] overflow-hidden rounded-lg bg-blue p-6">
            <div className="absolute -top-14 -right-12 h-52 w-52 rounded-full border-[1.35rem] border-poster-yellow" aria-hidden="true" />
            <TicketIcon className="relative h-12 w-12 text-poster-yellow" />
            <p className="relative mt-20 mb-0 text-xs font-extrabold tracking-[0.11em] text-mint">TICKETLY / STATUS</p>
            <strong className="relative mt-3 block font-body text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.84] font-extrabold tracking-[-0.085em]">{ticket.status}</strong>
            <span className="absolute right-6 bottom-6 left-6 rounded-sm border border-mint/50 px-2 py-1 text-xs font-extrabold tracking-[0.08em] text-mint">{ticket.referenceCode}</span>
          </div>
          <div className="pt-2 max-[1100px]:mt-8">
            <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-poster-yellow">VÉ CỦA {ticket.holderName.toUpperCase()}</p>
            <h1 id="ticket-status-title" className="mt-4 mb-0 font-body text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] font-extrabold tracking-[-0.075em]">{ticket.eventTitle}</h1>
            <p className="mt-5 mb-0 text-base font-bold text-story-copy">{ticket.ticketType}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm mobile:grid-cols-1">
              <p className="m-0 flex items-center gap-3 rounded-md border border-story-copy/25 p-4"><CalendarIcon className="h-5 w-5 shrink-0 text-poster-yellow" />{ticket.date}</p>
              <p className="m-0 flex items-start gap-3 rounded-md border border-story-copy/25 p-4"><PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-poster-yellow" /><span>{ticket.venue}<br /><span className="text-story-copy">{ticket.address}</span></span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
