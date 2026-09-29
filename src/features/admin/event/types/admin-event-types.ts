export type AdminEvent = {
  readonly id: string
  readonly title: string
  readonly slug: string
  readonly status: string
  readonly visibility: string
  readonly startAt: string | null
  readonly endAt: string | null
  readonly submittedAt: string | null
  readonly rejectionReason: string | null
  readonly createdAt: string | null
  readonly organizer: { readonly id: string; readonly fullName: string; readonly email: string }
  readonly category: { readonly id: string; readonly name: string }
  readonly location: { readonly address: string; readonly province: string; readonly ward: string }
}

export type AdminEventDetail = AdminEvent & {
  readonly description: string | null
  readonly thumbnail: string | null
  readonly coverImage: string | null
  readonly venueName: string | null
  readonly confirmationMessage: string | null
  readonly organizerName: string | null
  readonly organizerBio: string | null
  readonly organizerLogo: string | null
  readonly reviewedAt: string | null
  readonly reviewedBy: { readonly id: string; readonly fullName: string; readonly email: string }
  readonly ticketTypes: readonly {
    readonly id: string
    readonly name: string
    readonly description: string | null
    readonly image: string | null
    readonly price: number
    readonly quantity: number
    readonly minPerOrder: number
    readonly maxPerOrder: number
    readonly saleStartAt: string | null
    readonly saleEndAt: string | null
  }[]
  readonly seatMap: { readonly id?: string; readonly width?: number | null; readonly height?: number | null; readonly imageUrl?: string | null } | null
  readonly payoutInfo: Record<string, unknown> | null
}

export type AdminEventReviewDecision = 'APPROVED' | 'REJECTED'
