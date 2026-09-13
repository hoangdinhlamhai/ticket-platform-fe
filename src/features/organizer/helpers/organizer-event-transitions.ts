import type { OrganizerEventStatus } from '../types/organizer-event.ts'

export function canSubmitOrganizerEventForReview(status: OrganizerEventStatus) {
  return status === 'draft' || status === 'changes_requested'
}

export function canPublishOrganizerEvent(status: OrganizerEventStatus) {
  return status === 'approved'
}
