export const ORGANIZER_EVENT_STATUSES = ['draft', 'pending_review', 'changes_requested', 'approved', 'published', 'ongoing', 'ended', 'cancelled', 'rejected'] as const
export type OrganizerEventStatus = (typeof ORGANIZER_EVENT_STATUSES)[number]
export type OrganizerEventVisibility = 'public' | 'link_only'

export type OrganizerEvent = {
  readonly id: string
  readonly title: string
  readonly startsAt: string
  readonly endsAt: string
  readonly venue: string
  readonly city: string
  readonly status: OrganizerEventStatus
  readonly reviewFeedback: string | null
  readonly thumbnail?: string
  readonly category?: string
  readonly provinceId?: string
  readonly wardId?: string
  readonly street?: string
  readonly description?: string
  readonly organizerName?: string
  readonly organizerBio?: string
  readonly organizerLogo?: string
  readonly visibility?: OrganizerEventVisibility
  readonly confirmationMessage?: string
  readonly seatingChartImage?: string
}

export type OrganizerEventFinance = {
  readonly accountHolder: string
  readonly accountNumber: string
  readonly bankName: string
  readonly branch: string
  readonly businessType: string
  readonly invoiceName: string
  readonly invoiceAddress: string
  readonly taxCode: string
}

export type OrganizerEventInput = Pick<OrganizerEvent, 'title' | 'startsAt' | 'endsAt' | 'venue' | 'city'> & Partial<Omit<OrganizerEvent, 'id' | 'status' | 'reviewFeedback' | 'title' | 'startsAt' | 'endsAt' | 'venue' | 'city'>>
export type OrganizerEventPatch = Partial<OrganizerEventInput>
