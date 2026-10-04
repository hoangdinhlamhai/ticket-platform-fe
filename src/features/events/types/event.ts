export type EventCategory = 'Tất cả' | 'Âm nhạc' | 'Sân khấu' | 'Thể thao' | 'Workshop'
export type EventPosterTone = 'yellow' | 'mint' | 'blue' | 'coral'

export type EventScheduleItem = {
  time: string
  title: string
  description: string
}

export type EventTicketTier = {
  id: string
  name: string
  price: number | string
  availabilityLabel: string
  note: string
  image?: string
  minPerOrder?: number
  maxPerOrder?: number
  quantity?: number
  saleStartAt?: string | null
  saleEndAt?: string | null
  eventEndAt?: string
}

export type EventCalendarSchedule = {
  startsAt: string
  endsAt: string
  timeZone: string
}

export type EventCardData = {
  id: string
  title: string
  category: string
  date: string
  venue: string
  city: string
  priceFrom: string
  posterLabel: string
  posterTone: EventPosterTone
}

export type EventDetailView = EventCardData & {
  thumbnail?: string
  organizerBio?: string
  organizerLogo?: string
  seatingChartImage?: string
  startsAtLabel?: string
  endsAtLabel?: string
  descriptionHtml?: string
  address: string
  description: string
  organizer: string
  doorsOpen: string
  duration: string
  calendarSchedule?: EventCalendarSchedule
  schedule: readonly EventScheduleItem[]
  notices: readonly string[]
  ticketTiers: readonly EventTicketTier[]
}
