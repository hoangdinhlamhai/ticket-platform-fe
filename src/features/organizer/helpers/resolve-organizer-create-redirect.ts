import type { OrganizerPath } from '../../../routes/organizer-route.ts'
import type { OrganizerOperationResult } from '../types/organizer-workspace.ts'

export type OrganizerCreateRedirect = {
  readonly path: OrganizerPath
  // The unsaved-change guard is cleared ONLY here, after a confirmed create, so the
  // redirect never triggers the "bạn có thay đổi chưa lưu" prompt. A failed or stale
  // create returns null and stays in the form with its dirty state and error intact.
  readonly clearDirtyFirst: true
}

// Decides whether a create-form save just produced a confirmed, server-persisted event
// and should redirect to the "Sự kiện của tôi" list. Only an `event_created` result (the
// controller returns null for anonymous/failed/stale-account saves) redirects; every other
// outcome — null, an update, or an unsupported action — keeps the user in the form.
export function resolveOrganizerCreateRedirect(
  result: OrganizerOperationResult | null,
): OrganizerCreateRedirect | null {
  if (result?.kind !== 'event_created') return null
  return { path: '/organizer/events', clearDirtyFirst: true }
}
