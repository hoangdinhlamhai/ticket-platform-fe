import { useEffect, useState } from 'react'
import { createAdminApi } from '../api/admin-api.ts'

type Props = { readonly accessToken: string; readonly kind: 'dashboard' | 'users' | 'events' | 'organizers' | 'orders' | 'payments' | 'refunds' | 'categories' | 'resale' | 'resale-transactions' }
const api = createAdminApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })
export function RealAdminPage({ accessToken, kind }: Props) {
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState('')
  useEffect(() => { let active = true; const load = async () => { try { const result = kind === 'dashboard' ? await api.metrics(accessToken) : kind === 'users' ? await api.users(accessToken) : kind === 'events' ? await api.events(accessToken) : kind === 'organizers' ? await api.organizers(accessToken) : kind === 'orders' ? await api.orders(accessToken) : kind === 'payments' ? await api.payments(accessToken) : kind === 'refunds' ? await api.refunds(accessToken) : kind === 'categories' ? await api.categories(accessToken) : kind === 'resale' ? await api.listings(accessToken) : await api.resaleTransactions(accessToken); if (active) setData(result) } catch (e) { if (active) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu.') } }; void load(); return () => { active = false } }, [accessToken, kind])
  const title = { dashboard: 'Dashboard', users: 'Người dùng', events: 'Tất cả sự kiện', organizers: 'Organizer', orders: 'Orders', payments: 'Payments', refunds: 'Refunds', categories: 'Danh mục', resale: 'Ticket Resale · Listings', 'resale-transactions': 'Ticket Resale · Transactions' }[kind]
  return <section className="grid gap-5"><div><p className="text-sm font-bold uppercase tracking-widest text-ink-soft">Admin</p><h1 className="text-3xl font-extrabold">{title}</h1></div>{error && <p className="rounded border border-error bg-error/10 p-4 text-error">{error}</p>}<pre className="max-h-[32rem] overflow-auto rounded-lg border border-line bg-surface p-5 text-sm">{data ? JSON.stringify(data, null, 2) : 'Dữ liệu đang được tải...'}</pre></section>
}
