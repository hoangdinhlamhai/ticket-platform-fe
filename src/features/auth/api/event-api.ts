import { ApiError } from './api-error.ts'
import type { OrganizerEvent, OrganizerEventInput } from '../../organizer/types/organizer-event.ts'
import type { MockEvent, EventCategory as AttendeeEventCategory, EventPosterTone } from '../../events/types/event.ts'
import { mapEventDetail, type PublicEventDetailResponse } from '../../events/helpers/map-event-detail.ts'

export type EventCreatePayload = OrganizerEventInput & { readonly slug?: string; readonly categoryId: string; readonly locationId: string }
export type EventCategory = { readonly id: string; readonly name?: string; readonly label?: string }
export type EventLocation = { readonly id: string; readonly name?: string; readonly label?: string }
export type TicketTypePayload = { readonly eventId: string; readonly name: string; readonly price: number; readonly quantity: number; readonly description?: string; readonly image?: string; readonly maxPerOrder: number; readonly minPerOrder: number; readonly saleStartAt: string; readonly saleEndAt: string }

export type EventApi = {
  create: (accessToken: string, payload: EventCreatePayload) => Promise<OrganizerEvent>
  update: (accessToken: string, eventId: string, payload: Partial<EventCreatePayload>) => Promise<OrganizerEvent>
  submitReview: (accessToken: string, eventId: string) => Promise<OrganizerEvent>
  findMine: (accessToken: string) => Promise<readonly OrganizerEvent[]>
  findPending: (accessToken: string) => Promise<readonly OrganizerEvent[]>
  review: (accessToken: string, eventId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) => Promise<OrganizerEvent>
  categories: (accessToken?: string) => Promise<readonly EventCategory[]>
  locations: (accessToken?: string) => Promise<readonly EventLocation[]>
  uploadImage: (accessToken: string, file: File, onProgress?: (progress: number) => void) => Promise<string>
  createTicketType: (accessToken: string, payload: TicketTypePayload) => Promise<unknown>
  updateTicketType: (accessToken: string, ticketTypeId: string, payload: Partial<TicketTypePayload>) => Promise<unknown>
  findPublic: () => Promise<readonly MockEvent[]>
  findPublicById: (eventId: string) => Promise<import('../../events/types/event.ts').MockEventDetail | null>
}

type Options = { baseUrl: string; fetch: typeof globalThis.fetch }
function join(baseUrl: string, path: string) { return `${baseUrl.replace(/\/$/, '')}${path}` }
function slugify(value: string) { return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 110) || 'event' }
async function request<T>(fetcher: typeof globalThis.fetch, url: string, token: string | undefined, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    response = await fetcher(url, { ...init, headers }) } catch { throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.' }) }
  if (!response.ok) { let message = 'Không thể lưu sự kiện. Vui lòng thử lại.'; try { const body = await response.json() as { message?: string | string[] }; message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message } catch { /* non-json */ }; throw new ApiError({ status: response.status, code: response.status === 401 ? 'UNAUTHENTICATED' : 'EVENT_REQUEST_FAILED', message }) }
  return await response.json() as T
}
function eventBody(payload: Partial<EventCreatePayload>) { const { title, startsAt, endsAt, venue, description, thumbnail, organizerName, organizerBio, organizerLogo, visibility, confirmationMessage, seatingChartImage, categoryId, locationId, slug } = payload; return { title, slug: slug ?? (title ? slugify(title) : undefined), startAt: startsAt, endAt: endsAt, venueName: venue || undefined, description, thumbnail, organizerName, organizerBio, organizerLogo, visibility: visibility === 'link_only' ? 'LINK_ONLY' : visibility === 'public' ? 'PUBLIC' : undefined, confirmationMessage, seatingChartImage, categoryId, locationId } }
export function dataUrlFile(value: string, name: string): File | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(value)
  if (!match) return null
  const bytes = Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0))
  return new File([bytes], name, { type: match[1] })
}

async function resolveImages(token: string, payload: Partial<EventCreatePayload>, upload: (token: string, file: File) => Promise<string>) {
  const next = { ...payload }
  for (const [key, name] of [['thumbnail', 'thumbnail'], ['organizerLogo', 'organizer-logo'], ['seatingChartImage', 'seating-chart']] as const) {
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

function uploadEventImage(fetcher: typeof globalThis.fetch, baseUrl: string, token: string, file: File) {
  const body = new FormData()
  body.append('file', file)
  return request<{ url: string }>(fetcher, join(baseUrl, '/uploads/events'), token, { method: 'POST', body }).then((result) => result.url)
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
  const statusMap: Record<string, OrganizerEvent['status']> = { DRAFT: 'draft', PENDING_REVIEW: 'pending_review', REJECTED: 'rejected', APPROVED: 'approved', PUBLISHED: 'published' }
  return { id: String(event.id), title: String(event.title ?? ''), startsAt: String(event.startAt ?? event.startsAt ?? ''), endsAt: String(event.endAt ?? event.endsAt ?? ''), venue: String(event.venueName ?? event.venue ?? ''), city: String(event.city ?? ''), status: statusMap[status] ?? (status as OrganizerEvent['status']), reviewFeedback: (event.rejectionReason ?? event.reviewFeedback ?? null) as string | null, thumbnail: event.thumbnail as string | undefined, category: typeof event.category === 'object' && event.category !== null ? String((event.category as Record<string, unknown>).name ?? event.categoryId ?? '') : String(event.category ?? event.categoryId ?? ''), provinceId: event.locationId as string | undefined, description: event.description as string | undefined, organizerName: event.organizerName as string | undefined, organizerBio: event.organizerBio as string | undefined, organizerLogo: event.organizerLogo as string | undefined, visibility: event.visibility === 'LINK_ONLY' ? 'link_only' : event.visibility === 'PUBLIC' ? 'public' : event.visibility as OrganizerEvent['visibility'], confirmationMessage: event.confirmationMessage as string | undefined, seatingChartImage: event.seatingChartImage as string | undefined }
}
export function createEventApi({ baseUrl, fetch: fetcher }: Options): EventApi {
  const collection = async <T>(path: string, token?: string) => {
    const body = await request<Record<string, T[]>>(fetcher, join(baseUrl, path), token)
    const key = path.includes('categories') ? 'categories' : path.includes('provinces') ? 'provinces' : path.includes('locations') ? 'locations' : 'events'
    return body[key] ?? []
  }
  return {
    create: async (token, payload) => { const resolved = await resolveImages(token, payload, (accessToken, file) => (async () => { const body = new FormData(); body.append('file', file); return (await request<{ url: string }>(fetcher, join(baseUrl, '/uploads/events'), accessToken, { method: 'POST', body })).url })()); return normalizeEvent((await request<{ event: unknown }>(fetcher, join(baseUrl, '/events'), token, { method: 'POST', body: JSON.stringify(eventBody(resolved)) })).event) },
    update: async (token, id, payload) => { const resolved = await resolveImages(token, payload, (accessToken, file) => (async () => { const body = new FormData(); body.append('file', file); return (await request<{ url: string }>(fetcher, join(baseUrl, '/uploads/events'), accessToken, { method: 'POST', body })).url })()); return normalizeEvent((await request<{ event: unknown }>(fetcher, join(baseUrl, `/events/${id}`), token, { method: 'PATCH', body: JSON.stringify(eventBody(resolved)) })).event) },
    submitReview: async (token, id) => normalizeEvent((await request<{ event: unknown }>(fetcher, join(baseUrl, `/events/${id}/submit-review`), token, { method: 'POST' })).event),
    findMine: async (token) => (await request<{ events: unknown[] }>(fetcher, join(baseUrl, '/events/mine'), token)).events.map(normalizeEvent),
    findPending: async (token) => (await request<{ events: unknown[] }>(fetcher, join(baseUrl, '/events/pending-review'), token)).events.map(normalizeEvent),
    review: async (token, id, decision, reason) => normalizeEvent((await request<{ event: unknown }>(fetcher, join(baseUrl, `/events/${id}/review`), token, { method: 'POST', body: JSON.stringify({ decision, reason }) })).event),
    categories: (token) => collection<EventCategory>('/categories', token),
    locations: (token) => collection<EventLocation>('/locations/provinces', token),
    uploadImage: async (token, file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new ApiError({ status: 400, code: 'VALIDATION_ERROR', message: 'Ảnh phải là JPEG, PNG hoặc WebP và không quá 5MB.' })
      const body = new FormData(); body.append('file', file)
      return (await request<{ url: string }>(fetcher, join(baseUrl, '/uploads/events'), token, { method: 'POST', body })).url
    },
    createTicketType: async (token, payload) => {
      const resolved = await resolveTicketImage(token, payload, (accessToken, file) => uploadEventImage(fetcher, baseUrl, accessToken, file))
      return request(fetcher, join(baseUrl, '/ticket-types'), token, { method: 'POST', body: JSON.stringify(resolved) })
    },
    updateTicketType: async (token, id, payload) => {
      const resolved = await resolveTicketImage(token, payload, (accessToken, file) => uploadEventImage(fetcher, baseUrl, accessToken, file))
      return request(fetcher, join(baseUrl, `/ticket-types/${id}`), token, { method: 'PATCH', body: JSON.stringify(resolved) })
    },
    findPublic: async () => (await request<{ events: unknown[] }>(fetcher, join(baseUrl, '/events'), undefined)).events.map(normalizePublicEvent),
    findPublicById: async (eventId) => {
      try {
        const response = await request<{ event: unknown }>(fetcher, join(baseUrl, `/events/${encodeURIComponent(eventId)}`), undefined)
        return mapEventDetail(response.event as PublicEventDetailResponse)
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null
        throw error
      }
    },
  }
}
