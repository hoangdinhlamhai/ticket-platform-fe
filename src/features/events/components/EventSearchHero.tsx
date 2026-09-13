import type { ChangeEvent } from 'react'
import heroMockup from '../../../assets/hero.png'
import { SearchIcon } from '../../../components/icons/TicketlyIcons'
import type { EventCategory } from '../types/event'
import { EventCategoryFilter } from './EventCategoryFilter'
import { EventRecentSearches } from './EventRecentSearches'

type EventSearchHeroProps = {
  categories: readonly EventCategory[]
  eventCount: number
  onCategorySelect: (category: EventCategory) => void
  onQueryChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRecentSearchSelect: (query: string) => void
  query: string
  selectedCategory: EventCategory
}

export function EventSearchHero({
  categories,
  eventCount,
  onCategorySelect,
  onQueryChange,
  onRecentSearchSelect,
  query,
  selectedCategory,
}: EventSearchHeroProps) {
  return (
    <section className="relative overflow-hidden bg-pine text-paper" aria-labelledby="attendee-home-title">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="event-search-hero-track flex h-full w-[400%]">
          <img src={heroMockup} alt="" className="h-full w-1/4 shrink-0 object-cover object-center opacity-55" />
          <img src={heroMockup} alt="" className="h-full w-1/4 shrink-0 object-cover object-center opacity-55" />
          <img src={heroMockup} alt="" className="h-full w-1/4 shrink-0 object-cover object-center opacity-55" />
          <img src={heroMockup} alt="" className="h-full w-1/4 shrink-0 object-cover object-center opacity-55" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-pine/85" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 -right-24 z-10 h-72 w-72 rounded-full border-[1.4rem] border-coral" aria-hidden="true" />
      <div className="pointer-events-none absolute right-[29%] bottom-0 z-10 h-28 w-28 bg-mint [clip-path:polygon(50%_0,_100%_100%,_0_100%)]" aria-hidden="true" />

      <div className="relative z-20 attendee-container grid grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.75fr)] gap-12 pt-[clamp(3rem,7vw,6.25rem)] pb-[clamp(3.5rem,7vw,6.5rem)] max-[1100px]:block">
        <div className="min-w-0">
          <p className="m-0 text-[0.72rem] font-extrabold tracking-[0.12em] text-mint">VÉ TRONG TAY, VUI LÊN NGAY</p>
          <h1
            id="attendee-home-title"
            className="mt-4 mb-0 max-w-[42rem] font-body text-[clamp(3.1rem,7vw,6.3rem)] leading-[0.92] font-extrabold tracking-[-0.075em]"
          >
            Đêm nay,
            <br />
            bạn muốn đi đâu?
          </h1>
          <p className="mt-6 mb-0 max-w-[35rem] text-base leading-[1.65] text-story-copy">
            Ghim lại một cuộc hẹn, tìm chiếc vé phù hợp và để thành phố dẫn bạn đi.
          </p>

          <div className="mt-8 max-w-[38rem]" role="search">
            <label className="mb-2 block text-[0.82rem] font-bold text-paper" htmlFor="event-search">
              Tìm tên sự kiện, thể loại, địa điểm hoặc thành phố
            </label>
            <div className="flex min-h-[3.5rem] items-center rounded-md border border-story-copy/45 bg-surface px-3 text-ink focus-within:border-poster-yellow focus-within:shadow-[0_0_0_3px_var(--color-focus-ring)]">
              <SearchIcon className="mr-3 h-5 w-5 shrink-0 text-blue-deep" />
              <input
                id="event-search"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-ink outline-none placeholder:text-ink-soft"
                type="search"
                placeholder="Ví dụ: Vọng khúc, Âm nhạc, Nhà hát Thành phố"
                value={query}
                onChange={onQueryChange}
              />
            </div>
          </div>
          <EventRecentSearches onSelect={onRecentSearchSelect} />

          <EventCategoryFilter categories={categories} onSelect={onCategorySelect} selectedCategory={selectedCategory} />
        </div>

        <aside className="relative mt-auto rounded-lg border border-poster-yellow/70 bg-poster-yellow p-5 text-pine max-[1100px]:mt-10" aria-label="Tóm tắt kết quả khám phá">
          <p className="m-0 text-[0.67rem] font-extrabold tracking-[0.12em]">LỊCH CUỐI TUẦN</p>
          <strong className="mt-8 block font-body text-[clamp(4rem,10vw,7.5rem)] leading-[0.72] font-extrabold tracking-[-0.12em]">
            {eventCount}
          </strong>
          <p className="mt-2 mb-0 max-w-44 text-[0.9rem] leading-[1.45] font-bold">sự kiện đang chờ bạn khám phá</p>
          <span className="absolute right-4 bottom-4 rounded-sm bg-blue px-2 py-1 text-[0.68rem] font-extrabold tracking-[0.08em] text-paper">TICKETLY / 26</span>
        </aside>
      </div>
    </section>
  )
}
