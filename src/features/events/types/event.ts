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
  price: number
  availabilityLabel: string
  note: string
}

export type EventCalendarSchedule = {
  startsAt: string
  endsAt: string
  timeZone: string
}

export type MockEvent = {
  id: string
  title: string
  category: Exclude<EventCategory, 'Tất cả'>
  date: string
  venue: string
  city: string
  priceFrom: string
  posterLabel: string
  posterTone: EventPosterTone
}

export type MockEventDetail = MockEvent & {
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
