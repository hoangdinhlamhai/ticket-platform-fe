export type ResaleAvailability = 'available' | 'unavailable'
export type ResaleSeatingType = 'assigned' | 'general-admission'
export type ResalePosterTone = 'yellow' | 'mint' | 'blue' | 'coral'
export type ResalePriceBand = 'all' | 'under-500k' | '500k-to-1m' | 'over-1m'
export type ResaleSortOption = 'relevance' | 'price-asc' | 'price-desc' | 'event-date'

export type ResaleSeller = {
  readonly name: string
  readonly verified: boolean
  readonly joinedAt: string
  readonly completedSales: number
}

export type ResaleListing = {
  readonly id: string
  readonly eventId?: string
  readonly availability: ResaleAvailability
  readonly eventTitle: string
  readonly startsAt: string
  readonly venue: string
  readonly city: string
  readonly ticketType: string
  readonly section: string
  readonly row: string | null
  readonly seats: readonly string[]
  readonly quantity: number
  readonly seatingType: ResaleSeatingType
  readonly usageTerms: readonly string[]
  readonly price: number
  readonly seller: ResaleSeller
  readonly posterTone: ResalePosterTone
  readonly sourceTicketId?: string
  readonly ownerLabel?: 'current-profile'
  readonly listingStatus?: 'active' | 'sold' | 'withdrawn'
}

export type ResaleMarketplaceFilters = {
  query: string
  eventDate: string
  priceBand: ResalePriceBand
  ticketType: string
  city: string
  seatingType: 'all' | ResaleSeatingType
  sort: ResaleSortOption
}

export type ResaleBuyer = {
  fullName: string
  email: string
  phone: string
}

export type ResaleCheckoutDraft = ResaleBuyer & {
  acceptedTerms: boolean
}

export type ResaleCheckoutField = keyof ResaleCheckoutDraft
export type ResaleCheckoutErrors = Partial<Record<ResaleCheckoutField, string>>

export type ResaleCheckoutValidation = {
  errors: ResaleCheckoutErrors
  firstInvalidField: ResaleCheckoutField | null
}

export type ResaleCheckoutCompletion = {
  listingId: string
  buyer: ResaleBuyer
  amount: number
  transferContent: string
}

