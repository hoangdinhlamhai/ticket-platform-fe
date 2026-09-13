import { useState } from 'react'
import type { ResaleMarketplaceFilters, ResalePriceBand, ResaleSeatingType } from '../types/resale'

type ResaleFilterPanelProps = {
  cities: readonly string[]
  filters: ResaleMarketplaceFilters
  hasActiveFilters: boolean
  resetFilters: () => void
  setFilter: <K extends keyof ResaleMarketplaceFilters>(field: K, value: ResaleMarketplaceFilters[K]) => void
  ticketTypes: readonly string[]
}

const controlClass = 'mt-2 min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink'

export function ResaleFilterPanel({ cities, filters, hasActiveFilters, resetFilters, setFilter, ticketTypes }: ResaleFilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <aside className="rounded-lg border border-line/70 bg-paper-deep p-4" aria-labelledby="resale-filter-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-[0.68rem] font-extrabold tracking-[0.1em] text-coral-dark">THU HẸP LỰA CHỌN</p>
          <h2 id="resale-filter-title" className="mt-1 mb-0 text-xl font-extrabold tracking-[-0.045em]">Bộ lọc</h2>
        </div>
        <button className="hidden min-h-11 rounded-md border border-line bg-surface px-3 text-sm font-extrabold mobile:block" type="button" aria-expanded={mobileOpen} aria-controls="resale-filter-controls" onClick={() => setMobileOpen((current) => !current)}>
          {mobileOpen ? 'Thu gọn' : 'Mở lọc'}
        </button>
      </div>
      <fieldset id="resale-filter-controls" className={`mt-5 space-y-5 border-0 p-0 ${mobileOpen ? '' : 'mobile:hidden'}`}>
        <legend className="sr-only">Lọc listing resale</legend>
        <label className="block text-sm font-bold text-ink-soft">Ngày tổ chức<input className={controlClass} type="date" value={filters.eventDate} onChange={(event) => setFilter('eventDate', event.target.value)} /></label>
        <label className="block text-sm font-bold text-ink-soft">Khoảng giá<select className={controlClass} value={filters.priceBand} onChange={(event) => setFilter('priceBand', event.target.value as ResalePriceBand)}><option value="all">Tất cả mức giá</option><option value="under-500k">Dưới 500.000đ</option><option value="500k-to-1m">500.000đ – 1.000.000đ</option><option value="over-1m">Trên 1.000.000đ</option></select></label>
        <label className="block text-sm font-bold text-ink-soft">Loại vé<select className={controlClass} value={filters.ticketType} onChange={(event) => setFilter('ticketType', event.target.value)}><option value="">Tất cả loại vé</option>{ticketTypes.map((ticketType) => <option key={ticketType} value={ticketType}>{ticketType}</option>)}</select></label>
        <label className="block text-sm font-bold text-ink-soft">Thành phố<select className={controlClass} value={filters.city} onChange={(event) => setFilter('city', event.target.value)}><option value="">Tất cả thành phố</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
        <label className="block text-sm font-bold text-ink-soft">Vị trí<select className={controlClass} value={filters.seatingType} onChange={(event) => setFilter('seatingType', event.target.value as 'all' | ResaleSeatingType)}><option value="all">Tất cả vị trí</option><option value="assigned">Có số ghế</option><option value="general-admission">Khu tự do</option></select></label>
        <button className="min-h-11 w-full rounded-md border border-blue-deep/50 bg-surface px-4 text-sm font-extrabold text-blue-deep disabled:cursor-default disabled:opacity-40" type="button" disabled={!hasActiveFilters} onClick={resetFilters}>Xóa toàn bộ bộ lọc</button>
      </fieldset>
    </aside>
  )
}
