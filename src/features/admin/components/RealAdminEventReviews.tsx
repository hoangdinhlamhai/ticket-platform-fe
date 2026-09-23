import { useCallback, useEffect, useMemo, useState } from 'react'
import { createEventApi } from '../../auth/api/event-api.ts'

type ApiEvent = { id: string; title: string; startAt?: string; endAt?: string; venueName?: string; description?: string; submittedAt?: string; status?: string; organizerId?: string; rejectionReason?: string | null }
type Props = { readonly accessToken: string; readonly eventId?: string; readonly navigate: (path: string) => void }
const api = createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })
function eventOf(value: unknown) { return value as ApiEvent }
export function RealAdminEventReviews({ accessToken, eventId, navigate }: Props) {
  const [events, setEvents] = useState<readonly ApiEvent[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reason, setReason] = useState('')
  const reload = useCallback(() => api.findPending(accessToken).then((items) => setEvents(items.map(eventOf))).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Không thể tải danh sách xét duyệt.')), [accessToken])
  useEffect(() => { void reload() }, [reload])
  const selected = useMemo(() => events.find((item) => item.id === eventId), [eventId, events])
  async function decide(decision: 'APPROVED' | 'REJECTED') { if (!selected) return; if (decision === 'REJECTED' && !reason.trim()) { setError('Vui lòng nhập lý do từ chối.'); return }; setBusy(true); setError(''); try { await api.review(accessToken, selected.id, decision, reason); await reload(); navigate('/admin/events/review') } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Không thể cập nhật quyết định.') } finally { setBusy(false) } }
  if (eventId) return <section className="grid gap-4 rounded-lg border border-line bg-surface p-5"><button className="w-fit font-bold underline" type="button" onClick={() => navigate('/admin/events/review')}>Quay lại danh sách</button>{selected ? <><h1 className="text-2xl font-extrabold">{selected.title}</h1><p>{selected.venueName ?? 'Chưa có địa điểm'} · {selected.startAt ? new Date(selected.startAt).toLocaleString('vi-VN') : 'Chưa có thời gian'}</p><p>{selected.description ?? 'Không có mô tả.'}</p><textarea className="min-h-24 rounded border border-line bg-paper p-3" placeholder="Lý do nếu từ chối" value={reason} onChange={(e) => setReason(e.target.value)} /><div className="flex gap-3"><button disabled={busy} className="rounded bg-mint px-4 py-2 font-bold text-success" type="button" onClick={() => void decide('APPROVED')}>Duyệt</button><button disabled={busy} className="rounded bg-error px-4 py-2 font-bold text-paper" type="button" onClick={() => void decide('REJECTED')}>Từ chối</button></div></> : <p>Không tìm thấy hoặc đã được xử lý.</p>}{error && <p className="text-error">{error}</p>}</section>
  return <section className="grid gap-4"><h1 className="text-2xl font-extrabold">Duyệt sự kiện</h1>{error && <p className="text-error">{error}</p>}{events.length ? <div className="grid gap-3">{events.map((item) => <button className="rounded-lg border border-line bg-surface p-4 text-left" type="button" key={item.id} onClick={() => navigate(`/admin/events/${encodeURIComponent(item.id)}/review`)}><strong>{item.title}</strong><span className="block text-sm text-ink-soft">{item.venueName ?? 'Chưa có địa điểm'} · {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('vi-VN') : ''}</span></button>)}</div> : <p className="rounded border border-line bg-surface p-5">Không có sự kiện chờ duyệt.</p>}</section>
}
