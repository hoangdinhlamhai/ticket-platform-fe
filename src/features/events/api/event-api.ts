import axios from 'axios'
import axiosClient from '../../../api/axiosClient.ts'
import type { OrganizerEvent, OrganizerEventInput } from '../../organizer/types/organizer-event.ts'
import type { MockEvent, EventCategory as AttendeeEventCategory, EventPosterTone } from '../types/event.ts'
import { mapEventDetail, type PublicEventDetailResponse } from '../helpers/map-event-detail.ts'

export type EventCreatePayload = OrganizerEventInput & { readonly slug?: string; readonly categoryId: string; readonly locationId?: string; readonly location?: { address: string; provinceId: string; wardId?: string }; readonly initialTicketTiers?: readonly { name: string; price: number; capacity: number; minPerOrder?: number; perOrderLimit?: number; salesStartAt?: string; salesEndAt?: string; description?: string; image?: string }[]; readonly finance?: import('../../organizer/types/organizer-event.ts').OrganizerEventFinance }
export type EventCategory = { readonly id: string; readonly name?: string; readonly label?: string }
export type EventLocation = { readonly id: string; readonly name?: string; readonly label?: string }
export type TicketTypePayload = { readonly eventId: string; readonly name: string; readonly price: number; readonly quantity: number; readonly description?: string; readonly image?: string; readonly maxPerOrder: number; readonly minPerOrder: number; readonly saleStartAt: string; readonly saleEndAt: string }
export type TicketTypeMutationResult = { readonly id: string; readonly name?: string; readonly price?: number; readonly quantity?: number; readonly description?: string | null; readonly image?: string | null; readonly minPerOrder?: number; readonly maxPerOrder?: number; readonly saleStartAt?: string | null; readonly saleEndAt?: string | null }

// Owner detail: the extra nested data GET /events/mine/:id returns beyond the summary
// (its `event` fields normalize into OrganizerEvent). Typed for Task5 edit flows so
// saved ticket tiers and payout finance are not overwritten with empty defaults.
export type OrganizerEventOwnerTicketType = { readonly id: string; readonly name: string; readonly price: number; readonly quantity: number; readonly description?: string | null; readonly image?: string | null; readonly minPerOrder?: number; readonly maxPerOrder?: number; readonly saleStartAt?: string | null; readonly saleEndAt?: string | null }
export type OrganizerEventOwnerDetail = { readonly event: OrganizerEvent; readonly ticketTypes: readonly OrganizerEventOwnerTicketType[]; readonly seatMap: { readonly imageUrl: string | null } | null; readonly payoutInfo: import('../../organizer/types/organizer-event.ts').OrganizerEventFinance | null }

// Owner-scoped reporting: mirrors the backend GET /events/:id/reporting response.
// All numeric fields arrive as Prisma Decimal-like strings and are normalized to
// numbers here so callers can render real, server-computed metrics — never mock orders.
export type OrganizerReportRange = { readonly startAt: string; readonly endAt: string }
export type OrganizerReportSummary = {
  readonly revenue: number
  readonly paidOrderCount: number
  readonly soldTicketCount: number
  readonly capacity: number
  readonly remainingTicketCount: number
  readonly checkInCount: number
}
export type OrganizerReportTimelineBucket = {
  readonly startAt: string
  readonly endAt: string
  readonly revenue: number
  readonly soldTicketCount: number
}
export type OrganizerReportTicketType = {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly capacity: number
  readonly soldTicketCount: number
  readonly revenue: number
}
export type OrganizerEventReport = {
  readonly eventId: string
  readonly saleWindow: OrganizerReportRange
  readonly range: OrganizerReportRange
  readonly summary: OrganizerReportSummary
  readonly timeline: readonly OrganizerReportTimelineBucket[]
  readonly ticketTypes: readonly OrganizerReportTicketType[]
}
export type OrganizerReportRangeInput = { readonly from: string; readonly to: string }

export type EventApi = {
  create: (accessToken: string, payload: EventCreatePayload) => Promise<OrganizerEvent>
  update: (accessToken: string, eventId: string, payload: Partial<EventCreatePayload>) => Promise<OrganizerEvent>
  submitReview: (accessToken: string, eventId: string) => Promise<OrganizerEvent>
  setPayout: (accessToken: string, eventId: string, finance: import('../../organizer/types/organizer-event.ts').OrganizerEventFinance) => Promise<import('../../organizer/types/organizer-event.ts').OrganizerEventFinance>
  findMine: (accessToken: string) => Promise<readonly OrganizerEvent[]>
  findMineById: (accessToken: string, eventId: string) => Promise<OrganizerEventOwnerDetail | null>
  reporting: (accessToken: string, eventId: string, range?: OrganizerReportRangeInput) => Promise<OrganizerEventReport>
  findPending: (accessToken: string) => Promise<readonly OrganizerEvent[]>
  review: (accessToken: string, eventId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) => Promise<OrganizerEvent>
  categories: (accessToken?: string) => Promise<readonly EventCategory[]>
  locations: (accessToken?: string) => Promise<readonly EventLocation[]>
  wards: (provinceId: string, accessToken?: string) => Promise<readonly EventLocation[]>
  uploadImage: (accessToken: string, file: File, onProgress?: (progress: number) => void) => Promise<string>
  createTicketType: (accessToken: string, payload: TicketTypePayload) => Promise<TicketTypeMutationResult>
  updateTicketType: (accessToken: string, ticketTypeId: string, payload: Partial<TicketTypePayload>) => Promise<TicketTypeMutationResult>
  findPublic: () => Promise<readonly MockEvent[]>
  findPublicById: (eventId: string) => Promise<import('../types/event.ts').MockEventDetail | null>
}

type Options = { baseUrl: string; fetch?: typeof globalThis.fetch }
function join(baseUrl: string, path: string) { return `${baseUrl.replace(/\/$/, '')}${path}` }
function slugify(value: string) { return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 110) || 'event' }
async function request<T>(url: string, token: string | undefined, init: { method?: string; data?: unknown } = {}): Promise<T> {
  const response = await axiosClient.request<T>({ url, method: init.method ?? 'GET', data: init.data, headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  return response.data
}
function visibilityValue(visibility: EventCreatePayload['visibility']) { return visibility === 'link_only' ? 'LINK_ONLY' : visibility === 'public' ? 'PUBLIC' : undefined }
// Create body: POST /events accepts the nested location object, initial tickets and
// payoutInfo (CreateEventRequestDto). These are the create-only compound fields.
function createEventBody(payload: Partial<EventCreatePayload>) {
  const { title, startsAt, endsAt, venue, description, thumbnail, coverImage, organizerName, organizerBio, organizerLogo, visibility, confirmationMessage, seatingChartImage, categoryId, locationId, provinceId, wardId, street, slug, initialTicketTiers, finance } = payload;
  const hasFinance = Boolean(finance && (finance.accountHolder?.trim() || finance.accountNumber?.trim()));
  const formattedPayout = hasFinance ? {
    accountHolder: finance!.accountHolder?.trim() || 'Chủ tài khoản',
    accountNumber: finance!.accountNumber?.trim() || '0000000000',
    bankName: finance!.bankName?.trim() || 'Ngân hàng',
    branch: finance!.branch?.trim() || 'Chi nhánh',
    businessType: finance!.businessType || 'INDIVIDUAL',
    invoiceName: finance!.invoiceName?.trim() || undefined,
    invoiceAddress: finance!.invoiceAddress?.trim() || undefined,
    taxCode: finance!.taxCode?.trim() || undefined,
  } : undefined;

  return {
    title,
    slug: slug ?? (title ? slugify(title) : undefined),
    startAt: startsAt,
    endAt: endsAt,
    venueName: venue || undefined,
    description: description || undefined,
    thumbnail: (thumbnail && String(thumbnail).trim()) || undefined,
    coverImage: (coverImage && String(coverImage).trim()) || undefined,
    organizerName: organizerName || undefined,
    organizerBio: organizerBio || undefined,
    organizerLogo: (organizerLogo && String(organizerLogo).trim()) || undefined,
    visibility: visibilityValue(visibility),
    confirmationMessage: confirmationMessage || undefined,
    seatingChartImage: (seatingChartImage && String(seatingChartImage).trim()) || undefined,
    categoryId: categoryId || undefined,
    locationId: locationId || undefined,
    location: provinceId && street ? { address: street, provinceId, wardId: wardId || undefined } : undefined,
    tickets: initialTicketTiers && initialTicketTiers.length > 0 ? initialTicketTiers.map((ticket) => ({
      name: ticket.name,
      price: Number(ticket.price) || 0,
      quantity: Number(ticket.capacity) || 0,
      minPerOrder: ticket.minPerOrder ?? 1,
      maxPerOrder: ticket.perOrderLimit ?? 10,
      saleStartAt: ticket.salesStartAt || undefined,
      saleEndAt: ticket.salesEndAt || undefined,
      description: ticket.description || undefined,
      image: ticket.image || undefined,
    })) : undefined,
    payoutInfo: formattedPayout,
  };
}
// Update body: PATCH /events/:id (UpdateEventDto) whitelists ONLY these scalar event
// fields with forbidNonWhitelisted, so it MUST NOT carry a location object, tickets or
// payoutInfo — sending any of those is a 400. Location changes and finance go through
// their own paths (POST /events/:id/payout for finance); they are not silently dropped
// as success by the caller. Only defined keys are emitted so a partial patch stays partial.
function updateEventBody(payload: Partial<EventCreatePayload>) {
  const {
    title,
    startsAt,
    endsAt,
    venue,
    description,
    thumbnail,
    coverImage,
    organizerName,
    organizerBio,
    organizerLogo,
    visibility,
    confirmationMessage,
    seatingChartImage,
    categoryId,
    locationId,
    slug,
  } = payload
  const body: Record<string, unknown> = {}
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) body[key] = value
  }
  assign('title', title)
  assign('slug', slug ?? (title !== undefined ? slugify(title) : undefined))
  assign('startAt', startsAt)
  assign('endAt', endsAt)
  assign('venueName', venue === undefined ? undefined : venue || undefined)
  assign('description', description)
  assign('thumbnail', thumbnail)
  assign('coverImage', coverImage)
  assign('organizerName', organizerName)
  assign('organizerBio', organizerBio)
  assign('organizerLogo', organizerLogo)
  assign('visibility', visibilityValue(visibility))
  assign('confirmationMessage', confirmationMessage)
  assign('seatingChartImage', seatingChartImage)
  assign('categoryId', categoryId)
  assign('locationId', locationId)
  return body
}
export function dataUrlFile(value: string, name: string): File | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(value)
  if (!match) return null
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0))
  return new File([bytes], name, { type: match[1] })
}

async function resolveImages(token: string, payload: Partial<EventCreatePayload>, upload: (token: string, file: File) => Promise<string>) {
  const next = { ...payload }
  for (const [key, name] of [['thumbnail', 'thumbnail'], ['coverImage', 'cover-image'], ['organizerLogo', 'organizer-logo'], ['seatingChartImage', 'seating-chart']] as const) {
    const value = next[key]
    const file = typeof value === 'string' ? dataUrlFile(value, `${name}.img`) : null
    if (file) (next as Record<string, unknown>)[key] = await upload(token, file)
  }
  return next
}

async function resolveTicketImage(token: string, payload: Partial<TicketTypePayload>, upload: (token: string, file: File) => Promise<string>) {
  const value = payload.image
  const file = typeof value === 'string' ? dataUrlFile(value, 'ticket-tier.img') : null
  return file ? { ...payload, image: await upload(token, file) } : payload
}

function uploadEventImage(baseUrl: string, token: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<{ url: string }>(join(baseUrl, '/uploads/events'), token, { method: 'POST', data: body }).then((result) => result.url)
}
function normalizePublicEvent(value: unknown, index: number): MockEvent {
  const event = value as Record<string, unknown>
  const categoryValue = event.category
  const categoryName = typeof categoryValue === 'object' && categoryValue !== null
    ? (categoryValue as Record<string, unknown>).name
    : categoryValue
  const category = (['Âm nhạc', 'Sân khấu', 'Thể thao', 'Workshop'].includes(String(categoryName))
    ? String(categoryName)
    : 'Workshop') as Exclude<AttendeeEventCategory, 'Tất cả'>
  const startAt = new Date(String(event.startAt ?? ''))
  const date = Number.isNaN(startAt.getTime())
    ? 'Chưa có lịch'
    : `${String(startAt.toLocaleString('vi-VN', { day: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })).padStart(2, '0')} THG ${String(startAt.toLocaleString('vi-VN', { month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })).padStart(2, '0')} · ${startAt.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' })}`
  const location = typeof event.location === 'object' && event.location !== null ? event.location as Record<string, unknown> : {}
  const province = typeof location.province === 'object' && location.province !== null ? location.province as Record<string, unknown> : {}
  const tones: EventPosterTone[] = ['yellow', 'mint', 'blue', 'coral']

  return {
    id: String(event.id),
    title: String(event.title ?? 'Sự kiện'),
    category,
    date,
    venue: String(event.venueName ?? 'Địa điểm đang cập nhật'),
    city: String(province.name ?? ''),
    priceFrom: 'Liên hệ giá vé',
    posterLabel: `EVENT / ${String(startAt.getDate()).padStart(2, '0')}`,
    posterTone: tones[index % tones.length],
  }
}
function normalizeEvent(value: unknown): OrganizerEvent {
  const event = value as Record<string, unknown>
  const status = typeof event.status === 'string' ? event.status : 'draft'
  const statusMap: Record<string, OrganizerEvent['status']> = {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    REJECTED: 'rejected',
    APPROVED: 'approved',
    PUBLISHED: 'published',
  }
  return {
    id: String(event.id),
    title: String(event.title ?? ''),
    startsAt: String(event.startAt ?? event.startsAt ?? ''),
    endsAt: String(event.endAt ?? event.endsAt ?? ''),
    venue: String(event.venueName ?? event.venue ?? ''),
    city: String(event.city ?? ''),
    status: statusMap[status] ?? (status as OrganizerEvent['status']),
    reviewFeedback: (event.rejectionReason ?? event.reviewFeedback ?? null) as string | null,
    thumbnail: event.thumbnail as string | undefined,
    coverImage: event.coverImage as string | undefined,
    category:
      typeof event.category === 'object' && event.category !== null
        ? String((event.category as Record<string, unknown>).name ?? '')
        : (event.category as string | undefined),
    categoryId: event.categoryId as string | undefined,
    provinceId: (event.location as Record<string, unknown> | undefined)?.provinceId as
      | string
      | undefined,
    wardId: (event.location as Record<string, unknown> | undefined)?.wardId as string | undefined,
    street: (event.location as Record<string, unknown> | undefined)?.address as string | undefined,
    description: event.description as string | undefined,
    organizerName: event.organizerName as string | undefined,
    organizerBio: event.organizerBio as string | undefined,
    organizerLogo: event.organizerLogo as string | undefined,
    visibility:
      event.visibility === 'LINK_ONLY'
        ? 'link_only'
        : event.visibility === 'PUBLIC'
          ? 'public'
          : (event.visibility as OrganizerEvent['visibility']),
    confirmationMessage: event.confirmationMessage as string | undefined,
    seatingChartImage: event.seatingChartImage as string | undefined,
  }
}

function normalizeReport(value: Record<string, unknown>): OrganizerEventReport {
  const num = (input: unknown) => { const parsed = Number(input); return Number.isFinite(parsed) ? parsed : 0 }
  const iso = (input: unknown) => String(input ?? '')
  const rangeOf = (input: unknown): OrganizerReportRange => {
    const record = (input ?? {}) as Record<string, unknown>
    return { startAt: iso(record.startAt), endAt: iso(record.endAt) }
  }
  const summary = (value.summary ?? {}) as Record<string, unknown>
  const timeline = Array.isArray(value.timeline) ? value.timeline : []
  const ticketTypes = Array.isArray(value.ticketTypes) ? value.ticketTypes : []
  return {
    eventId: String(value.eventId ?? ''),
    saleWindow: rangeOf(value.saleWindow),
    range: rangeOf(value.range),
    summary: {
      revenue: num(summary.revenue),
      paidOrderCount: num(summary.paidOrderCount),
      soldTicketCount: num(summary.soldTicketCount),
      capacity: num(summary.capacity),
      remainingTicketCount: num(summary.remainingTicketCount),
      checkInCount: num(summary.checkInCount),
    },
    timeline: timeline.map((bucket) => {
      const record = bucket as Record<string, unknown>
      return { startAt: iso(record.startAt), endAt: iso(record.endAt), revenue: num(record.revenue), soldTicketCount: num(record.soldTicketCount) }
    }),
    ticketTypes: ticketTypes.map((type) => {
      const record = type as Record<string, unknown>
      return { id: String(record.id ?? ''), name: String(record.name ?? ''), price: num(record.price), capacity: num(record.capacity), soldTicketCount: num(record.soldTicketCount), revenue: num(record.revenue) }
    }),
  }
}

export function createEventApi({ baseUrl }: Options): EventApi {
  const collection = async <T>(path: string, token?: string) => {
    const body = await request<Record<string, T[]>>(join(baseUrl, path), token)
    const key = path.includes('/wards')
      ? 'wards'
      : path.includes('categories')
        ? 'categories'
        : path.includes('provinces')
          ? 'provinces'
          : path.includes('locations')
            ? 'locations'
            : 'events'
    return body[key] ?? []
  }

  return {
    create: async (token, payload) => {
      const resolved = await resolveImages(token, payload, async (accessToken, file) => {
        const body = new FormData()
        body.append('file', file)
        return (
          await request<{ url: string }>(
            join(baseUrl, '/uploads/events'),
            accessToken,
            { method: 'POST', data: body },
          )
        ).url
      })
      const result = await request<{ event: unknown }>(
        join(baseUrl, '/events'),
        token,
        { method: 'POST', data: createEventBody(resolved) },
      )
      return normalizeEvent(result.event)
    },

    update: async (token, id, payload) => {
      const resolved = await resolveImages(token, payload, async (accessToken, file) => {
        const body = new FormData()
        body.append('file', file)
        return (
          await request<{ url: string }>(
            join(baseUrl, '/uploads/events'),
            accessToken,
            { method: 'POST', data: body },
          )
        ).url
      })
      const result = await request<{ event: unknown }>(
        join(baseUrl, `/events/${id}`),
        token,
        { method: 'PATCH', data: updateEventBody(resolved) },
      )
      return normalizeEvent(result.event)
    },

    setPayout: async (token, id, finance) =>
      (
        await request<{ payoutInfo: unknown }>(
          join(baseUrl, `/events/${encodeURIComponent(id)}/payout`),
          token,
          { method: 'POST', data: finance },
        )
      ).payoutInfo as import('../../organizer/types/organizer-event.ts').OrganizerEventFinance,

    submitReview: async (token, id) =>
      normalizeEvent(
        (
          await request<{ event: unknown }>(
            join(baseUrl, `/events/${id}/submit-review`),
            token,
            { method: 'POST' },
          )
        ).event,
      ),

    findMine: async (token) =>
      (await request<{ events: unknown[] }>(join(baseUrl, '/events/mine'), token)).events.map(
        normalizeEvent,
      ),

    findMineById: async (token, id) => {
      try {
        const body = await request<{ event: Record<string, unknown> }>(
          join(baseUrl, `/events/mine/${encodeURIComponent(id)}`),
          token,
        )
        const detail = (body.event ?? {}) as Record<string, unknown>
        const rawTicketTypes = detail.ticketTypes
        const ticketTypes = Array.isArray(rawTicketTypes)
          ? rawTicketTypes.map((value) => {
              const ticket = value as Record<string, unknown>
              return {
                id: String(ticket.id),
                name: String(ticket.name ?? ''),
                price: Number(ticket.price ?? 0),
                quantity: Number(ticket.quantity ?? 0),
                description: (ticket.description ?? null) as string | null,
                image: (ticket.image ?? null) as string | null,
                minPerOrder:
                  ticket.minPerOrder === undefined ? undefined : Number(ticket.minPerOrder),
                maxPerOrder:
                  ticket.maxPerOrder === undefined ? undefined : Number(ticket.maxPerOrder),
                saleStartAt: (ticket.saleStartAt ?? null) as string | null,
                saleEndAt: (ticket.saleEndAt ?? null) as string | null,
              }
            })
          : []
        const seatMapValue = detail.seatMap as { imageUrl?: string | null } | null | undefined
        return {
          event: normalizeEvent(detail),
          ticketTypes,
          seatMap: seatMapValue ? { imageUrl: seatMapValue.imageUrl ?? null } : null,
          payoutInfo: (detail.payoutInfo ?? null) as import('../../organizer/types/organizer-event.ts').OrganizerEventFinance | null,
        }
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 409))
          return null
        throw error
      }
    },
    reporting: async (token, id, range) => {
      const params = new URLSearchParams()
      if (range) { params.set('from', range.from); params.set('to', range.to) }
      const query = params.toString()
      const path = `/events/${encodeURIComponent(id)}/reporting${query ? `?${query}` : ''}`
      const body = await request<{ report: Record<string, unknown> }>(join(baseUrl, path), token)
      return normalizeReport(body.report ?? {})
    },
    findPending: async (token) => (await request<{ events: unknown[] }>(join(baseUrl, '/events/pending-review'), token)).events.map(normalizeEvent),
    review: async (token, id, decision, reason) => normalizeEvent((await request<{ event: unknown }>(join(baseUrl, `/events/${id}/review`), token, { method: 'POST', data: { decision, reason } })).event),
    categories: (token) => collection<EventCategory>('/categories', token),
    locations: (token) => collection<EventLocation>('/locations/provinces', token),
    wards: (provinceId, token) => collection<EventLocation>(`/locations/provinces/${encodeURIComponent(provinceId)}/wards`, token),
    uploadImage: async (token, file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Ảnh phải là JPEG, PNG hoặc WebP và không quá 5MB.')
      const body = new FormData(); body.append('file', file)
      return (await request<{ url: string }>(join(baseUrl, '/uploads/events'), token, { method: 'POST', data: body })).url
    },
    createTicketType: async (token, payload) => {
      const resolved = await resolveTicketImage(token, payload, (accessToken, file) => uploadEventImage(baseUrl, accessToken, file))
      const result = await request<{ ticketType: TicketTypeMutationResult }>(join(baseUrl, '/ticket-types'), token, { method: 'POST', data: resolved })
      return result.ticketType
    },
    updateTicketType: async (token, id, payload) => {
      const resolved = await resolveTicketImage(token, payload, (accessToken, file) => uploadEventImage(baseUrl, accessToken, file))
      const result = await request<{ ticketType: TicketTypeMutationResult }>(join(baseUrl, `/ticket-types/${id}`), token, { method: 'PATCH', data: resolved })
      return result.ticketType
    },
    findPublic: async () => (await request<{ events: unknown[] }>(join(baseUrl, '/events'), undefined)).events.map(normalizePublicEvent),
    findPublicById: async (eventId) => {
      try {
        const response = await request<{ event: unknown }>(join(baseUrl, `/events/${encodeURIComponent(eventId)}`), undefined)
        return mapEventDetail(response.event as PublicEventDetailResponse)
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400)) return null
        throw error
      }
    },
  }
}
