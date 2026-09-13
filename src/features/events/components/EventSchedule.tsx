import type { EventScheduleItem } from '../types/event'

type EventScheduleProps = { schedule: readonly EventScheduleItem[] }

export function EventSchedule({ schedule }: EventScheduleProps) {
  return (
    <section className="mt-10" aria-labelledby="event-schedule-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-blue-deep">LỊCH TRÌNH MINH HỌA</p>
      <h2 id="event-schedule-title" className="mt-2 mb-0 font-body text-[2.3rem] leading-[0.95] font-extrabold tracking-[-0.065em]">Tối đó sẽ diễn ra thế nào?</h2>
      <ol className="mt-5 space-y-3 p-0">
        {schedule.map((item) => (
          <li key={`${item.time}-${item.title}`} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 rounded-lg border border-line/70 bg-surface p-4">
            <strong className="text-blue-deep">{item.time}</strong>
            <div><h3 className="m-0 text-base font-extrabold">{item.title}</h3><p className="mt-1 mb-0 text-sm leading-[1.55] text-ink-soft">{item.description}</p></div>
          </li>
        ))}
      </ol>
    </section>
  )
}
