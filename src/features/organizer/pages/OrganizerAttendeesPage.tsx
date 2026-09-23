import { useMemo, useState } from 'react'
import { OrganizerAttendeeDetailDrawer } from '../components/OrganizerAttendeeDetailDrawer.tsx'
import { OrganizerAttendeeFilters } from '../components/OrganizerAttendeeFilters.tsx'
import { OrganizerAttendeeTable } from '../components/OrganizerAttendeeTable.tsx'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { filterOrganizerAttendees, type OrganizerAttendeeFilters as FilterState } from '../helpers/filter-organizer-attendees.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../routes/organizer-route.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  workspace: OrganizerWorkspace
}

const initialFilters: FilterState = {
  query: '',
  credentialStatus: 'all',
  source: 'all',
  ticketTierId: 'all',
}

export function OrganizerAttendeesPage({ activeRoute, eventId, onNavigate, workspace }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(null)
  const [exportNotice, setExportNotice] = useState('')
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)
  const event = workspace.events.find((item) => item.id === eventId)
  const eventAttendees = useMemo(() => workspace.attendees.filter((attendee) => attendee.eventId === eventId), [eventId, workspace.attendees])
  const ticketTiers = useMemo(() => workspace.ticketTiers.filter((tier) => tier.eventId === eventId), [eventId, workspace.ticketTiers])
  const attendees = useMemo(() => filterOrganizerAttendees(workspace.attendees, workspace.orders, eventId, filters), [eventId, filters, workspace.attendees, workspace.orders])

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const changeFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }
  const openAttendee = (attendeeId: string, opener: HTMLElement) => {
    setReturnFocus(opener)
    setSelectedAttendeeId(attendeeId)
  }

  return <div className="mx-auto max-w-7xl space-y-7"><OrganizerPageHeader eyebrow="VẬN HÀNH KHÁCH" title="Người tham dự" actions={<button className="min-h-11 rounded-md border border-blue px-4 font-extrabold text-blue-deep" type="button" onClick={() => setExportNotice('Xuất CSV sẽ được bổ sung sau; chưa có tệp nào được tạo.')}>Xuất CSV</button>}><p>{event.title}. Phân biệt người mua và người giữ vé; dữ liệu chỉ đọc trong prototype.</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />{exportNotice && <p className="rounded-md border border-blue bg-paper-deep p-3 text-sm font-bold text-blue-deep" role="status">{exportNotice}</p>}<OrganizerAttendeeFilters filters={filters} onChange={changeFilter} onReset={() => setFilters(initialFilters)} ticketTiers={ticketTiers} />{attendees.length ? <OrganizerAttendeeTable attendees={attendees} onOpen={openAttendee} orders={workspace.orders.filter((order) => order.eventId === eventId)} ticketTiers={ticketTiers} /> : <OrganizerEmptyState title={eventAttendees.length ? 'Không tìm thấy người tham dự phù hợp' : 'Chưa có người tham dự'} description={eventAttendees.length ? 'Thử đặt lại bộ lọc hoặc thay đổi từ khóa tìm kiếm.' : 'Người tham dự sẽ xuất hiện ở đây khi đơn hàng tạo vé.'} />}{selectedAttendeeId && <OrganizerAttendeeDetailDrawer attendeeId={selectedAttendeeId} attendees={eventAttendees} orders={workspace.orders.filter((order) => order.eventId === eventId)} returnFocus={returnFocus} ticketTiers={ticketTiers} onClose={() => setSelectedAttendeeId(null)} />}</div>
}
