import type { MouseEvent } from 'react'
import { CalendarIcon, TicketIcon } from '../../../components/icons/TicketlyIcons'
import { shouldUseClientNavigation, type AttendeePath } from '../../../app/routing/attendee-route'
import { getTicketProfileSummary, type OwnedTicket } from '../../tickets'

type ProfileTicketOverviewProps = {
  onNavigate: (path: AttendeePath) => void
  tickets: readonly OwnedTicket[]
}

export function ProfileTicketOverview({ onNavigate, tickets }: ProfileTicketOverviewProps) {
  const summary = getTicketProfileSummary(tickets)
  const viewAllTickets = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(event)) return
    event.preventDefault()
    onNavigate('/tickets')
  }

  return (
    <section className="rounded-lg bg-pine p-6 text-paper mobile:p-4" aria-labelledby="profile-tickets-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-mint">VÉ CỦA BẠN</p>
          <h2 id="profile-tickets-title" className="mt-2 mb-0 font-body text-2xl font-extrabold tracking-[-0.05em]">Tổng quan hành trình</h2>
        </div>
        <TicketIcon className="h-9 w-9 text-poster-yellow" />
      </div>
      <div className="my-6 grid grid-cols-3 gap-2">
        {[
          ['Sắp tới', summary.upcomingCount],
          ['Đã dùng', summary.usedCount],
          ['Đang bán', summary.resaleCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-paper/15 bg-paper/5 p-3">
            <strong className="block text-2xl text-poster-yellow">{value}</strong>
            <span className="text-[0.68rem] text-story-copy">{label}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {summary.recentTickets.map((ticket) => (
          <article key={ticket.id} className="rounded-md border border-paper/15 p-3">
            <strong className="block text-sm">{ticket.eventTitle}</strong>
            <span className="mt-2 flex items-center gap-2 text-[0.72rem] text-story-copy"><CalendarIcon className="h-4 w-4" />{ticket.date}</span>
          </article>
        ))}
        {summary.recentTickets.length === 0 ? <p className="text-sm text-story-copy">Chưa có vé phù hợp.</p> : null}
      </div>
      <a className="mt-5 inline-flex min-h-11 items-center rounded-md border border-mint/60 px-4 text-sm font-extrabold text-mint no-underline hover:bg-mint hover:text-pine" href="/tickets" onClick={viewAllTickets}>Xem tất cả vé</a>
    </section>
  )
}
