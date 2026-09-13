import type { EventDiscoveryFilters, EventTicketStatus } from '../helpers/event-discovery-filter-state'

const EVENT_CITY_OPTIONS = ['TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Hà Nội', 'Đà Nẵng'] as const
const EVENT_VENUE_OPTIONS = ['Nhà hát Thành phố', 'The Global City', 'Nhà hát Kịch IDECAF', 'Công viên Gia Định'] as const

const controlClass = 'mt-2 min-h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink'
const statusOptions: readonly { label: string; value: EventTicketStatus }[] = [
  { label: 'Còn vé', value: 'available' },
  { label: 'Hết vé', value: 'sold-out' },
  { label: 'Sắp mở bán', value: 'coming-soon' },
]

type AdvancedEventFilterControlsProps = {
  filters: EventDiscoveryFilters
  onChange: <K extends keyof EventDiscoveryFilters>(field: K, value: EventDiscoveryFilters[K]) => void
}

export function AdvancedEventFilterControls({ filters, onChange }: AdvancedEventFilterControlsProps) {
  const toggleStatus = (status: EventTicketStatus) => {
    const selected = filters.ticketStatuses.includes(status)
    onChange('ticketStatuses', selected
      ? filters.ticketStatuses.filter((item) => item !== status)
      : [...filters.ticketStatuses, status])
  }

  return (
    <div className="space-y-5">
      <label className="block text-sm font-bold text-ink-soft">Thành phố
        <select className={controlClass} value={filters.city} onChange={(event) => onChange('city', event.target.value)}>
          <option value="">Tất cả thành phố</option>
          {EVENT_CITY_OPTIONS.map((city) => <option key={city} value={city}>{city}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold text-ink-soft">Địa điểm
        <select className={controlClass} value={filters.venue} onChange={(event) => onChange('venue', event.target.value)}>
          <option value="">Tất cả địa điểm</option>
          {EVENT_VENUE_OPTIONS.map((venue) => <option key={venue} value={venue}>{venue}</option>)}
        </select>
      </label>
      <fieldset className="border-0 p-0">
        <legend className="text-sm font-bold text-ink-soft">Khoảng ngày</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-soft">Từ ngày<input className={`${controlClass} mt-1 px-2`} type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} /></label>
          <label className="text-xs text-ink-soft">Đến ngày<input className={`${controlClass} mt-1 px-2`} type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} /></label>
        </div>
      </fieldset>
      <fieldset className="border-0 p-0">
        <legend className="text-sm font-bold text-ink-soft">Khoảng giá</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-soft">Từ<input className={`${controlClass} mt-1`} min="0" inputMode="numeric" type="number" placeholder="0đ" value={filters.minPrice} onChange={(event) => onChange('minPrice', event.target.value)} /></label>
          <label className="text-xs text-ink-soft">Đến<input className={`${controlClass} mt-1`} min="0" inputMode="numeric" type="number" placeholder="1.000.000đ" value={filters.maxPrice} onChange={(event) => onChange('maxPrice', event.target.value)} /></label>
        </div>
      </fieldset>
      <label className="flex min-h-11 items-center gap-3 rounded-md border border-line bg-surface px-3 text-sm font-bold text-ink">
        <input className="h-4 w-4 accent-blue" type="checkbox" checked={filters.freeOnly} onChange={(event) => onChange('freeOnly', event.target.checked)} />
        Chỉ xem sự kiện miễn phí
      </label>
      <fieldset className="border-0 p-0">
        <legend className="text-sm font-bold text-ink-soft">Trạng thái vé</legend>
        <div className="mt-2 space-y-2">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex min-h-10 items-center gap-3 text-sm font-medium text-ink">
              <input className="h-4 w-4 accent-blue" type="checkbox" checked={filters.ticketStatuses.includes(option.value)} onChange={() => toggleStatus(option.value)} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
