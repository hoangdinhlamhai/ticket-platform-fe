import type { EventCategory, MockEventDetail } from '../types/event.ts'

// Public GET /events/:id response. Decimal prices are serialized as strings by Prisma.
export type PublicEventDetailResponse = {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  venueName: string | null
  startAt: string
  endAt: string
  organizerName: string | null
  organizerBio: string | null
  organizerLogo: string | null
  category: { name: string }
  location: { address: string; province: { name: string }; ward?: { name: string } | null }
  seatMap?: { imageUrl: string | null } | null
  ticketTypes: {
    id: string
    name: string
    description: string | null
    image: string | null
    price: string | number
    quantity: number
    minPerOrder: number
    maxPerOrder: number
    saleStartAt: string | null
    saleEndAt: string | null
  }[]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value))
}

export function mapEventDetail(event: PublicEventDetailResponse): MockEventDetail {
  const category = (['Âm nhạc', 'Sân khấu', 'Thể thao', 'Workshop'].includes(event.category.name) ? event.category.name : 'Workshop') as Exclude<EventCategory, 'Tất cả'>
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    throw new Error('Thời gian sự kiện không hợp lệ.')
  }
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000)
  const ticketTiers = event.ticketTypes.map((ticket) => ({
    id: ticket.id,
    name: ticket.name,
    price: ticket.price === '' ? Number.NaN : Number(ticket.price),
    note: ticket.description ?? '',
    image: ticket.image ?? undefined,
    quantity: ticket.quantity,
    minPerOrder: ticket.minPerOrder,
    maxPerOrder: ticket.maxPerOrder,
    saleStartAt: ticket.saleStartAt,
    saleEndAt: ticket.saleEndAt,
    eventEndAt: event.endAt,
    availabilityLabel: '', // Computed against the current time by the ticket selector.
  }))
  const prices = ticketTiers.map((tier) => tier.price).filter((price) => Number.isFinite(price) && price >= 0)
  const descriptionHtml = event.description ?? ''
  // Plain text is used for sharing/calendar; HTML is sanitized separately for rendering.
  const description = descriptionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  return {
    id: event.id,
    title: event.title,
    category,
    date: formatDate(event.startAt),
    startsAtLabel: formatDate(event.startAt),
    endsAtLabel: formatDate(event.endAt),
    venue: event.venueName || event.location.address,
    city: event.location.province.name,
    address: [event.location.address, event.location.ward?.name, event.location.province.name].filter(Boolean).join(', '),
    thumbnail: event.thumbnail ?? undefined,
    posterLabel: event.category.name,
    posterTone: 'yellow',
    priceFrom: prices.length ? `Từ ${Math.min(...prices).toLocaleString('vi-VN')}đ` : 'Chưa có giá vé',
    description,
    descriptionHtml,
    organizer: event.organizerName || 'Đang cập nhật',
    organizerBio: event.organizerBio ?? undefined,
    organizerLogo: event.organizerLogo ?? undefined,
    seatingChartImage: event.seatMap?.imageUrl ?? undefined,
    doorsOpen: '',
    duration: `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`,
    calendarSchedule: { startsAt: event.startAt, endsAt: event.endAt, timeZone: 'Asia/Ho_Chi_Minh' },
    schedule: [],
    notices: [],
    ticketTiers,
  }
}
