export type AuthUser = { readonly id: string; readonly fullName: string; readonly email: string }
export type AuthSession = { readonly user: AuthUser; readonly accessToken: string; readonly expiresIn: number }
export type EventCreateInput = { readonly title: string; readonly startsAt: string; readonly endsAt: string; readonly venue: string; readonly city: string }

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({})) as { message?: string | string[] }
  if (!response.ok) {
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message
    throw new Error(message || `Request failed (${response.status})`)
  }
  return body
}

function slugify(title: string) {
  return title.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'event'
}

export function createAuthApi(baseUrl = '/api', fetcher: FetchLike = fetch) {
  const request = async (path: string, init: RequestInit = {}) => fetcher(`${baseUrl}${path}`, { ...init, headers: { 'content-type': 'application/json', ...init.headers } })
  return {
    async login(input: { email: string; password: string }) {
      return readResponse(await request('/auth/login', { method: 'POST', credentials: 'include', body: JSON.stringify(input) })) as Promise<AuthSession>
    },
    async register(input: { fullName: string; email: string; password: string }) {
      return readResponse(await request('/auth/register', { method: 'POST', credentials: 'include', body: JSON.stringify(input) })) as Promise<AuthSession>
    },
    async createEvent(accessToken: string, input: EventCreateInput) {
      const body = { title: input.title, slug: slugify(input.title), startAt: input.startsAt, endAt: input.endsAt, venueName: input.venue, visibility: 'PUBLIC' }
      return readResponse(await request('/events', { method: 'POST', headers: { authorization: `Bearer ${accessToken}` }, body: JSON.stringify(body) })) as Promise<{ event: unknown }>
    },
  }
}
