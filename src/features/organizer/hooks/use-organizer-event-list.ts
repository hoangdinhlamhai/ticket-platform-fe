import { useMemo, useState } from 'react'
import { filterOrganizerEvents, type OrganizerEventListFilters } from '../helpers/filter-organizer-events.ts'
import { selectOrganizerEventRevenueById } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerEvent } from '../types/organizer-event.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

const initialFilters: OrganizerEventListFilters = { query: '', status: 'all', sort: 'date_asc' }

export function useOrganizerEventList(workspace: OrganizerWorkspace) {
  const [filters, setFilters] = useState(initialFilters)
  const revenueByEventId = useMemo(() => selectOrganizerEventRevenueById(workspace), [workspace])
  const events = useMemo(() => filterOrganizerEvents(workspace.events, revenueByEventId, filters), [filters, revenueByEventId, workspace.events])
  const updateFilter = <Key extends keyof OrganizerEventListFilters>(key: Key, value: OrganizerEventListFilters[Key]) => setFilters((current) => ({ ...current, [key]: value }))
  const revenueFor = (event: OrganizerEvent) => revenueByEventId[event.id] ?? 0
  return { events, filters, reset: () => setFilters(initialFilters), revenueFor, updateFilter }
}
