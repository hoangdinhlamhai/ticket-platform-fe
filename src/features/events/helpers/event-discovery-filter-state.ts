export type EventTicketStatus = 'available' | 'sold-out' | 'coming-soon'
export type EventSortOption = 'date-asc' | 'price-asc' | 'price-desc' | 'popularity'

export type EventDiscoveryFilters = {
  city: string
  venue: string
  dateFrom: string
  dateTo: string
  minPrice: string
  maxPrice: string
  freeOnly: boolean
  ticketStatuses: readonly EventTicketStatus[]
  sort: EventSortOption
}

export type EventFilterChip = {
  id: keyof EventDiscoveryFilters | `ticket-status-${EventTicketStatus}`
  label: string
}

const ticketStatusLabels: Record<EventTicketStatus, string> = {
  available: 'Còn vé',
  'sold-out': 'Hết vé',
  'coming-soon': 'Sắp mở bán',
}

export function createDefaultEventDiscoveryFilters(): EventDiscoveryFilters {
  return {
    city: '',
    venue: '',
    dateFrom: '',
    dateTo: '',
    minPrice: '',
    maxPrice: '',
    freeOnly: false,
    ticketStatuses: [],
    sort: 'date-asc',
  }
}

export function updateEventDiscoveryFilter<K extends keyof EventDiscoveryFilters>(
  filters: EventDiscoveryFilters,
  field: K,
  value: EventDiscoveryFilters[K],
): EventDiscoveryFilters {
  return { ...filters, [field]: value }
}

export function removeEventDiscoveryFilter(filters: EventDiscoveryFilters, id: EventFilterChip['id']): EventDiscoveryFilters {
  if (id.startsWith('ticket-status-')) {
    const status = id.replace('ticket-status-', '') as EventTicketStatus
    return { ...filters, ticketStatuses: filters.ticketStatuses.filter((item) => item !== status) }
  }
  if (id === 'dateFrom' || id === 'dateTo') return { ...filters, dateFrom: '', dateTo: '' }
  if (id === 'minPrice' || id === 'maxPrice') return { ...filters, minPrice: '', maxPrice: '' }
  if (id === 'freeOnly') return { ...filters, freeOnly: false }
  if (id === 'sort' || id === 'ticketStatuses') return filters
  return { ...filters, [id]: '' }
}

export function countActiveEventFilters(filters: EventDiscoveryFilters) {
  return [
    filters.city,
    filters.venue,
    filters.dateFrom,
    filters.dateTo,
    filters.minPrice,
    filters.maxPrice,
    filters.freeOnly,
    filters.sort !== 'date-asc',
    ...filters.ticketStatuses,
  ].filter(Boolean).length
}

function formatDate(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function formatPrice(value: string) {
  const price = Number(value)
  return Number.isFinite(price) ? `${price.toLocaleString('vi-VN')}đ` : value
}

export function getActiveEventFilterChips(filters: EventDiscoveryFilters): EventFilterChip[] {
  const chips: EventFilterChip[] = []
  if (filters.city) chips.push({ id: 'city', label: filters.city })
  if (filters.venue) chips.push({ id: 'venue', label: filters.venue })
  if (filters.dateFrom || filters.dateTo) {
    const label = filters.dateFrom && filters.dateTo
      ? `${formatDate(filters.dateFrom)} – ${formatDate(filters.dateTo)}`
      : filters.dateFrom ? `Từ ${formatDate(filters.dateFrom)}` : `Đến ${formatDate(filters.dateTo)}`
    chips.push({ id: 'dateFrom', label })
  }
  if (filters.minPrice || filters.maxPrice) {
    const label = filters.minPrice && filters.maxPrice
      ? `${formatPrice(filters.minPrice)} – ${formatPrice(filters.maxPrice)}`
      : filters.minPrice ? `Từ ${formatPrice(filters.minPrice)}` : `Đến ${formatPrice(filters.maxPrice)}`
    chips.push({ id: 'minPrice', label })
  }
  if (filters.freeOnly) chips.push({ id: 'freeOnly', label: 'Miễn phí' })
  filters.ticketStatuses.forEach((status) => {
    chips.push({ id: `ticket-status-${status}`, label: ticketStatusLabels[status] })
  })
  return chips
}
