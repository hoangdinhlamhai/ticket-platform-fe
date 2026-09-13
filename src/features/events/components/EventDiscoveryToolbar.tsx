import type { RefObject } from 'react'
import type { EventDiscoveryFilters, EventFilterChip, EventSortOption } from '../helpers/event-discovery-filter-state'

type EventDiscoveryToolbarProps = {
  activeFilterCount: number
  activeFilterChips: readonly EventFilterChip[]
  filters: EventDiscoveryFilters
  filterButtonRef: RefObject<HTMLButtonElement | null>
  onOpenMobileFilters: () => void
  onRemoveFilter: (id: EventFilterChip['id']) => void
  onResetFilters: () => void
  onSortChange: (sort: EventSortOption) => void
  resultCount: number
}

export function EventDiscoveryToolbar({ activeFilterCount, activeFilterChips, filterButtonRef, filters, onOpenMobileFilters, onRemoveFilter, onResetFilters, onSortChange, resultCount }: EventDiscoveryToolbarProps) {
  return (
    <div className="border-b border-line pb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[0.72rem] font-extrabold tracking-[0.11em] text-coral-dark">ĐIỂM HẸN ĐÁNG CHỜ</p>
          <h2 id="discover-events-title" className="mt-2 mb-0 font-body text-[clamp(2.45rem,4vw,4.4rem)] leading-[0.84] font-extrabold tracking-[-0.09em] text-ink">Khám phá sự kiện.</h2>
          <p className="mt-3 mb-0 text-sm font-bold text-ink-soft"><strong className="text-ink">{resultCount}</strong> sự kiện phù hợp</p>
        </div>
        <div className="flex items-end gap-3 mobile:w-full">
          <button ref={filterButtonRef} className="block min-h-12 flex-1 rounded-md border border-blue-deep/50 bg-surface px-4 text-sm font-extrabold text-blue-deep min-[1101px]:hidden" type="button" aria-haspopup="dialog" onClick={onOpenMobileFilters}>Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</button>
          <label className="mobile:flex-1">
            <span className="mb-2 block text-xs font-extrabold tracking-[0.08em] text-blue-deep">SẮP XẾP</span>
            <select className="min-h-12 w-full rounded-md border border-line bg-surface px-3 text-sm font-bold text-ink" value={filters.sort} onChange={(event) => onSortChange(event.target.value as EventSortOption)}>
              <option value="date-asc">Ngày gần nhất</option>
              <option value="price-asc">Giá thấp trước</option>
              <option value="price-desc">Giá cao trước</option>
              <option value="popularity">Phổ biến nhất</option>
            </select>
          </label>
        </div>
      </div>
      {activeFilterChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang chọn">
          {activeFilterChips.map((chip) => (
            <button key={chip.id} className="min-h-9 rounded-full border border-blue-deep/25 bg-mint px-3 text-xs font-extrabold text-pine hover:border-blue-deep" type="button" aria-label={`Bỏ bộ lọc ${chip.label}`} onClick={() => onRemoveFilter(chip.id)}>{chip.label} <span aria-hidden="true">×</span></button>
          ))}
          <button className="min-h-9 px-2 text-xs font-extrabold text-coral-dark underline underline-offset-4" type="button" onClick={onResetFilters}>Xóa tất cả</button>
        </div>
      )}
    </div>
  )
}
