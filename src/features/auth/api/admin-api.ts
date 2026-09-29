import { ApiError } from './api-error.ts'

type Options = { baseUrl: string; fetch: typeof globalThis.fetch }
type Query = { q?: string; status?: string; categoryId?: string; page?: number; pageSize?: number }
export type AdminApi = ReturnType<typeof createAdminApi>
function join(base: string, path: string) { return `${base.replace(/\/$/, '')}${path}` }
async function request<T>(fetcher: typeof globalThis.fetch, url: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  if (init.body) headers.set('Content-Type', 'application/json')
  let response: Response
  try { response = await fetcher(url, { ...init, headers }) } catch { throw new ApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Không thể kết nối máy chủ.' }) }
  if (!response.ok) {
    let message = 'Không thể tải dữ liệu Admin.'
    try { const body = await response.json() as { message?: string | string[] }; message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message } catch { /* non-json response */ }
    throw new ApiError({ status: response.status, code: response.status === 401 ? 'UNAUTHENTICATED' : 'ADMIN_REQUEST_FAILED', message })
  }
  return response.json() as Promise<T>
}
function queryString(params: Query) { const query = new URLSearchParams(); for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, String(value)); const result = query.toString(); return result ? `?${result}` : '' }
export function createAdminApi({ baseUrl, fetch: fetcher }: Options) {
  const get = <T>(token: string, path: string, params: Query = {}) => request<T>(fetcher, join(baseUrl, `${path}${queryString(params)}`), token)
  return {
    metrics: (token: string) => get<{ metrics: Record<string, number | string> }>(token, '/admin/dashboard/metrics'),
    timeline: (token: string) => get<{ series: readonly { date: string; revenue: number; orders: number; tickets: number }[] }>(token, '/admin/dashboard/transactions-timeline'),
    users: (token: string, params: Query = {}) => get<{ users: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/users', params),
    user: (token: string, id: string) => get<{ user: Record<string, unknown> }>(token, `/admin/users/${encodeURIComponent(id)}`),
    setUserStatus: (token: string, id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string) => request<{ user: Record<string, unknown> }>(fetcher, join(baseUrl, `/admin/users/${encodeURIComponent(id)}/status`), token, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),
    events: (token: string, params: Query = {}) => get<{ events: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/events', params),
    organizers: (token: string, params: Query = {}) => get<{ organizers: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/organizers', params),
    orders: (token: string, params: Query = {}) => get<{ orders: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/orders', params),
    payments: (token: string, params: Query = {}) => get<{ payments: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/payments', params),
    refunds: (token: string, params: Query = {}) => get<{ refunds: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/refunds', params),
    createRefund: (token: string, orderId: string, amount: number, reason: string) => request<{ refund: Record<string, unknown> }>(fetcher, join(baseUrl, '/admin/refunds'), token, { method: 'POST', body: JSON.stringify({ orderId, amount, reason }) }),
    decideRefund: (token: string, id: string, decision: 'APPROVED' | 'REJECTED', reason: string) => request<{ refund: Record<string, unknown> }>(fetcher, join(baseUrl, `/admin/refunds/${encodeURIComponent(id)}/decision`), token, { method: 'POST', body: JSON.stringify({ decision, reason }) }),
    listings: (token: string, params: Query = {}) => get<{ listings: readonly Record<string, unknown>[] }>(token, '/admin/resale/listings', params),
    resaleTransactions: (token: string, params: Query = {}) => get<{ transactions: readonly Record<string, unknown>[] }>(token, '/admin/resale/transactions', params),
    categories: (token: string) => get<{ categories: readonly Record<string, unknown>[] }>(token, '/admin/categories'),
    createCategory: (token: string, name: string, slug: string) => request<{ category: Record<string, unknown> }>(fetcher, join(baseUrl, '/admin/categories'), token, { method: 'POST', body: JSON.stringify({ name, slug }) }),
    updateCategory: (token: string, id: string, name: string, slug: string) => request<{ category: Record<string, unknown> }>(fetcher, join(baseUrl, `/admin/categories/${encodeURIComponent(id)}`), token, { method: 'PATCH', body: JSON.stringify({ name, slug }) }),
    deleteCategory: (token: string, id: string) => request<{ id: string }>(fetcher, join(baseUrl, `/admin/categories/${encodeURIComponent(id)}`), token, { method: 'DELETE' }),
  }
}
