import type { TicketJourneyItem } from '../types/ticket'

type TicketJourneyTimelineProps = { journey: readonly TicketJourneyItem[] }

const stateClasses = {
  complete: 'border-success bg-mint text-success',
  current: 'border-blue bg-google-hover text-blue-deep',
  future: 'border-line bg-paper text-ink-soft',
}

export function TicketJourneyTimeline({ journey }: TicketJourneyTimelineProps) {
  return (
    <section className="mt-10" aria-labelledby="ticket-journey-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-blue-deep">HÀNH TRÌNH CỦA VÉ</p>
      <h2 id="ticket-journey-title" className="mt-2 mb-0 font-body text-[2.3rem] leading-[0.95] font-extrabold tracking-[-0.065em]">Tiếp theo sẽ là gì?</h2>
      <ol className="mt-5 space-y-3 p-0">
        {journey.map((item, index) => (
          <li key={item.label} className={`grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 rounded-lg border p-4 ${stateClasses[item.state]}`}>
            <span className="grid h-10 w-10 place-items-center rounded-md border border-current/30 font-extrabold" aria-hidden="true">{index + 1}</span>
            <div><h3 className="m-0 text-base font-extrabold">{item.label}</h3><p className="mt-1 mb-0 text-sm leading-[1.55] opacity-80">{item.detail}</p></div>
          </li>
        ))}
      </ol>
    </section>
  )
}
