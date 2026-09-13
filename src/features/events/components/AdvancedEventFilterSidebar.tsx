import type { EventDiscoveryFilters } from '../helpers/event-discovery-filter-state'
import { AdvancedEventFilterControls } from './AdvancedEventFilterControls'

type AdvancedEventFilterSidebarProps = {
  filters: EventDiscoveryFilters
  hasActiveFilters: boolean
  onChange: <K extends keyof EventDiscoveryFilters>(field: K, value: EventDiscoveryFilters[K]) => void
  onReset: () => void
}

export function AdvancedEventFilterSidebar({ filters, hasActiveFilters, onChange, onReset }: AdvancedEventFilterSidebarProps) {
  return (
    <aside className="hidden self-start rounded-lg border border-line/70 bg-paper-deep p-5 min-[1101px]:block" aria-labelledby="advanced-event-filter-title">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-line pb-4">
        <div><p className="m-0 text-[0.68rem] font-extrabold tracking-[0.1em] text-coral-dark">THU HẸP LỰA CHỌN</p><h2 id="advanced-event-filter-title" className="mt-1 mb-0 text-xl font-extrabold tracking-[-0.045em]">Bộ lọc</h2></div>
        <button className="text-xs font-extrabold text-blue-deep underline decoration-blue-deep/30 underline-offset-4 disabled:opacity-40" type="button" disabled={!hasActiveFilters} onClick={onReset}>Đặt lại</button>
      </div>
      <AdvancedEventFilterControls filters={filters} onChange={onChange} />
    </aside>
  )
}
