import { useMemo, useState } from 'react'
import { filterAdminCases, filterAdminEvents } from '../helpers/filter-admin-records.ts'
import { adminStatusLabel as statusLabel, adminStatusTone as tone, formatAdminMoney as money } from '../helpers/admin-display.ts'
import type { AdminSensitiveOperation } from '../helpers/admin-transitions.ts'
import type { AdminWorkspaceController } from '../hooks/admin-workspace-controller.ts'
import { shouldUseClientNavigation } from '../../../app/routing/client-navigation.ts'
import type { AdminCase, AdminEvent, AdminReviewDecision, AdminSubjectType } from '../types/admin-records.ts'
import { AdminDataTable } from './AdminDataTable.tsx'
import { AdminDecisionDialog, AdminFilterToolbar, AdminPageHeader, AdminStatusBadge } from './AdminCommon.tsx'

type Decision = { readonly title: string; readonly description: string; readonly confirm: string; readonly operation: AdminSensitiveOperation; readonly submit: (reason: string) => void }
type StatusOption = { readonly value: string; readonly label: string }
const statusOptions = (values: readonly string[]): readonly StatusOption[] => values.map((value) => ({ value, label: statusLabel(value) }))
const eventReviewStatusOptions = statusOptions(['pending_review', 'approved', 'changes_requested', 'rejected'])
const caseStatusOptions = statusOptions(['open', 'investigating', 'waiting_for_information', 'resolved', 'dismissed'])

function ticketPriceRange(event: AdminEvent) {
  const prices = event.ticketTiers.map((tier) => tier.price)
  if (!prices.length) return '—'
  const minimum = Math.min(...prices)
  const maximum = Math.max(...prices)
  return minimum === maximum ? money(minimum) : `${money(minimum)} – ${money(maximum)}`
}

function DecisionDialog({ decision, close }: { readonly decision: Decision | null; readonly close: () => void }) {
  return <AdminDecisionDialog open={Boolean(decision)} title={decision?.title ?? ''} description={decision?.description ?? ''} confirmLabel={decision?.confirm ?? ''} operation={decision?.operation ?? 'approve_event'} onCancel={close} onConfirm={(reason) => { decision?.submit(reason); close() }} />
}

function AdminSelect({ label, value, onChange, values }: { readonly label: string; readonly value: string; readonly onChange: (value: string) => void; readonly values: readonly { readonly value: string; readonly label: string }[] }) {
  return <label className="text-sm font-bold">{label}<select className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3" value={value} onChange={(event) => onChange(event.target.value)}>{values.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
}

export function AdminEventReviewListPage({ controller, navigate }: { readonly controller: AdminWorkspaceController; readonly navigate: (path: string) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('pending_review')
  const [city, setCity] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [organizerId, setOrganizerId] = useState('')
  const [submittedDate, setSubmittedDate] = useState('')
  const events = useMemo(() => filterAdminEvents(controller.workspace.events, controller.workspace.organizers, { query, statuses: status ? [status] : [], city, categoryId, organizerId }).filter((event) => !submittedDate || event.submittedAt.startsWith(submittedDate)), [categoryId, city, controller.workspace.events, controller.workspace.organizers, organizerId, query, status, submittedDate])
  const cities = [...new Set(controller.workspace.events.map((item) => item.city))]

  return <div className="grid gap-6"><AdminPageHeader eyebrow="KIỂM DUYỆT" title="Duyệt sự kiện">Chỉ duyệt trạng thái và ghi lịch sử, không sửa nội dung sự kiện.</AdminPageHeader><AdminFilterToolbar query={query} status={status} statusOptions={eventReviewStatusOptions} resultCount={events.length} onQueryChange={setQuery} onStatusChange={setStatus} /><div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4"><AdminSelect label="Thành phố" value={city} onChange={setCity} values={[{ value: '', label: 'Tất cả thành phố' }, ...cities.map((value) => ({ value, label: value }))]} /><AdminSelect label="Danh mục" value={categoryId} onChange={setCategoryId} values={[{ value: '', label: 'Tất cả danh mục' }, ...controller.workspace.categories.map((item) => ({ value: item.id, label: item.label }))]} /><AdminSelect label="Organizer" value={organizerId} onChange={setOrganizerId} values={[{ value: '', label: 'Tất cả Organizer' }, ...controller.workspace.organizers.map((item) => ({ value: item.id, label: item.name }))]} /><label className="text-sm font-bold">Ngày gửi<input className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3" type="date" value={submittedDate} onChange={(event) => setSubmittedDate(event.target.value)} /></label></div><AdminDataTable label="Danh sách sự kiện chờ duyệt" headers={['Sự kiện', 'Organizer', 'Thời gian', 'Thành phố', 'Khoảng giá vé', 'Lần gửi', 'Trạng thái']} rows={events.map((event) => { const organizer = controller.workspace.organizers.find((item) => item.id === event.organizerId); return { key: event.id, cells: [event.title, <span key="organizer">{organizer?.name ?? 'Không còn khả dụng'}<span className="block text-xs text-ink-soft">{organizer ? statusLabel(organizer.verificationStatus) : ''}</span></span>, new Date(event.startsAt).toLocaleString('vi-VN'), event.city, ticketPriceRange(event), `Lần ${event.submissionNumber} · ${new Date(event.submittedAt).toLocaleDateString('vi-VN')}`, <AdminStatusBadge key="status" label={statusLabel(event.reviewStatus)} tone={tone(event.reviewStatus)} />], onOpen: () => navigate(`/admin/events/${encodeURIComponent(event.id)}/review`) } })} /></div>
}

export function AdminEventReviewDetailPage({ controller, eventId, navigate }: { readonly controller: AdminWorkspaceController; readonly eventId: string; readonly navigate: (path: string) => void }) {
  const event = controller.workspace.events.find((item) => item.id === eventId)
  const [decision, setDecision] = useState<Decision | null>(null)
  if (!event) return <AdminMissingRecord title="Không tìm thấy sự kiện" navigate={navigate} />
  const organizer = controller.workspace.organizers.find((item) => item.id === event.organizerId)
  const decide = (review: AdminReviewDecision) => {
    const config = review === 'approved' ? ['Duyệt sự kiện', 'Sự kiện sẽ chuyển sang trạng thái đã duyệt.', 'Duyệt', 'approve_event'] : review === 'changes_requested' ? ['Yêu cầu chỉnh sửa', 'Organizer cần nhận lý do chỉnh sửa cụ thể.', 'Gửi yêu cầu', 'request_event_changes'] : ['Từ chối sự kiện', 'Quyết định từ chối cần lý do rõ ràng.', 'Từ chối', 'reject_event']
    setDecision({ title: config[0], description: config[1], confirm: config[2], operation: config[3] as AdminSensitiveOperation, submit: (reason) => controller.reviewEvent(event.id, review, reason) })
  }
  return <div className="grid gap-6"><AdminPageHeader eyebrow="KIỂM DUYỆT / CHI TIẾT" title={event.title} actions={<button className="min-h-11 rounded border border-line px-4 font-bold" type="button" onClick={() => navigate('/admin/events/review')}>Quay lại danh sách</button>}>Organizer: {organizer?.name ?? 'Đối tượng không còn khả dụng'} · {event.city} · {new Date(event.startsAt).toLocaleString('vi-VN')}</AdminPageHeader><section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2"><div><h2 className="mt-0 text-xl font-extrabold">Tổng quan & chính sách</h2><p>{event.policy}</p><p><strong>Địa điểm:</strong> {event.venue}</p><p><strong>Trạng thái:</strong> <AdminStatusBadge label={statusLabel(event.reviewStatus)} tone={tone(event.reviewStatus)} /></p></div><div><h2 className="mt-0 text-xl font-extrabold">Organizer & rủi ro</h2><p><strong>Xác minh:</strong> {organizer ? statusLabel(organizer.verificationStatus) : 'Không còn khả dụng'}</p><p><strong>Tài khoản:</strong> {organizer ? statusLabel(organizer.accountStatus) : 'Không còn khả dụng'}</p><ul>{event.riskFlags.length ? event.riskFlags.map((flag) => <li key={flag}>{flag}</li>) : <li>Không có cờ rủi ro trong fixture.</li>}</ul></div></section><section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2"><div><h2 className="mt-0 text-xl font-extrabold">Hạng vé & sức chứa</h2><ul>{event.ticketTiers.map((tier) => <li key={tier.id}>{tier.name}: {tier.soldCount}/{tier.capacity} · {money(tier.price)}</li>)}</ul></div><div><h2 className="mt-0 text-xl font-extrabold">Checklist xét duyệt</h2><ul><li>Đối chiếu chính sách hoàn vé.</li><li>Kiểm tra thời gian, địa điểm và sức chứa.</li><li>Rà soát trạng thái xác minh Organizer và cờ rủi ro.</li></ul></div></section><section className="rounded-lg border border-line bg-surface p-5"><h2 className="mt-0 text-xl font-extrabold">Lịch sử xét duyệt</h2><ol>{event.reviewHistory.map((item) => <li key={item.id}>{item.decision ? `${statusLabel(item.decision)} — ${item.reason ?? 'Không có ghi chú'}` : 'Đã gửi xét duyệt'} · {new Date(item.reviewedAt ?? item.submittedAt).toLocaleString('vi-VN')}</li>)}</ol></section>{event.reviewStatus === 'pending_review' && <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-lg border border-line bg-paper p-4 shadow-lg"><button className="min-h-11 rounded bg-mint px-4 font-extrabold text-success" type="button" onClick={() => decide('approved')}>Duyệt</button><button className="min-h-11 rounded border border-coral px-4 font-extrabold text-coral-dark" type="button" onClick={() => decide('changes_requested')}>Yêu cầu chỉnh sửa</button><button className="min-h-11 rounded bg-error px-4 font-extrabold text-paper" type="button" onClick={() => decide('rejected')}>Từ chối</button></div>}<DecisionDialog decision={decision} close={() => setDecision(null)} /></div>
}

export function AdminCaseListPage({ controller, navigate }: { readonly controller: AdminWorkspaceController; readonly navigate: (path: string) => void }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [severity, setSeverity] = useState('')
  const [subjectType, setSubjectType] = useState('')
  const cases = useMemo(() => filterAdminCases(controller.workspace.cases, { query, statuses: status ? [status] : [], severities: severity ? [severity] : [], subjectTypes: subjectType ? [subjectType as AdminSubjectType] : [] }), [controller.workspace.cases, query, severity, status, subjectType])
  const subjectTypes: readonly AdminSubjectType[] = ['event', 'organizer', 'user', 'order', 'ticket', 'resale', 'refund', 'payout']
  return <div className="grid gap-6"><AdminPageHeader eyebrow="KIỂM DUYỆT" title="Báo cáo & vụ việc">Quản lý hàng đợi chung cho sự kiện, tài khoản, giao dịch và resale.</AdminPageHeader><AdminFilterToolbar query={query} status={status} statusOptions={caseStatusOptions} resultCount={cases.length} onQueryChange={setQuery} onStatusChange={setStatus} /><div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2"><AdminSelect label="Mức độ" value={severity} onChange={setSeverity} values={[{ value: '', label: 'Tất cả mức độ' }, ...['low', 'medium', 'high', 'critical'].map((value) => ({ value, label: statusLabel(value) }))]} /><AdminSelect label="Loại đối tượng" value={subjectType} onChange={setSubjectType} values={[{ value: '', label: 'Tất cả đối tượng' }, ...subjectTypes.map((value) => ({ value, label: value }))]} /></div><AdminDataTable label="Danh sách vụ việc" headers={['Tóm tắt', 'Đối tượng', 'Mức độ', 'Trạng thái']} rows={cases.map((item) => ({ key: item.id, cells: [item.summary, item.subjectType, <AdminStatusBadge key="severity" label={statusLabel(item.severity)} tone={tone(item.severity)} />, <AdminStatusBadge key="status" label={statusLabel(item.status)} tone={tone(item.status)} />], onOpen: () => navigate(`/admin/cases/${encodeURIComponent(item.id)}`) }))} /></div>
}

function adminCaseSubjectPath(workspace: AdminWorkspaceController['workspace'], item: AdminCase): string | null {
  const records: Record<AdminSubjectType, readonly { id: string }[]> = { event: workspace.events, organizer: workspace.organizers, user: workspace.users, order: workspace.orders, ticket: workspace.tickets, resale: workspace.resales, refund: workspace.refunds, payout: workspace.payouts }
  if (!records[item.subjectType].some((record) => record.id === item.subjectId)) return null
  if (item.subjectType === 'event') return `/admin/events/${encodeURIComponent(item.subjectId)}/review`
  if (item.subjectType === 'organizer') return '/admin/organizers'
  if (item.subjectType === 'user') return '/admin/users'
  if (item.subjectType === 'order') return '/admin/orders'
  if (item.subjectType === 'ticket') return '/admin/tickets'
  if (item.subjectType === 'resale') return '/admin/resale'
  if (item.subjectType === 'refund') return '/admin/refunds'
  return '/admin/payouts'
}

export function AdminCaseDetailPage({ controller, caseId, navigate }: { readonly controller: AdminWorkspaceController; readonly caseId: string; readonly navigate: (path: string) => void }) {
  const item = controller.workspace.cases.find((caseItem) => caseItem.id === caseId)
  const [decision, setDecision] = useState<Decision | null>(null)
  if (!item) return <AdminMissingRecord title="Không tìm thấy vụ việc" navigate={navigate} />
  const terminal = item.status === 'resolved' || item.status === 'dismissed'
  const subjectPath = adminCaseSubjectPath(controller.workspace, item)
  return <div className="grid gap-6"><AdminPageHeader eyebrow="VỤ VIỆC / CHI TIẾT" title={item.summary} actions={<button className="min-h-11 rounded border border-line px-4 font-bold" type="button" onClick={() => navigate('/admin/cases')}>Quay lại danh sách</button>}>Người báo cáo: {item.reporter} · {item.category} · <AdminStatusBadge label={statusLabel(item.severity)} tone={tone(item.severity)} /></AdminPageHeader><section className="rounded-lg border border-line bg-surface p-5"><h2 className="mt-0 text-xl font-extrabold">Đối tượng liên quan</h2><p>{subjectPath ? <a className="font-bold text-blue-deep underline" href={subjectPath} onClick={(event) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); navigate(subjectPath) }}>{item.subjectType}: {item.subjectId}</a> : 'Đối tượng không còn khả dụng'}</p><h2 className="text-xl font-extrabold">Bằng chứng</h2><ul>{item.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul></section><section className="rounded-lg border border-line bg-surface p-5"><h2 className="mt-0 text-xl font-extrabold">Timeline</h2><ol>{item.timeline.map((entry) => <li key={entry.id}>{entry.message} · {new Date(entry.occurredAt).toLocaleString('vi-VN')}</li>)}</ol></section>{!terminal && <div className="flex flex-wrap gap-3"><button className="min-h-11 rounded border border-blue px-4 font-bold text-blue-deep" type="button" onClick={() => controller.updateCaseStatus(item.id, 'investigating', '')}>Đang điều tra</button><button className="min-h-11 rounded border border-blue px-4 font-bold text-blue-deep" type="button" onClick={() => controller.updateCaseStatus(item.id, 'waiting_for_information', '')}>Chờ thông tin</button><button className="min-h-11 rounded bg-mint px-4 font-extrabold text-success" type="button" onClick={() => setDecision({ title: 'Giải quyết vụ việc', description: 'Ghi chú xử lý là bắt buộc.', confirm: 'Giải quyết', operation: 'resolve_case', submit: (reason) => controller.updateCaseStatus(item.id, 'resolved', reason) })}>Giải quyết</button><button className="min-h-11 rounded bg-error px-4 font-extrabold text-paper" type="button" onClick={() => setDecision({ title: 'Bác bỏ vụ việc', description: 'Ghi chú xử lý là bắt buộc.', confirm: 'Bác bỏ', operation: 'dismiss_case', submit: (reason) => controller.updateCaseStatus(item.id, 'dismissed', reason) })}>Bác bỏ</button></div>}<DecisionDialog decision={decision} close={() => setDecision(null)} /></div>
}

export function AdminMissingRecord({ title, navigate }: { readonly title: string; readonly navigate: (path: string) => void }) {
  return <section className="rounded-lg border border-dashed border-line bg-surface p-8"><AdminPageHeader eyebrow="KHÔNG TÌM THẤY" title={title}>Bản ghi không tồn tại trong fixture Admin hiện tại.</AdminPageHeader><button className="mt-5 min-h-11 rounded bg-pine px-4 font-extrabold text-paper" type="button" onClick={() => navigate('/admin')}>Về Tổng quan</button></section>
}
