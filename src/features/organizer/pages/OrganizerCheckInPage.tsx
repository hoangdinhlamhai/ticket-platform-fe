import { useMemo, useRef, useState } from 'react'
import { OrganizerCheckInActivity } from '../components/OrganizerCheckInActivity.tsx'
import { OrganizerCheckInCandidateList } from '../components/OrganizerCheckInCandidateList.tsx'
import { OrganizerCheckInResult } from '../components/OrganizerCheckInResult.tsx'
import { OrganizerCheckInSearch } from '../components/OrganizerCheckInSearch.tsx'
import { OrganizerCheckInSummary } from '../components/OrganizerCheckInSummary.tsx'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { classifyOrganizerCheckInLookup } from '../helpers/find-organizer-check-in-candidates.ts'
import { selectOrganizerEventMetrics } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../app/routing/organizer-route.ts'
import type { OrganizerOperationResult, OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  lastOperation: OrganizerOperationResult | null
  onCheckInAttendee: (eventId: string, attendeeId: string) => OrganizerOperationResult | null
  onClearLastOperation: () => void
  onNavigate: (path: OrganizerPath) => void
  workspace: OrganizerWorkspace
}

function messageFor(operation: OrganizerOperationResult | null) {
  if (operation?.kind !== 'check_in') return null
  const messages = { success: 'Check-in mô phỏng thành công. Lượt vào cổng đã được ghi nhận.', already_checked_in: 'Không thể check-in: người này đã check-in trước đó.', revoked: 'Không thể check-in: credential đã bị thu hồi.', wrong_event: 'Không thể check-in: vé không thuộc sự kiện đang mở.', not_found: 'Không tìm thấy người giữ vé trong dữ liệu mô phỏng.' } as const
  return { text: messages[operation.outcome], urgent: operation.outcome !== 'success' }
}

export function OrganizerCheckInPage({ activeRoute, eventId, lastOperation, onCheckInAttendee, onClearLastOperation, onNavigate, workspace }: Props) {
  const [query, setQuery] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const event = workspace.events.find((item) => item.id === eventId)
  const lookup = useMemo(() => classifyOrganizerCheckInLookup(workspace.attendees, workspace.orders, eventId, searchedQuery), [eventId, searchedQuery, workspace.attendees, workspace.orders])
  const selectedAttendee = lookup.attendees.find((item) => item.id === selectedAttendeeId) ?? null
  const eventAttendees = workspace.attendees.filter((item) => item.eventId === eventId)
  const activities = workspace.checkInActivities.filter((item) => item.eventId === eventId)
  const metrics = selectOrganizerEventMetrics(workspace, eventId)
  const scopedOperation = lastOperation?.kind === 'check_in'
    && lastOperation.targetIds.eventId === eventId
    && lastOperation.targetIds.attendeeId === selectedAttendeeId
    ? lastOperation
    : null
  const operationMessage = messageFor(scopedOperation)

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const clearFlow = () => {
    setSearchedQuery('')
    setSelectedAttendeeId(null)
    onClearLastOperation()
  }
  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery)
    clearFlow()
  }
  const search = () => {
    setSearchedQuery(query.trim())
    setSelectedAttendeeId(null)
    onClearLastOperation()
  }
  const reset = () => {
    setQuery('')
    clearFlow()
    searchInputRef.current?.focus()
  }
  const confirm = () => {
    if (!selectedAttendee) return
    onCheckInAttendee(eventId, selectedAttendee.id)
  }
  const lookupMessage = searchedQuery && lookup.kind !== 'matches'
    ? lookup.kind === 'wrong_event'
      ? 'Mã vé hoặc mã đơn này không thuộc sự kiện đang mở. Không có dữ liệu nào bị thay đổi.'
      : 'Không tìm thấy kết quả trong sự kiện này. Hãy kiểm tra lại tên, email, mã vé hoặc mã đơn.'
    : null

  return <div className="mx-auto max-w-7xl space-y-7"><OrganizerPageHeader eyebrow="VẬN HÀNH CỔNG VÀO" title="Check-in mô phỏng"><p>{event.title}. Tra cứu thủ công trong dữ liệu prototype; không có camera, quét QR hay xác minh danh tính.</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} /><OrganizerCheckInSummary attendeeCount={eventAttendees.length} checkedInCount={metrics.checkedInCount} />{operationMessage && <div className={`rounded-lg border p-4 font-bold ${operationMessage.urgent ? 'border-coral-dark bg-paper text-coral-dark' : 'border-blue bg-paper-deep text-blue-deep'}`} role={operationMessage.urgent ? 'alert' : 'status'} aria-live={operationMessage.urgent ? 'assertive' : 'polite'}>{operationMessage.text}</div>}<div className="grid gap-6 lg:grid-cols-2"><div className="space-y-5"><OrganizerCheckInSearch query={query} resultCount={lookup.attendees.length} inputRef={searchInputRef} onChange={changeQuery} onSearch={search} />{lookupMessage && <p className="rounded-lg border border-line bg-surface p-4 text-sm font-bold text-ink-soft" role="status">{lookupMessage}</p>}<OrganizerCheckInCandidateList attendees={lookup.attendees} selectedAttendeeId={selectedAttendeeId} onSelect={setSelectedAttendeeId} /><OrganizerCheckInResult attendee={selectedAttendee} orders={workspace.orders.filter((item) => item.eventId === eventId)} ticketTiers={workspace.ticketTiers.filter((item) => item.eventId === eventId)} onConfirm={confirm} />{(searchedQuery || operationMessage) && <button className="min-h-11 rounded-md border border-line px-4 font-extrabold" type="button" onClick={reset}>Tiếp tục với người khác</button>}</div><OrganizerCheckInActivity activities={activities} attendees={eventAttendees} /></div></div>
}
