import { useCallback, useEffect, useRef, useState } from 'react'
import { OrganizerLayout } from '../layouts/OrganizerLayout.tsx'
import {
  getOrganizerEventId,
  getOrganizerRoute,
  type OrganizerPath,
} from '../routes/organizer-route.ts'
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
  type OrganizerEventFormSave,
} from '../features/organizer/index.ts'
import type { OrganizerWorkspaceController } from '../features/organizer/hooks/organizer-workspace-controller.ts'
import { resolveOrganizerCreateRedirect } from '../features/organizer/helpers/resolve-organizer-create-redirect.ts'
import type { OrganizerOperationResult } from '../features/organizer/types/organizer-workspace.ts'

type Props = {
  pathname: string
  workspace: OrganizerWorkspaceController
  onExitToAttendee: () => void
  onPathnameChange: (path: OrganizerPath) => void
  // Navigates while keeping the workspace's lastOperation intact, so a confirmed
  // event_created notice survives the redirect to the My-events list.
  onNavigatePreservingNotice: (path: OrganizerPath) => void
  registerNavigationGuard: (guard: ((destination: string) => boolean) | null) => void
}

function getOperationNotice(operation: OrganizerOperationResult | null) {
  if (!operation) return ''
  if (operation.kind === 'event_created') return 'Đã gửi sự kiện. Sự kiện đang chờ Admin duyệt.'
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

export function OrganizerApplication({ pathname, workspace, onExitToAttendee, onPathnameChange, onNavigatePreservingNotice, registerNavigationGuard }: Props) {
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

  const create = useCallback(async (value: OrganizerEventFormSave) => {
    console.log('[OrganizerApplication] create nhan duoc value tu form:', value)
    const result = await workspace.createEvent(value.input, value.initialTicketTiers ?? [], value.finance)
    console.log('[OrganizerApplication] createEvent result:', result)
    // Only a confirmed, server-persisted event_created redirects. A failed, null, or
    // stale-account result keeps the user in the form with the visible error and its
    // dirty state intact (no navigation, no unsaved-guard clear).
    const redirect = resolveOrganizerCreateRedirect(result)
    console.log('[OrganizerApplication] resolveOrganizerCreateRedirect:', redirect)
    if (!redirect) return false
    // Clear the unsaved guard ONLY after the confirmed create, before navigating, so the
    // redirect never trips the "thay đổi chưa lưu" prompt. Preserve the success notice by
    // routing through the notice-preserving navigate (the normal navigate clears it).
    setDirty(redirect.clearDirtyFirst ? false : dirtyRef.current)
    onNavigatePreservingNotice(redirect.path)
    return true
  }, [onNavigatePreservingNotice, setDirty, workspace])

  const update = useCallback(async (id: string, input: Parameters<typeof workspace.updateEvent>[1], finance?: Parameters<typeof workspace.updateEvent>[2]) => {
    const result = await workspace.updateEvent(id, input, finance)
    return result?.kind === 'event_updated'
  }, [workspace])

  const eventExists = eventId !== null && workspace.workspace.events.some((event) => event.id === eventId)
  let page
  if (route === 'dashboard') {
    page = <OrganizerDashboardPage workspace={workspace.workspace} onOpenEvent={(id) => navigate(`/organizer/events/${id}`)} onOpenEvents={() => navigate('/organizer/events')} />
  } else if (route === 'events') {
    page = <OrganizerEventListPage workspace={workspace.workspace} loading={workspace.loading} loadError={workspace.loadError} onRetry={workspace.retry} onCreate={() => navigate('/organizer/events/new')} onOpenEvent={(id) => navigate(`/organizer/events/${id}`)} />
  } else if (route === 'event-create') {
    page = <OrganizerEventCreatePage onCancel={() => navigate('/organizer/events')} onCreate={create} onDirtyChange={setDirty} saving={workspace.isSaving} error={workspace.saveError} />
  } else if (!eventExists && route.startsWith('event-')) {
    page = <OrganizerMissingEventPage onNavigate={navigate} />
  } else if (route === 'event-overview' && eventId) {
    page = <OrganizerEventOverviewPage activeRoute={route} eventId={eventId} onNavigate={navigate} onPublish={workspace.publishEvent} onSubmitReview={workspace.submitEventReview} workspace={workspace.workspace} />
  } else if (route === 'event-edit' && eventId) {
    page = <OrganizerEventEditPage activeRoute={route} eventId={eventId} onDirtyChange={setDirty} onNavigate={navigate} onUpdate={update} workspace={workspace.workspace} />
  } else if (route === 'event-tickets' && eventId) {
    page = <OrganizerTicketInventoryPage activeRoute={route} eventId={eventId} onNavigate={navigate} onSaveTicketTier={async (tier) => { await workspace.saveTicketTier(tier) }} onSetSaleStatus={workspace.setTicketSaleStatus} onUpdateEventImage={workspace.updateEventImage} workspace={workspace.workspace} />
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
    {page}
  </OrganizerLayout>
}
