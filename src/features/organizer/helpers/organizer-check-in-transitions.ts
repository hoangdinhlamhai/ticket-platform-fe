import type { OrganizerAttendee, OrganizerCheckInActivity } from '../types/organizer-commerce.ts'
import type { OrganizerCheckInOutcome } from '../types/organizer-workspace.ts'

export function sortOrganizerCheckInActivities(
  activities: readonly OrganizerCheckInActivity[],
) {
  return [...activities].sort(
    (left, right) => Date.parse(right.checkedInAt) - Date.parse(left.checkedInAt),
  )
}

export function getOrganizerCheckInOutcome(attendee: OrganizerAttendee | undefined, eventId: string): OrganizerCheckInOutcome {
  if (!attendee) return 'not_found'
  if (attendee.eventId !== eventId) return 'wrong_event'
  if (attendee.credentialStatus === 'void') return 'revoked'
  if (attendee.checkedInAt !== null || attendee.credentialStatus === 'checked_in') return 'already_checked_in'
  return 'success'
}
