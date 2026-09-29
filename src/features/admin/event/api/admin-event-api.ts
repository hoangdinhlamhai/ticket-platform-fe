import { ApiError } from '../../../auth/api/api-error.ts'
import type { AdminEvent, AdminEventDetail, AdminEventReviewDecision } from '../types/admin-event-types.ts'

type Options = { readonly baseUrl: string; readonly fetch: typeof globalThis.fetch }
export type AdminEventApi = ReturnType<typeof createAdminEventApi>

function join(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function request<T>(fetcher: typeof globalThis.fetch, url: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body) headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetcher(url, { ...init, headers })
  } catch {
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Không thể kết nối máy chủ.' })
  }
  if (!response.ok) {
    let message = 'Không thể tải dữ liệu sự kiện.'
    try {
      const body = await response.json() as { message?: string | string[] }
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message
    } catch { /* non-json response */ }
    throw new ApiError({ status: response.status, code: response.status === 401 ? 'UNAUTHENTICATED' : 'ADMIN_EVENT_REQUEST_FAILED', message })
  }
  return response.json() as Promise<T>
}

function normalizeEvent(value: unknown): AdminEvent {
  const event = (value ?? {}) as Record<string, unknown>
  const organizer = (event.organizer ?? {}) as Record<string, unknown>
  const category = (event.category ?? {}) as Record<string, unknown>
  const location = (event.location ?? {}) as Record<string, unknown>
  const province = (location.province ?? {}) as Record<string, unknown>
  const ward = (location.ward ?? {}) as Record<string, unknown>
  return {
    id: String(event.id ?? ''),
    title: String(event.title ?? 'Sự kiện không tên'),
    slug: String(event.slug ?? ''),
    status: String(event.status ?? 'UNKNOWN'),
    visibility: String(event.visibility ?? ''),
    startAt: typeof event.startAt === 'string' ? event.startAt : null,
    endAt: typeof event.endAt === 'string' ? event.endAt : null,
    submittedAt: typeof event.submittedAt === 'string' ? event.submittedAt : null,
    rejectionReason: typeof event.rejectionReason === 'string' ? event.rejectionReason : null,
    createdAt: typeof event.createdAt === 'string' ? event.createdAt : null,
    organizer: { id: String(organizer.id ?? ''), fullName: String(organizer.fullName ?? ''), email: String(organizer.email ?? '') },
    category: { id: String(category.id ?? ''), name: String(category.name ?? '') },
    location: { address: String(location.address ?? ''), province: String(province.name ?? ''), ward: String(ward.name ?? '') },
  }
}

function normalizeDetail(value: unknown): AdminEventDetail {
  const event = (value ?? {}) as Record<string, unknown>
  const result = normalizeEvent(event)
  const reviewer = (event.reviewedBy ?? {}) as Record<string, unknown>
  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes.map((item) => {
    const ticket = item as Record<string, unknown>
    return { id: String(ticket.id ?? ''), name: String(ticket.name ?? ''), description: typeof ticket.description === 'string' ? ticket.description : null, image: typeof ticket.image === 'string' ? ticket.image : null, price: Number(ticket.price ?? 0), quantity: Number(ticket.quantity ?? 0), minPerOrder: Number(ticket.minPerOrder ?? 1), maxPerOrder: Number(ticket.maxPerOrder ?? 10), saleStartAt: typeof ticket.saleStartAt === 'string' ? ticket.saleStartAt : null, saleEndAt: typeof ticket.saleEndAt === 'string' ? ticket.saleEndAt : null }
  }) : []
  return {
    ...result,
    description: typeof event.description === 'string' ? event.description : null,
    thumbnail: typeof event.thumbnail === 'string' ? event.thumbnail : null,
    coverImage: typeof event.coverImage === 'string' ? event.coverImage : null,
    venueName: typeof event.venueName === 'string' ? event.venueName : null,
    confirmationMessage: typeof event.confirmationMessage === 'string' ? event.confirmationMessage : null,
    organizerName: typeof event.organizerName === 'string' ? event.organizerName : null,
    organizerBio: typeof event.organizerBio === 'string' ? event.organizerBio : null,
    organizerLogo: typeof event.organizerLogo === 'string' ? event.organizerLogo : null,
    reviewedAt: typeof event.reviewedAt === 'string' ? event.reviewedAt : null,
    reviewedBy: { id: String(reviewer.id ?? ''), fullName: String(reviewer.fullName ?? ''), email: String(reviewer.email ?? '') },
    ticketTypes,
    seatMap: event.seatMap && typeof event.seatMap === 'object' ? event.seatMap as AdminEventDetail['seatMap'] : null,
    payoutInfo: event.payoutInfo && typeof event.payoutInfo === 'object' ? event.payoutInfo as AdminEventDetail['payoutInfo'] : null,
  }
}

export function createAdminEventApi({ baseUrl, fetch: fetcher }: Options) {
  const get = async <T>(token: string, path: string) => request<T>(fetcher, join(baseUrl, path), token)
  return {
    findAll: async (token: string) => (await get<{ events: unknown[] }>(token, '/admin/events')).events.map(normalizeEvent),
    findPending: async (token: string) => (await get<{ events: unknown[] }>(token, '/admin/events/pending-review')).events.map(normalizeEvent),
    findById: async (token: string, id: string) => normalizeDetail((await get<{ event: unknown }>(token, `/admin/events/${encodeURIComponent(id)}`)).event),
    review: async (token: string, id: string, decision: AdminEventReviewDecision, reason?: string) => normalizeDetail((await request<{ event: unknown }>(fetcher, join(baseUrl, `/admin/events/${encodeURIComponent(id)}/review`), token, { method: 'POST', body: JSON.stringify({ decision, reason }) })).event),
  }
}
