import type { AdminCase, AdminEvent, AdminOrganizer, AdminSubjectType } from '../types/admin-records.ts'

export type AdminEventFilters = { readonly query?: string; readonly statuses?: readonly string[]; readonly city?: string; readonly categoryId?: string; readonly organizerId?: string }
export type AdminCaseFilters = { readonly query?: string; readonly statuses?: readonly string[]; readonly severities?: readonly string[]; readonly subjectTypes?: readonly AdminSubjectType[] }

export function normalizeAdminSearch(value: string) { return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('vi-VN').trim() }
export function matchesAdminQuery(query: string | undefined, values: readonly string[]) { const normalized = normalizeAdminSearch(query ?? ''); return !normalized || values.some((value) => normalizeAdminSearch(value).includes(normalized)) }
export function filterAdminEvents(events: readonly AdminEvent[], organizers: readonly AdminOrganizer[], filters: AdminEventFilters): readonly AdminEvent[] {
  const organizerNames = new Map(organizers.map((item) => [item.id, item.name]))
  return events.filter((item) => (!filters.statuses?.length || filters.statuses.includes(item.reviewStatus)) && (!filters.city || item.city === filters.city) && (!filters.categoryId || item.categoryId === filters.categoryId) && (!filters.organizerId || item.organizerId === filters.organizerId) && matchesAdminQuery(filters.query, [item.title, organizerNames.get(item.organizerId) ?? '']))
}
export function filterAdminCases(cases: readonly AdminCase[], filters: AdminCaseFilters): readonly AdminCase[] {
  return cases.filter((item) => (!filters.statuses?.length || filters.statuses.includes(item.status)) && (!filters.severities?.length || filters.severities.includes(item.severity)) && (!filters.subjectTypes?.length || filters.subjectTypes.includes(item.subjectType)) && matchesAdminQuery(filters.query, [item.summary, item.category, item.reporter, item.subjectId]))
}
