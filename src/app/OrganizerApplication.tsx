import { useCallback, useEffect, useRef, useState } from 'react'
import { OrganizerLayout } from './layouts/OrganizerLayout.tsx'
import {
  getOrganizerEventId,
  getOrganizerRoute,
  type OrganizerPath,
} from './routing/organizer-route.ts'
import {
  OrganizerAnalyticsPage,
  OrganizerAttendeesPage,
  OrganizerCheckInPage,
  OrganizerDashboardPage,
  OrganizerEventCreatePage,
  OrganizerEventEditPage,
  OrganizerEventListPage,
  OrganizerEventOverviewPage,
  OrganizerFinancePage,
  OrganizerNotFoundPage,
  OrganizerOrdersPage,
  OrganizerOrganizationSettingsPage,
  OrganizerTicketInventoryPage,
  OrganizerPrototypeNotice,
  type OrganizerEventFormSave,
} from '../features/organizer/index.ts'
import type { OrganizerWorkspaceController } from '../features/organizer/hooks/organizer-workspace-controller.ts'
import type { OrganizerOperationResult } from '../features/organizer/types/organizer-workspace.ts'

type Props = {
  pathname: string
  workspace: OrganizerWorkspaceController
  onExitToAttendee: () => void
  onPathnameChange: (path: OrganizerPath) => void
  registerNavigationGuard: (guard: ((destination: string) => boolean) | null) => void
}

function getOperationNotice(operation: OrganizerOperationResult | null) {
  if (!operation) return ''
  if (operation.kind === 'event_created') return 'Đã lưu bản nháp và hạng vé khởi tạo.'
  if (operation.kind === 'event_updated') return 'Đã lưu thay đổi sự kiện.'
  if (operation.kind === 'event_review_submitted') return 'Đã gửi sự kiện để Admin duyệt.'
  if (operation.kind === 'event_published') return 'Đã xuất bản sự kiện.'
  if (operation.kind === 'ticket_tier_saved') return 'Đã lưu thay đổi hạng vé.'
  if (operation.kind === 'organization_updated') return 'Đã lưu thông tin tổ chức.'
  if (operation.kind === 'event_transition_rejected' || operation.kind === 'inventory_rejected' || operation.kind === 'action_not_supported') {
    return operation.reason ?? 'Không thể thực hiện thao tác này.'
  }
  return ''
}

function OrganizerMissingEventPage({ onNavigate }: { onNavigate: (path: OrganizerPath) => void }) {
  return <OrganizerNotFoundPage eventNotFound onNavigate={onNavigate} />
}

export function OrganizerApplication({ pathname, workspace, onExitToAttendee, onPathnameChange, registerNavigationGuard }: Props) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const dirtyRef = useRef(false)
  const route = getOrganizerRoute(pathname)
  const eventId = getOrganizerEventId(pathname)

  const setDirty = useCallback((isDirty: boolean) => {
    dirtyRef.current = isDirty
    setHasUnsavedChanges(isDirty)
  }, [])

  const discardOrContinue = useCallback(() => {
    if (!dirtyRef.current) return true
    if (!window.confirm('Bạn có thay đổi chưa lưu. Bạn có muốn rời khỏi trang?')) return false
    setDirty(false)
    return true
  }, [setDirty])

  const navigate = useCallback((destination: OrganizerPath) => {
    if (destination === pathname || !discardOrContinue()) return
    workspace.clearLastOperation()
    onPathnameChange(destination)
  }, [discardOrContinue, onPathnameChange, pathname, workspace])

  useEffect(() => {
    registerNavigationGuard((destination) => destination === pathname || discardOrContinue())
    return () => registerNavigationGuard(null)
  }, [discardOrContinue, pathname, registerNavigationGuard])

  useEffect(() => {
    if (!hasUnsavedChanges) return
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [hasUnsavedChanges])

  const exitToAttendee = useCallback(() => {
    if (!discardOrContinue()) return
    workspace.clearLastOperation()
    onExitToAttendee()
  }, [discardOrContinue, onExitToAttendee, workspace])

  const create = useCallback((value: OrganizerEventFormSave) => {
    if (!value.initialTicketTier) return false
    const result = workspace.createEvent(value.input, value.initialTicketTier)
    return result?.kind === 'event_created'
  }, [workspace])

  const update = useCallback((id: string, input: Parameters<typeof workspace.updateEvent>[1]) => {
    const result = workspace.updateEvent(id, input)
    return result?.kind === 'event_updated'
  }, [workspace])

  const eventExists = eventId !== null && workspace.workspace.events.some((event) => event.id === eventId)
  let page
  if (route === 'dashboard') {
    page = <OrganizerDashboardPage workspace={workspace.workspace} onOpenEvent={(id) => navigate(`/organizer/events/${id}`)} onOpenEvents={() => navigate('/organizer/events')} />
  } else if (route === 'events') {
    page = <OrganizerEventListPage workspace={workspace.workspace} onCreate={() => navigate('/organizer/events/new')} onOpenEvent={(id) => navigate(`/organizer/events/${id}`)} />
  } else if (route === 'event-create') {
    page = <OrganizerEventCreatePage onCancel={() => navigate('/organizer/events')} onCreate={create} onDirtyChange={setDirty} />
  } else if (!eventExists && route.startsWith('event-')) {
    page = <OrganizerMissingEventPage onNavigate={navigate} />
  } else if (route === 'event-overview' && eventId) {
    page = <OrganizerEventOverviewPage activeRoute={route} eventId={eventId} onNavigate={navigate} onPublish={workspace.publishEvent} onSubmitReview={workspace.submitEventReview} workspace={workspace.workspace} />
  } else if (route === 'event-edit' && eventId) {
    page = <OrganizerEventEditPage activeRoute={route} eventId={eventId} onDirtyChange={setDirty} onNavigate={navigate} onUpdate={update} workspace={workspace.workspace} />
  } else if (route === 'event-tickets' && eventId) {
    page = <OrganizerTicketInventoryPage activeRoute={route} eventId={eventId} onNavigate={navigate} onSaveTicketTier={workspace.saveTicketTier} onSetSaleStatus={workspace.setTicketSaleStatus} workspace={workspace.workspace} />
  } else if (route === 'event-orders' && eventId) {
    page = <OrganizerOrdersPage activeRoute={route} eventId={eventId} onNavigate={navigate} workspace={workspace.workspace} />
  } else if (route === 'event-attendees' && eventId) {
    page = <OrganizerAttendeesPage activeRoute={route} eventId={eventId} onNavigate={navigate} workspace={workspace.workspace} />
  } else if (route === 'event-check-in' && eventId) {
    page = <OrganizerCheckInPage key={eventId} activeRoute={route} eventId={eventId} lastOperation={workspace.lastOperation} onCheckInAttendee={workspace.checkInAttendee} onClearLastOperation={workspace.clearLastOperation} onNavigate={navigate} workspace={workspace.workspace} />
  } else if (route === 'event-analytics' && eventId) {
    page = <OrganizerAnalyticsPage activeRoute={route} eventId={eventId} onNavigate={navigate} workspace={workspace.workspace} />
  } else if (route === 'finance') {
    page = <OrganizerFinancePage workspace={workspace.workspace} />
  } else if (route === 'settings') {
    page = <OrganizerOrganizationSettingsPage organization={workspace.workspace.organization} onDirtyChange={setDirty} onUpdateOrganization={workspace.updateOrganization} workspace={workspace.workspace} />
  } else {
    page = <OrganizerNotFoundPage onNavigate={navigate} />
  }

  const notice = workspace.lastOperation?.kind === 'check_in' ? '' : getOperationNotice(workspace.lastOperation)
  return <OrganizerLayout activeRoute={route} notice={notice} onAcknowledgeNotice={workspace.clearLastOperation} onExitToAttendee={exitToAttendee} onNavigate={navigate} organizationName={workspace.workspace.organization.name}>
    <div className="space-y-6">
      <OrganizerPrototypeNotice />
      {page}
    </div>
  </OrganizerLayout>
}
