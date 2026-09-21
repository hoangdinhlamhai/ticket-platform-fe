import { sanitizeOrganizerHtml } from '../../organizer/helpers/sanitize-organizer-html'
import type { MockEventDetail } from '../types/event'

type EventDetailOverviewProps = { event: MockEventDetail }

export function EventDetailOverview({ event }: EventDetailOverviewProps) {
  const description = event.descriptionHtml ? sanitizeOrganizerHtml(event.descriptionHtml) : ''
  return (
    <section aria-labelledby="event-overview-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">THÔNG TIN SỰ KIỆN</p>
      <h2 id="event-overview-title" className="mt-2 mb-0 font-body text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.9] font-extrabold tracking-[-0.075em]">Về sự kiện</h2>
      {description ? <div className="mt-5 text-[0.95rem] leading-[1.75] text-ink-soft" dangerouslySetInnerHTML={{ __html: description }} /> : <p className="mt-5 mb-0 text-[0.95rem] leading-[1.75] text-ink-soft">{event.description}</p>}
      <dl className="mt-6 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">BAN TỔ CHỨC</dt><dd className="mt-2 ml-0 flex items-center gap-3 font-bold">{event.organizerLogo && <img className="h-10 w-10 rounded-full object-cover" src={event.organizerLogo} alt="" />}{event.organizer}</dd>{event.organizerBio && <dd className="mt-2 ml-0 text-sm leading-[1.6] text-ink-soft">{event.organizerBio}</dd>}</div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">THỜI LƯỢNG</dt><dd className="mt-2 ml-0 font-bold">{event.duration}</dd></div>
      </dl>
      {event.seatingChartImage && <figure className="mt-7 overflow-hidden rounded-lg border border-line/70 bg-surface p-4"><figcaption className="mb-3 text-xs font-extrabold tracking-[0.1em] text-ink-soft">SƠ ĐỒ CHỖ NGỒI</figcaption><img className="max-h-[28rem] w-full object-contain" src={event.seatingChartImage} alt={`Sơ đồ chỗ ngồi ${event.title}`} /></figure>}
    </section>
  )
}
