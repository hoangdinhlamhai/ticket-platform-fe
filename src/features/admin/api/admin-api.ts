import axiosClient from '../../../api/axiosClient.ts'

type Options = { baseUrl: string; fetch?: typeof globalThis.fetch }
type Query = { q?: string; status?: string; categoryId?: string; page?: number; pageSize?: number }
export type AdminApi = ReturnType<typeof createAdminApi>
function join(base: string, path: string) { return `${base.replace(/\/$/, '')}${path}` }
async function request<T>(_baseUrl: string, url: string, token: string, init: { method?: string; data?: unknown } = {}) {
  const response = await axiosClient.request<T>({ url, method: init.method ?? 'GET', data: init.data, headers: { Authorization: `Bearer ${token}` } })
  return response.data
}
function queryString(params: Query) { const query = new URLSearchParams(); for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== '') query.set(key, String(value)); const result = query.toString(); return result ? `?${result}` : '' }
export function createAdminApi({ baseUrl }: Options) {
  const get = <T>(token: string, path: string, params: Query = {}) => request<T>(baseUrl, join(baseUrl, `${path}${queryString(params)}`), token)
  return {
    metrics: (token: string) => get<{ metrics: Record<string, number | string> }>(token, '/admin/dashboard/metrics'),
    timeline: (token: string) => get<{ series: readonly { date: string; revenue: number; orders: number; tickets: number }[] }>(token, '/admin/dashboard/transactions-timeline'),
    users: (token: string, params: Query = {}) => get<{ users: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/users', params),
    user: (token: string, id: string) => get<{ user: Record<string, unknown> }>(token, `/admin/users/${encodeURIComponent(id)}`),
    setUserStatus: (token: string, id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string) => request<{ user: Record<string, unknown> }>(baseUrl, join(baseUrl, `/admin/users/${encodeURIComponent(id)}/status`), token, { method: 'PATCH', data: { status, reason } }),
    events: (token: string, params: Query = {}) => get<{ events: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/events', params),
    organizers: (token: string, params: Query = {}) => get<{ organizers: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/organizers', params),
    orders: (token: string, params: Query = {}) => get<{ orders: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/orders', params),
    payments: (token: string, params: Query = {}) => get<{ payments: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/payments', params),
    refunds: (token: string, params: Query = {}) => get<{ refunds: readonly Record<string, unknown>[]; total: number; page: number; pageSize: number }>(token, '/admin/refunds', params),
    createRefund: (token: string, orderId: string, amount: number, reason: string) => request<{ refund: Record<string, unknown> }>(baseUrl, join(baseUrl, '/admin/refunds'), token, { method: 'POST', data: { orderId, amount, reason } }),
    decideRefund: (token: string, id: string, decision: 'APPROVED' | 'REJECTED', reason: string) => request<{ refund: Record<string, unknown> }>(baseUrl, join(baseUrl, `/admin/refunds/${encodeURIComponent(id)}/decision`), token, { method: 'POST', data: { decision, reason } }),
    listings: (token: string, params: Query = {}) => get<{ listings: readonly Record<string, unknown>[] }>(token, '/admin/resale/listings', params),
    resaleTransactions: (token: string, params: Query = {}) => get<{ transactions: readonly Record<string, unknown>[] }>(token, '/admin/resale/transactions', params),
    categories: (token: string) => get<{ categories: readonly Record<string, unknown>[] }>(token, '/admin/categories'),
    createCategory: (token: string, name: string, slug: string) => request<{ category: Record<string, unknown> }>(baseUrl, join(baseUrl, '/admin/categories'), token, { method: 'POST', data: { name, slug } }),
    updateCategory: (token: string, id: string, name: string, slug: string) => request<{ category: Record<string, unknown> }>(baseUrl, join(baseUrl, `/admin/categories/${encodeURIComponent(id)}`), token, { method: 'PATCH', data: { name, slug } }),
    deleteCategory: (token: string, id: string) => request<{ id: string }>(baseUrl, join(baseUrl, `/admin/categories/${encodeURIComponent(id)}`), token, { method: 'DELETE' }),
  }
}
