import { ApiError } from './api-error.ts'
import type { AttendeeUser, AuthErrorResponse, AuthSessionResponse, LoginPayload, RegisterPayload } from './auth-contract.ts'

export type AuthApi = {
  login: (payload: LoginPayload) => Promise<AuthSessionResponse>
  register: (payload: RegisterPayload) => Promise<AuthSessionResponse>
  refresh: () => Promise<AuthSessionResponse>
  logout: () => Promise<void>
  me: (accessToken: string) => Promise<AttendeeUser>
}

type AuthApiOptions = {
  baseUrl: string
  fetch: typeof globalThis.fetch
}

function join(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

async function parseError(response: Response) {
  let payload: AuthErrorResponse | null = null
  try { payload = await response.json() as AuthErrorResponse } catch { /* an unavailable proxy/server may return HTML */ }
  return new ApiError({
    status: response.status,
    code: payload?.code ?? (response.status === 401 ? 'UNAUTHENTICATED' : response.status === 429 ? 'TOO_MANY_REQUESTS' : response.status >= 500 ? 'SERVER_UNAVAILABLE' : 'UNKNOWN_ERROR'),
    message: payload?.message ?? 'Không thể kết nối máy chủ. Vui lòng thử lại.',
    fieldErrors: payload?.fieldErrors,
  })
}

async function request<T>(fetcher: typeof globalThis.fetch, url: string, init: RequestInit): Promise<T> {
  let response: Response
  try { response = await fetcher(url, init) } catch {
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.' })
  }
  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  try { return await response.json() as T } catch {
    throw new ApiError({ status: response.status, code: 'SERVER_UNAVAILABLE', message: 'Máy chủ trả về phản hồi không hợp lệ.' })
  }
}

export function createAuthApi({ baseUrl, fetch: fetcher }: AuthApiOptions): AuthApi {
  const mutation = <T>(path: string, body: unknown) => request<T>(fetcher, join(baseUrl, path), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body),
  })
  return {
    login: (payload) => mutation<AuthSessionResponse>('/auth/login', payload),
    register: (payload) => mutation<AuthSessionResponse>('/auth/register', payload),
    refresh: () => mutation<AuthSessionResponse>('/auth/refresh', {}),
    logout: () => mutation<void>('/auth/logout', {}),
    me: async (accessToken) => {
      const response = await request<{ user: AttendeeUser }>(fetcher, join(baseUrl, '/auth/me'), {
        method: 'GET', headers: { Authorization: `Bearer ${accessToken}` }, credentials: 'include',
      })
      return response.user
    },
  }
}
