export const ORGANIZER_EVENT_STATUSES = ['draft', 'pending_review', 'changes_requested', 'approved', 'published', 'ongoing', 'ended', 'cancelled', 'rejected'] as const
export type OrganizerEventStatus = (typeof ORGANIZER_EVENT_STATUSES)[number]

export type OrganizerEvent = {
  readonly id: string
  readonly title: string
  readonly startsAt: string
  readonly endsAt: string
  readonly venue: string
  readonly city: string
  readonly status: OrganizerEventStatus
  readonly reviewFeedback: string | null
}

export type OrganizerEventInput = Pick<OrganizerEvent, 'title' | 'startsAt' | 'endsAt' | 'venue' | 'city'>
export type OrganizerEventPatch = Partial<OrganizerEventInput>
