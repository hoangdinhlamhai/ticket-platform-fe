import type { OrganizerCheckInActivity } from '../types/organizer-commerce.ts'

export function sortOrganizerCheckInActivities(
  activities: readonly OrganizerCheckInActivity[],
) {
  return [...activities].sort(
    (left, right) => Date.parse(right.checkedInAt) - Date.parse(left.checkedInAt),
  )
}
