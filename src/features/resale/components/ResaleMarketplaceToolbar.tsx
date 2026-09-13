import { SearchIcon } from '../../../components/icons/TicketlyIcons'
import type { ResaleMarketplaceFilters, ResaleSortOption } from '../types/resale'

type ResaleMarketplaceToolbarProps = {
  filters: ResaleMarketplaceFilters
  resultCount: number
  setFilter: <K extends keyof ResaleMarketplaceFilters>(field: K, value: ResaleMarketplaceFilters[K]) => void
}

export function ResaleMarketplaceToolbar({ filters, resultCount, setFilter }: ResaleMarketplaceToolbarProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <label className="min-w-[min(100%,28rem)] flex-1">
        <span className="mb-2 block text-xs font-extrabold tracking-[0.08em] text-blue-deep">TÌM TRONG CHỢ VÉ</span>
        <span className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-surface px-4 focus-within:border-blue focus-within:ring-3 focus-within:ring-focus-ring">
          <SearchIcon className="h-5 w-5 shrink-0 text-ink-soft" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none"
            type="search"
            value={filters.query}
            placeholder="Sự kiện, địa điểm hoặc người bán"
            onChange={(event) => setFilter('query', event.target.value)}
          />
        </span>
      </label>
      <div className="flex min-w-[15rem] items-end gap-4 mobile:w-full mobile:flex-wrap">
        <p className="m-0 pb-3 text-sm font-bold text-ink-soft"><strong className="text-ink">{resultCount}</strong> listing</p>
        <label className="ml-auto mobile:flex-1">
          <span className="mb-2 block text-xs font-extrabold tracking-[0.08em] text-blue-deep">SẮP XẾP</span>
          <select
            className="min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base font-bold text-ink"
            value={filters.sort}
            onChange={(event) => setFilter('sort', event.target.value as ResaleSortOption)}
          >
            <option value="relevance">Phù hợp nhất</option>
            <option value="price-asc">Giá thấp trước</option>
            <option value="price-desc">Giá cao trước</option>
            <option value="event-date">Sự kiện gần nhất</option>
          </select>
        </label>
      </div>
    </div>
  )
}
