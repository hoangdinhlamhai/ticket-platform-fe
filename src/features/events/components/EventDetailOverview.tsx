import type { MockEventDetail } from '../types/event'

type EventDetailOverviewProps = { event: MockEventDetail }

export function EventDetailOverview({ event }: EventDetailOverviewProps) {
  return (
    <section aria-labelledby="event-overview-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">THÔNG TIN SỰ KIỆN</p>
      <h2 id="event-overview-title" className="mt-2 mb-0 font-body text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.9] font-extrabold tracking-[-0.075em]">Một cuộc hẹn đáng để đến sớm.</h2>
      <p className="mt-5 mb-0 text-[0.95rem] leading-[1.75] text-ink-soft">{event.description}</p>
      <dl className="mt-6 grid grid-cols-3 gap-3 mobile:grid-cols-1">
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">BAN TỔ CHỨC</dt><dd className="mt-2 ml-0 font-bold">{event.organizer}</dd></div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">MỞ CỬA</dt><dd className="mt-2 ml-0 font-bold">{event.doorsOpen}</dd></div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">THỜI LƯỢNG</dt><dd className="mt-2 ml-0 font-bold">{event.duration}</dd></div>
      </dl>
      <div className="mt-7 rounded-lg bg-paper-deep p-5">
        <h3 className="m-0 text-lg font-extrabold">Lưu ý trước khi tham dự</h3>
        <ul className="mt-3 mb-0 space-y-2 pl-5 text-sm leading-[1.6] text-ink-soft">
          {event.notices.map((notice) => <li key={notice}>{notice}</li>)}
        </ul>
      </div>
    </section>
  )
}
