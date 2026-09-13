import type { OrganizerEvent, OrganizerEventStatus } from '../types/organizer-event.ts'

export type OrganizerEventListSort = 'date_asc' | 'date_desc' | 'revenue_desc'
export type OrganizerEventListFilters = {
  readonly query: string
  readonly status: OrganizerEventStatus | 'all'
  readonly sort: OrganizerEventListSort
}

type RevenueByEventId = Readonly<Record<string, number>>

function eventSearchText(event: OrganizerEvent) {
  return `${event.title} ${event.venue} ${event.city}`.toLocaleLowerCase('vi-VN')
}

export function filterOrganizerEvents(
  events: readonly OrganizerEvent[],
  revenueByEventId: RevenueByEventId,
  filters: OrganizerEventListFilters,
) {
  const query = filters.query.trim().toLocaleLowerCase('vi-VN')
  return events
    .filter((event) => (!query || eventSearchText(event).includes(query)) && (filters.status === 'all' || event.status === filters.status))
    .toSorted((first, second) => {
      if (filters.sort === 'revenue_desc') return (revenueByEventId[second.id] ?? 0) - (revenueByEventId[first.id] ?? 0)
      const difference = Date.parse(first.startsAt) - Date.parse(second.startsAt)
      return filters.sort === 'date_asc' ? difference : -difference
    })
}
