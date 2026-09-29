import { useCallback, useEffect, useState } from 'react'
import { createAdminEventApi } from '../api/admin-event-api.ts'
import type { AdminEventDetail, AdminEventReviewDecision } from '../types/admin-event-types.ts'
import { AdminDecisionDialog, AdminPageHeader, AdminStatusBadge } from '../../components/AdminCommon.tsx'
import { adminStatusLabel, adminStatusTone } from '../../helpers/admin-display.ts'

const api = createAdminEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })
type Props = { readonly accessToken: string; readonly eventId: string; readonly navigate: (path: string) => void }

function dateLabel(value: string | null) {
  if (!value) return 'Chưa có lịch'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Chưa có lịch' : date.toLocaleString('vi-VN')
}

export function AdminEventReviewDetailPage({ accessToken, eventId, navigate }: Props) {
  const [event, setEvent] = useState<AdminEventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [decision, setDecision] = useState<AdminEventReviewDecision | null>(null)
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setEvent(await api.findById(accessToken, eventId)) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải chi tiết sự kiện.') }
    finally { setLoading(false) }
  }, [accessToken, eventId])
  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])
  const review = async (reason: string) => {
    if (!decision || !event) return
    setBusy(true)
    setError('')
    try { setEvent(await api.review(accessToken, event.id, decision, reason)); setDecision(null); navigate('/admin/events/review') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật quyết định.') }
    finally { setBusy(false) }
  }
  if (loading) return <p className="rounded-lg border border-line bg-surface p-6" role="status">Đang tải chi tiết sự kiện...</p>
  if (error && !event) return <section className="grid gap-4"><button className="w-fit font-bold underline" type="button" onClick={() => navigate('/admin/events/review')}>Quay lại danh sách</button><p className="rounded-lg border border-error bg-error/10 p-4 text-error" role="alert">{error}</p></section>
  if (!event) return null
  const isPending = event.status === 'PENDING_REVIEW'
  return <section className="grid gap-5">
    <button className="w-fit font-bold underline" type="button" onClick={() => navigate('/admin/events/review')}>Quay lại danh sách</button>
    <AdminPageHeader eyebrow="Chi tiết sự kiện" title={event.title} actions={<AdminStatusBadge label={adminStatusLabel(event.status)} tone={adminStatusTone(event.status)} />}>
      <p>{event.venueName || event.location.address || 'Chưa có địa điểm'} · {dateLabel(event.startAt)}</p>
    </AdminPageHeader>
    {error && <p className="rounded-lg border border-error bg-error/10 p-4 text-error" role="alert">{error}</p>}
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-line bg-surface p-5"><h2 className="text-xl font-extrabold">Thông tin sự kiện</h2><dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-bold text-ink-soft">Mô tả</dt><dd className="mt-1 whitespace-pre-wrap">{event.description || 'Không có mô tả.'}</dd></div><div><dt className="font-bold text-ink-soft">Thời gian</dt><dd>{dateLabel(event.startAt)} – {dateLabel(event.endAt)}</dd></div><div><dt className="font-bold text-ink-soft">Danh mục</dt><dd>{event.category.name || 'Chưa cập nhật'}</dd></div><div><dt className="font-bold text-ink-soft">Địa điểm</dt><dd>{[event.location.address, event.location.ward, event.location.province].filter(Boolean).join(', ') || 'Chưa cập nhật'}</dd></div></dl></article>
      <article className="rounded-lg border border-line bg-surface p-5"><h2 className="text-xl font-extrabold">Organizer</h2><dl className="mt-4 grid gap-3 text-sm"><div><dt className="font-bold text-ink-soft">Tên</dt><dd>{event.organizer.fullName || event.organizerName || 'Chưa cập nhật'}</dd></div><div><dt className="font-bold text-ink-soft">Email</dt><dd>{event.organizer.email || 'Chưa cập nhật'}</dd></div><div><dt className="font-bold text-ink-soft">Gửi duyệt lúc</dt><dd>{dateLabel(event.submittedAt)}</dd></div></dl></article>
    </div>
    <article className="rounded-lg border border-line bg-surface p-5"><h2 className="text-xl font-extrabold">Loại vé ({event.ticketTypes.length})</h2>{event.ticketTypes.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{event.ticketTypes.map((ticket) => <div className="rounded border border-line p-3" key={ticket.id}><strong>{ticket.name}</strong><p className="m-0 text-sm text-ink-soft">{ticket.quantity} vé · {ticket.price.toLocaleString('vi-VN')}đ</p></div>)}</div> : <p className="text-ink-soft">Chưa có loại vé.</p>}</article>
    {isPending && <div className="flex flex-wrap gap-3"><button disabled={busy} className="min-h-11 rounded bg-mint px-4 font-extrabold text-success disabled:opacity-50" type="button" onClick={() => setDecision('APPROVED')}>Duyệt sự kiện</button><button disabled={busy} className="min-h-11 rounded bg-error px-4 font-extrabold text-paper disabled:opacity-50" type="button" onClick={() => setDecision('REJECTED')}>Từ chối</button></div>}
    <AdminDecisionDialog open={decision !== null} title={decision === 'APPROVED' ? 'Duyệt sự kiện' : 'Từ chối sự kiện'} description={decision === 'APPROVED' ? 'Xác nhận cho phép sự kiện được duyệt.' : 'Vui lòng nhập lý do để từ chối sự kiện.'} confirmLabel={decision === 'APPROVED' ? 'Duyệt' : 'Từ chối'} operation={decision === 'APPROVED' ? 'approve_event' : 'reject_event'} onCancel={() => setDecision(null)} onConfirm={(reason) => void review(reason)} />
  </section>
}
